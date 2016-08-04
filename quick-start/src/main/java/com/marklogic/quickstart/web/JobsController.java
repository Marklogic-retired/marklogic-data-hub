package com.marklogic.quickstart.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.marklogic.hub.JobManager;
import com.marklogic.quickstart.model.EnvironmentConfig;
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
public class JobsController extends BaseController {
    @Autowired
    EnvironmentConfig envConfig;

    @Autowired
    JobManager jobManager;

    @Bean
    @Scope(proxyMode= ScopedProxyMode.TARGET_CLASS, value="session")
    JobManager jobManager() {
        return new JobManager(envConfig.getMlSettings(), envConfig.getJobClient());
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public String getJobInstances(@RequestParam long start, @RequestParam long count) throws JsonProcessingException {
        requireAuth();
        ObjectMapper om = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addSerializer(MarkLogicJobInstance.class, new JobSerializer());
        om.registerModule(module);

        return om.writeValueAsString(jobManager.getJobInstances(start, count));
    }
}
