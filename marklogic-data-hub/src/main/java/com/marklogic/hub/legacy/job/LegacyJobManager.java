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

package com.marklogic.hub.legacy.job;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.hub.legacy.job.impl.LegacyJobManagerImpl;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Handles jobs and their creation, status, and deletion.
 */
public interface LegacyJobManager {

    /**
     * Creates and returns a LegacyJobManager object
     * @param jobClient the database client that is used to connect to the jobs database
     * @return LegacyJobManager object
     */
    static LegacyJobManager create(DatabaseClient jobClient){
        return new LegacyJobManagerImpl(jobClient);
    }

    /**
     * Saves the job to the database
     * @param job - the job you want to save
     */
    void saveJob(Job job);

    /**
     * Saves the job to the database
     * @param job - the job you want to save
     * @param transaction - the transaction that is to be used to write the job
     */
    void saveJob(Job job, Transaction transaction);

    /**
     * @param jobIds comma-separated list of jobIds to delete.
     * @return comma-separated list of jobIds that were successfully deleted
     */
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
