package com.marklogic.hub.web.web;

import com.marklogic.hub.util.metrics.tracer.JaegerConfig;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.model.JobModel;
import com.marklogic.hub.web.service.NewJobService;
import io.opentracing.Scope;
import io.opentracing.Span;
import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value="/api/jobs")
public class NewJobController {

    @Autowired
    private NewJobService jobService;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getJobs(@RequestParam(value = "flowName", required = false) String flowName) throws IOException {
        List<JobModel> jobModels;
        Span span = JaegerConfig.buildSpan("getJobs").start();
        try (Scope ignored = JaegerConfig.activate(span)) {
            jobService.setupClient();
            jobModels = jobService.getJobs(flowName);
            span.setTag("flowName", flowName != null ? flowName : "");
            jobService.release();
        } catch (Exception ex) {
            throw new DataHubException(ex.getMessage(), ex);
        } finally {
            span.finish();
        }
        return new ResponseEntity<>(jobModels, HttpStatus.OK);
    }

    @RequestMapping(value = "/{jobId}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getJob(@PathVariable String jobId) {
        List<JobModel> jobModels;
        try {
            jobService.setupClient();
            jobModels = jobService.getJobs(null, jobId);
            jobService.release();
        } catch (Exception ex) {
            throw new DataHubException(ex.getMessage(), ex);
        }
        return new ResponseEntity<>(jobModels, HttpStatus.OK);
    }

}
