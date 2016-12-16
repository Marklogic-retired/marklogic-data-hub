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
package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.JobStatusListener;
import com.marklogic.spring.batch.hub.AbstractMarkLogicBatchConfig;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import java.io.IOException;

public class RunInputFlowConfig extends AbstractMarkLogicBatchConfig {
    @Autowired
    private DatabaseClientProvider databaseClientProvider;

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    JobStatusListener statusListener;

    @Bean
    public Job job(@Qualifier("step1") Step step1) {
        return jobBuilderFactory.get("Input").start(step1).build();
    }

    @Bean
    @JobScope
    protected Step step1(@Value("#{jobParameters['mlcpOptions']}") String mlcpOptions) throws IOException {
        ObjectMapper om = new ObjectMapper();
        JsonNode json = om.readTree(mlcpOptions);
        MlcpTasklet tasklet = new MlcpTasklet(hubConfig, json, statusListener);
        return stepBuilderFactory
            .get("step1")
            .tasklet(tasklet)
            .build();
    }
}
