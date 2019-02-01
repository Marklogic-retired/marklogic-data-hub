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

import com.marklogic.client.pojo.annotation.Id;
import com.marklogic.hub.legacy.flow.LegacyFlow;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Job {
    private String jobId;
    private String flowType;
    private String flowName;
    private String entityName;
    private String jobName;
    private Date startTime;
    private Date endTime;
    private List<String> jobOutput;
    private JobStatus status = JobStatus.STARTED;

    private long successfulEvents = 0;
    private long failedEvents = 0;
    private long successfulBatches = 0;
    private long failedBatches = 0;

    private Job() {
        this.startTime = new Date();
    }

    public Job withJobId(String jobId) {
        this.jobId = jobId;
        return this;
    }

    public static Job withFlow(LegacyFlow flow) {
        Job job = new Job();
        job.flowType = flow.getType().toString();
        job.flowName = flow.getName();
        job.entityName = flow.getEntityName();
        return job;
    }

    public Job withJobName(String jobName) {
        this.jobName = jobName;
        return this;
    }

    public Job withJobOutput(List<String> jobOutput) {
        this.jobOutput = jobOutput;
        return this;
    }

    public Job withJobOutput(String jobOutput) {
        if (this.jobOutput == null) {
            this.jobOutput = new ArrayList<>();
        }
        this.jobOutput.add(jobOutput);
        return this;
    }

    public Job withStartTime(Date startTime) {
        this.startTime = startTime;
        return this;
    }

    public Job withEndTime(Date endTime) {
        this.endTime = endTime;
        return this;
    }

    public Job withStatus(JobStatus status) {
        this.status = status;
        return this;
    }

    public Job setCounts(long successfulEvents, long failedEvents, long successfulBatches, long failedBatches) {
        this.successfulEvents = successfulEvents;
        this.failedEvents = failedEvents;
        this.successfulBatches = successfulBatches;
        this.failedBatches = failedBatches;
        return this;
    }

    @Id
    public String getJobId() {
        return jobId;
    }

    public String getFlowType() {
        return flowType;
    }

    public String getFlowName() {
        return flowName;
    }

    public String getEntityName() {
        return entityName;
    }

    public String getJobName() {
        return jobName;
    }

    public Date getStartTime() {
        return this.startTime;
    }

    public Date getEndTime() {
        return this.endTime;
    }

    public JobStatus getStatus() {
        return status;
    }

    public List<String> getJobOutput() {
        return jobOutput;
    }

    public long getSuccessfulEvents() {
        return successfulEvents;
    }

    public long getFailedEvents() {
        return failedEvents;
    }

    public long getSuccessfulBatches() {
        return successfulBatches;
    }

    public long getFailedBatches() {
        return failedBatches;
    }
}
