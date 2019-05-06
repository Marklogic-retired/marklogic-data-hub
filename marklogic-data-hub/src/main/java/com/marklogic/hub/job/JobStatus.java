package com.marklogic.hub.job;

import org.apache.commons.lang3.StringUtils;

public enum JobStatus {
    STARTED("started"),
    FINISHED("finished"),
    FINISHED_WITH_ERRORS("finished_with_errors"),
    RUNNING("running"),
    FAILED("failed"),
    STOP_ON_ERROR("stop-on-error"),
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

    //Step Status prefix
    public static final String RUNNING_PREFIX = "running step ";
    public static final String COMPLETED_PREFIX = "completed step ";
    public static final String COMPLETED_WITH_ERRORS_PREFIX = "completed with errors step ";
    public static final String STOP_ON_ERROR_PREFIX = "stop on error in step ";
    public static final String FAILED_PREFIX = "failed step ";
    public static final String CANCELED_PREFIX = "canceled step ";

    public static boolean isJobDone(String jobStatus) {
        return JobStatus.FINISHED.toString().equals(jobStatus) ||
            JobStatus.FINISHED_WITH_ERRORS.toString().equals(jobStatus) ||
            JobStatus.FAILED.toString().equals(jobStatus) ||
            JobStatus.STOP_ON_ERROR.toString().equals(jobStatus) ||
            JobStatus.CANCELED.toString().equals(jobStatus);
    }

    public static boolean isStepDone(String status) {
        return StringUtils.isNotEmpty(status) && (status.startsWith(COMPLETED_PREFIX) ||
            status.startsWith(COMPLETED_WITH_ERRORS_PREFIX) ||
            status.startsWith(STOP_ON_ERROR_PREFIX) ||
            status.startsWith(FAILED_PREFIX) ||
            status.startsWith(CANCELED_PREFIX));
    }

}
