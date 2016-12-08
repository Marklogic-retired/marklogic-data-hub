/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.quickstart.util;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.MatchDocumentSummary;
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

public class SearchHandleSerializer extends JsonSerializer<SearchHandle> {
    @Override
    public void serialize(SearchHandle value, JsonGenerator gen, SerializerProvider serializers) throws IOException {

        gen.writeStartObject();

        gen.writeNumberField("start", value.getStart());
        gen.writeNumberField("pageLength", value.getPageLength());
        gen.writeNumberField("total", value.getTotalResults());

        gen.writeArrayFieldStart("results");
        for (MatchDocumentSummary summary: value.getMatchResults()) {
            JacksonHandle result = summary.getFirstSnippet(new JacksonHandle());
            gen.writeStartObject();
            gen.writeStringField("uri", summary.getUri());
            gen.writeStringField("path", summary.getPath());
            gen.writeNumberField("score", summary.getScore());
            gen.writeNumberField("confidence", summary.getConfidence());
            gen.writeNumberField("fitness", summary.getFitness());
            gen.writeObjectField("doc", result.get());
            gen.writeEndObject();
        }
        gen.writeEndArray();

        gen.writeEndObject();
    }

    private static String toIso8601(Date date) {
        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        return dateFormat.format(date);
    }
}
