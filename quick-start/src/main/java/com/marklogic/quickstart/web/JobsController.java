/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.quickstart.web;

import com.marklogic.hub.job.JobDeleteResponse;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.exception.DataHubException;
import com.marklogic.quickstart.model.JobExport;
import com.marklogic.quickstart.model.JobQuery;
import com.marklogic.quickstart.service.JobService;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.*;

@Controller
@RequestMapping(value="/api/jobs")
public class JobsController extends EnvironmentAware {

    @Autowired
    JobService jobService;

    @Bean
    @Scope(proxyMode= ScopedProxyMode.TARGET_CLASS, value="session")
    JobService jobManager() {
        return new JobService(envConfig().getJobClient());
    }

    @RequestMapping(method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public String getJobInstances(@RequestBody JobQuery jobQuery) {
        return jobService.getJobs(jobQuery).get();
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    @ResponseBody
    public JobDeleteResponse deleteJobs(@RequestBody String jobIds) {
        return jobService.deleteJobs(jobIds);
    }

    @RequestMapping(value = "/export", method = RequestMethod.POST)
    @ResponseBody
    public byte[] exportJobs(@RequestBody JobExport jobExport) {
        byte[] response = null;
        try {
            File zipFile = jobService.exportJobs(jobExport.jobIds);
            InputStream is = new FileInputStream(zipFile);
            response = IOUtils.toByteArray(is);
        } catch (FileNotFoundException e) {
            throw new DataHubException(e.getMessage(), e);
        } catch (IOException e) {
            throw new DataHubException(e.getMessage(), e);
        }

        return response;
    }

}
