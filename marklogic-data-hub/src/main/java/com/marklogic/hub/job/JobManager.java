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
     */
    JobExportResponse exportJobs(Path exportFilePath, String[] jobIds);

    /**
     * Import Job documents and their associated Trace documents from a zip file.
     *
     * @param importFilePath specifies where the zip file exists
     */
    void importJobs(Path importFilePath) throws IOException;
}
