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
package com.marklogic.quickstart.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.service.JobManager;
import com.marklogic.quickstart.util.JobSerializer;
import com.marklogic.spring.batch.core.MarkLogicJobInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value="/api/jobs")
public class JobsController extends EnvironmentAware {

    @Autowired
    JobManager jobManager;

    @Bean
    @Scope(proxyMode= ScopedProxyMode.TARGET_CLASS, value="session")
    JobManager jobManager() {
        return new JobManager(envConfig().getMlSettings(), envConfig().getJobClient());
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public String getJobInstances(@RequestParam long start, @RequestParam long count) throws JsonProcessingException {
        ObjectMapper om = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addSerializer(MarkLogicJobInstance.class, new JobSerializer());
        om.registerModule(module);

        return om.writeValueAsString(jobManager.getJobInstances(start, count));
    }
}
