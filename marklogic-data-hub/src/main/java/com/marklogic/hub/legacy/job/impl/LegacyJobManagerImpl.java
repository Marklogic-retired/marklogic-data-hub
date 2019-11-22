/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.legacy.job.impl;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.datamovement.*;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.ext.datamovement.consumer.WriteToZipConsumer;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonDatabindHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.legacy.job.Job;
import com.marklogic.hub.legacy.job.JobDeleteResponse;
import com.marklogic.hub.legacy.job.JobExportResponse;
import com.marklogic.hub.legacy.job.LegacyJobManager;

import javax.xml.namespace.QName;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Scanner;
import java.util.TimeZone;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class LegacyJobManagerImpl implements LegacyJobManager {

    private DatabaseClient jobClient;
    private JSONDocumentManager docMgr;
    private JobDeleteResource jobDeleteRunner = null;

    private static final String ISO_8601_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX";
    private static SimpleDateFormat simpleDateFormat8601;
    static {
        try {
            simpleDateFormat8601 = new SimpleDateFormat(ISO_8601_FORMAT);
            // Java 1.6 doesn't yet know about X (ISO 8601 format)
        } catch (IllegalArgumentException e) {
            if ( "Illegal pattern character 'X'".equals(e.getMessage()) ) {
                simpleDateFormat8601 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
            }
        }
    }
    static { simpleDateFormat8601.setTimeZone(TimeZone.getTimeZone("UTC")); }
    private ObjectMapper objectMapper = new ObjectMapper()
        // if we don't do the next two lines Jackson will automatically close our streams which is undesirable
        .configure(JsonGenerator.Feature.AUTO_CLOSE_TARGET, false)
        .configure(JsonParser.Feature.AUTO_CLOSE_SOURCE, false)
        // we do the next two so dates are written in xs:dateTime format
        // which makes them ready for range indexes in MarkLogic Server
        .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
        .setDateFormat(simpleDateFormat8601);

    public LegacyJobManagerImpl(DatabaseClient jobClient) {
        this.jobClient = jobClient;
        this.docMgr = jobClient.newJSONDocumentManager();
        this.jobDeleteRunner = new JobDeleteResource(jobClient);
    }

    @Override public void saveJob(Job job) {
        saveJob(job, null);
    }

    @Override public void saveJob(Job job, Transaction transaction) {
        JacksonDatabindHandle<Job> contentHandle = new JacksonDatabindHandle<>(job);
        contentHandle.setMapper(objectMapper);
        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle = metadataHandle.withCollections("job");
        DocumentWriteSet writeSet = docMgr.newWriteSet();
        writeSet.add("/jobs/" + job.getJobId() + ".json", metadataHandle, contentHandle);
        docMgr.write(writeSet, transaction);
    }

    @Override public JobDeleteResponse deleteJobs(String jobIds) {
        return this.jobDeleteRunner.deleteJobs(jobIds);
    }

    @Override public JobExportResponse exportJobs(Path exportFilePath, String[] jobIds) {
        JobExportResponse response = new JobExportResponse();
        response.fullPath = exportFilePath.toAbsolutePath().toString();

        File zipFile = exportFilePath.toFile();
        WriteToZipConsumer zipConsumer = new WriteToZipConsumer(zipFile);

        QueryManager qm = jobClient.newQueryManager();

        // Build a query that will match everything
        StringQueryDefinition emptyQuery = qm.newStringDefinition();
        emptyQuery.setCriteria("");

        // Get the job(s) document(s)
        StructuredQueryBuilder sqb = qm.newStructuredQueryBuilder();
        DataMovementManager dmm = jobClient.newDataMovementManager();
        QueryBatcher batcher = null;
        StructuredQueryDefinition query = null;
        if (jobIds == null) {
            batcher = dmm.newQueryBatcher(emptyQuery);
        }
        else {
            batcher = dmm.newQueryBatcher(sqb.value(sqb.jsonProperty("jobId"), jobIds));
        }
        batcher.onUrisReady(new ExportListener().onDocumentReady(zipConsumer));
        JobTicket jobTicket = dmm.startJob(batcher);

        batcher.awaitCompletion();
        dmm.stopJob(batcher);
        dmm.release();

        JobReport report = dmm.getJobReport(jobTicket);
        long jobCount = report.getSuccessEventsCount();
        response.totalJobs = jobCount;

        if (jobCount > 0) {

            // Get the traces that go with the job(s)
            dmm = this.jobClient.newDataMovementManager();
            if (jobIds == null) {
                batcher = dmm.newQueryBatcher(emptyQuery);
            }
            else {
                batcher = dmm.newQueryBatcher(sqb.value(sqb.element(new QName("jobId")), jobIds));
            }
            batcher.onUrisReady(new ExportListener().onDocumentReady(zipConsumer));
            jobTicket = dmm.startJob(batcher);

            batcher.awaitCompletion();
            dmm.stopJob(batcher);
            dmm.release();

            report = dmm.getJobReport(jobTicket);
            long traceCount = report.getSuccessEventsCount();
            response.totalTraces = traceCount;

            zipConsumer.close();
        }
        else {
            // there were no jobs, so don't produce an empty zip file
            zipConsumer.close();
            zipFile.delete();
        }

        return response;
    }

    @Override public void importJobs(Path importFilePath) throws IOException {
        try(ZipFile importZip = new ZipFile(importFilePath.toFile())) {
            Enumeration<? extends ZipEntry> entries = importZip.entries();

            DataMovementManager dmm = jobClient.newDataMovementManager();
            WriteBatcher writer = dmm
                .newWriteBatcher()
                .withJobName("Load jobs")
                .withBatchSize(50);
            JobTicket ticket = dmm.startJob(writer);

            // Add each Job entry to the writer; set aside the Trace entries.
            ArrayList<ZipEntry> traceEntries = new ArrayList<ZipEntry>();
            DocumentMetadataHandle jobMetadata = new DocumentMetadataHandle().withCollections("job");
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();

                if (entry.getName().startsWith("/jobs/")) {
                    // Delimiter = \A, which is the beginning of the input
                    Scanner s = new Scanner(importZip.getInputStream(entry)).useDelimiter("\\A");
                    String entryText = s.hasNext() ? s.next() : "";

                    writer.add(
                        entry.getName(),
                        jobMetadata,
                        new StringHandle(entryText).withFormat(Format.JSON)
                    );
                } else {
                    traceEntries.add(entry);
                }
            }

            writer.flushAndWait();
            dmm.stopJob(ticket);
            dmm.release();

            if (traceEntries.size() > 0) {
                dmm = this.jobClient.newDataMovementManager();
                writer = dmm
                    .newWriteBatcher()
                    .withJobName("Load traces");
                ticket = dmm.startJob(writer);

                DocumentMetadataHandle traceMetadata = new DocumentMetadataHandle().withCollections("trace");

                for (ZipEntry entry : traceEntries) {
                    // Delimiter = \A, which is the beginning of the input
                    Scanner s = new Scanner(importZip.getInputStream(entry)).useDelimiter("\\A");
                    String entryText = s.hasNext() ? s.next() : "";

                    writer.add(
                        entry.getName(),
                        traceMetadata,
                        new StringHandle(entryText)
                            .withFormat(entry.getName().endsWith(".json") ? Format.JSON : Format.XML)
                    );
                }
                writer.flushAndWait();
                dmm.stopJob(ticket);
                dmm.release();
            }
        }
    }

    public class JobDeleteResource extends ResourceManager {
        private static final String DELETE_SERVICE = "mlDeleteJobs";

        private DatabaseClient srcClient;

        public JobDeleteResource(DatabaseClient srcClient) {
            super();
            this.srcClient = srcClient;
            this.srcClient.init(DELETE_SERVICE, this);
        }


        public JobDeleteResponse deleteJobs(String jobIds) {
            JobDeleteResponse resp = null;
            try {
                RequestParameters params = new RequestParameters();
                params.add("jobIds", jobIds);

                ResourceServices services = this.getServices();
                ResourceServices.ServiceResultIterator resultItr =
                    services.post(params, new StringHandle("{}").withFormat(Format.JSON));
                if (resultItr == null || ! resultItr.hasNext()) {
                    resp = new JobDeleteResponse();
                }
                else {
                    ResourceServices.ServiceResult res = resultItr.next();
                    StringHandle handle = new StringHandle();
                    ObjectMapper objectMapper = new ObjectMapper();
                    resp = objectMapper.readValue(res.getContent(handle).get(), JobDeleteResponse.class);
                }
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException(e);
            }
            return resp;
        }
    }

}
