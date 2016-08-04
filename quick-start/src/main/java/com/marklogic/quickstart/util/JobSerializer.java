package com.marklogic.quickstart.util;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.marklogic.spring.batch.core.MarkLogicJobInstance;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobInstance;
import org.springframework.batch.core.JobParameter;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.TimeZone;

public class JobSerializer extends JsonSerializer<MarkLogicJobInstance> {
    @Override
    public void serialize(MarkLogicJobInstance value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        JobInstance jobInstance = value.getJobInstance();
        JobExecution jobExecution = value.getJobExecutions().get(0);

        gen.writeStartObject();
        gen.writeStringField("jobId", jobInstance.getId().toString());
        gen.writeStringField("jobName", jobInstance.getJobName());
        gen.writeStringField("startTime", toIso8601(jobExecution.getStartTime()));
        Date endTime = jobExecution.getEndTime();
        if (endTime == null) {
            gen.writeNullField("endTime");
        }
        else {
            gen.writeStringField("endTime", toIso8601(jobExecution.getEndTime()));
        }
        gen.writeStringField("lastUpdated", toIso8601(jobExecution.getLastUpdated()));
        gen.writeStringField("status", jobExecution.getStatus().toString());

        for (Map.Entry<String, Object> entry : jobExecution.getExecutionContext().entrySet()) {
            gen.writeObjectField(entry.getKey(), entry.getValue());
        }

        for (Map.Entry<String, JobParameter> entry : jobExecution.getJobParameters().getParameters().entrySet()) {
            gen.writeObjectField(entry.getKey(), entry.getValue().getValue());
        }
        gen.writeEndObject();
    }

    private static String toIso8601(Date date) {
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        return dateFormat.format(date);
    }
}
