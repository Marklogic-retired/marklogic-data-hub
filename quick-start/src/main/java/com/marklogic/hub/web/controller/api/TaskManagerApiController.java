package com.marklogic.hub.web.controller.api;

import java.math.BigInteger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.hub.service.TaskManagerService;

@RestController
@RequestMapping("/api/task")
public class TaskManagerApiController {
    @Autowired
    private TaskManagerService taskManagerService;
    
    
    @RequestMapping(value="/wait", method = RequestMethod.GET)
    public Object waitTask(HttpServletRequest request, HttpServletResponse response) {
        String taskIdStr = request.getParameter("taskId");
        
        try {
            BigInteger taskId = new BigInteger(taskIdStr);
            return taskManagerService.waitTask(taskId);
        }
        catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
        
        return null;
    }
    
    @RequestMapping(value="/stop", method = RequestMethod.POST)
    public void stopTask(HttpServletRequest request, HttpServletResponse response) {
        String taskIdStr = request.getParameter("taskId");
        
        try {
            BigInteger taskId = new BigInteger(taskIdStr);
            taskManagerService.stopTask(taskId);
        }
        catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
