package com.marklogic.hub;

import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;

public class JobFinishedListener implements JobExecutionListener{

    private boolean isFinished = false;

    @Override
    public void beforeJob(JobExecution jobExecution) {}

    @Override
    public void afterJob(JobExecution jobExecution) {
        isFinished = true;
    }

    public boolean isFinished() {
        return isFinished;
    }

    public void waitForFinish() {
        while(true) {
            if (isFinished()) {
                break;
            }
            Thread.yield();
        }
    }
}
