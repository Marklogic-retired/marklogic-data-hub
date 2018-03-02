/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.hub.job.impl.JobManagerImpl;

import java.io.IOException;
import java.nio.file.Path;

public interface JobManager {

    static JobManager create(DatabaseClient jobClient, DatabaseClient traceClient){
        return new JobManagerImpl(jobClient, traceClient);
    }

    void saveJob(Job job);

    void saveJob(Job job, Transaction transaction);

    JobDeleteResponse deleteJobs(String jobIds);

    /**
     * Export Job documents and their associated Trace documents to a zip file.
     *
     * @param exportFilePath specifies where the zip file will be written
     * @param jobIds a comma-separated list of jobIds; if null, all will be exported
     *
     * @return a report of what was exported
     */
    JobExportResponse exportJobs(Path exportFilePath, String[] jobIds);

    /**
     * Import Job documents and their associated Trace documents from a zip file.
     *
     * @param importFilePath specifies where the zip file exists
     * @throws IOException if unable to open or read the target input file
     */
    void importJobs(Path importFilePath) throws IOException;
}
