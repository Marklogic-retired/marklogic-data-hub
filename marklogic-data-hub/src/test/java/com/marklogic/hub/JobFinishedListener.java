package com.marklogic.hub;

public class JobFinishedListener implements JobStatusListener {

    private boolean isFinished = false;

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

    @Override
    public void onStatusChange(long jobId, int percentComplete, String message) {
        isFinished = (percentComplete == 100);
    }
}
