package com.marklogic.hub.job;


public enum JobStatus {
    STARTED("started"),
    RUNNING_COLLECTOR("running-collector"),
    RUNNING_HARMONIZE("running-harmonize"),
    FINISHED("finished"),
    FINISHED_WITH_ERRORS("finished-with-errors"),
    FAILED("failed"),
    CANCELED("canceled");

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
