package com.marklogic.hub.job;


public enum JobStatus {
    STARTED("started"),
    RUNNING("running"),
    FINISHED("finished"),
    FINISHED_WITH_ERRORS("finished-with-errors"),
    FAILED("failed");

    private String type;
    JobStatus(String type) {
        this.type = type;
    }

    public static JobStatus getJobStatus(String status) {
        for (JobStatus jobStatus : JobStatus.values()) {
            if (jobStatus.toString().equals(status)) {
                return jobStatus;
            }
        }
        return null;
    }

    public String toString() {
        return this.type;
    }
}
