/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub.job;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonDatabindHandle;
import com.sun.jersey.api.client.ClientHandlerException;

import java.text.SimpleDateFormat;
import java.util.TimeZone;

public class JobManager {

    private JSONDocumentManager docMgr;

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

    public JobManager(DatabaseClient jobClient) {
        this.docMgr = jobClient.newJSONDocumentManager();
    }

    public void saveJob(Job job) {
        saveJob(job, null);
    }

    public void saveJob(Job job, Transaction transaction) {
        JacksonDatabindHandle<Job> contentHandle = new JacksonDatabindHandle<>(job);
        contentHandle.setMapper(objectMapper);
        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle = metadataHandle.withCollections("job");
        DocumentWriteSet writeSet = docMgr.newWriteSet();
        writeSet.add("/jobs/" + job.getJobId() + ".json", metadataHandle, contentHandle);
        try {
            docMgr.write(writeSet, transaction);
        } catch(ClientHandlerException e) {
            throw new RuntimeException(e);
        }

    }
}
