package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.JobService;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RunFlowWithSameJobIdTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/simple-customer-flow");

        final FlowInputs flowInputs = new FlowInputs("simpleCustomerFlow", "1", "2").withJobId("abc123");
        JobTimes firstJob = runFlowAndReturnJobTimes(flowInputs);
        JobTimes secondJob = runFlowAndReturnJobTimes(flowInputs);

        verifyJobTimes(firstJob);
        verifyJobTimes(secondJob);

        String message = "Unexpected times; firstJob: " + firstJob + "; secondJob: " + secondJob;
        assertTrue(secondJob.jobStarted.isAfter(firstJob.jobEnded), message);
        assertTrue(secondJob.firstStepStarted.isAfter(firstJob.jobEnded), message);
    }

    private void verifyJobTimes(JobTimes jobTimes) {
        String message = "Unexpected times: " + jobTimes;

        assertTrue(jobTimes.jobStarted.isBefore(jobTimes.jobEnded), message);
        assertTrue(jobTimes.firstStepStarted.isBefore(jobTimes.firstStepEnded), message);
        assertTrue(jobTimes.secondStepStarted.isBefore(jobTimes.secondStepEnded), message);
        assertTrue(jobTimes.firstStepEnded.isBefore(jobTimes.secondStepStarted), message);

        assertFalse(jobTimes.jobEnded.isBefore(jobTimes.secondStepEnded), message);
        assertFalse(jobTimes.firstStepStarted.isBefore(jobTimes.jobStarted), message);
    }

    private JobTimes runFlowAndReturnJobTimes(FlowInputs inputs) {
        runFlow(inputs);

        ObjectNode jobDoc = (ObjectNode) JobService.on(getHubClient().getJobsClient()).getJob("abc123");

        JobTimes jobTimes = new JobTimes();
        jobTimes.jobStarted = parseDateTime(jobDoc.get("job").get("timeStarted").asText());
        jobTimes.jobEnded = parseDateTime(jobDoc.get("job").get("timeEnded").asText());
        jobTimes.firstStepStarted = parseDateTime(jobDoc.get("job").get("stepResponses").get("1").get("stepStartTime").asText());
        jobTimes.firstStepEnded = parseDateTime(jobDoc.get("job").get("stepResponses").get("1").get("stepEndTime").asText());
        jobTimes.secondStepStarted = parseDateTime(jobDoc.get("job").get("stepResponses").get("2").get("stepStartTime").asText());
        jobTimes.secondStepEnded = parseDateTime(jobDoc.get("job").get("stepResponses").get("2").get("stepEndTime").asText());

        return jobTimes;
    }
}

class JobTimes {
    LocalDateTime jobStarted;
    LocalDateTime jobEnded;
    LocalDateTime firstStepStarted;
    LocalDateTime firstStepEnded;
    LocalDateTime secondStepStarted;
    LocalDateTime secondStepEnded;

    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this, ToStringStyle.MULTI_LINE_STYLE);
    }
}
