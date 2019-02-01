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


public enum JobStatus {
    STARTED("started"),
    RUNNING_COLLECTOR("running-collector"),
    RUNNING_HARMONIZE("running-harmonize"),
    FINISHED("finished"),
    FINISHED_WITH_ERRORS("finished-with-errors"),
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
}
