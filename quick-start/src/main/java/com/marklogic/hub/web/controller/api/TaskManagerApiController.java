package com.marklogic.hub.web.controller.api;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.hub.model.TaskManagerModel;
import com.marklogic.hub.service.TaskManagerService;

@RestController
@RequestMapping("/api/task")
public class TaskManagerApiController {
    @Autowired
    private TaskManagerService taskManagerService;
    
    
    @RequestMapping(value="/wait", method = RequestMethod.GET)
    public Object waitTask(HttpServletRequest request, HttpServletResponse response) {
        String taskIdStr = request.getParameter("taskId");
        
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("taskId", taskIdStr);
        resultMap.put("success", false);
        
        try {
            BigInteger taskId = new BigInteger(taskIdStr);
            Object result = taskManagerService.waitTask(taskId);
            
            resultMap.put("result", result);
            resultMap.put("success", true);
        }
        catch (NumberFormatException e) {
            resultMap.put("errorMessage", "Invalid task id");
        } catch (Exception e) {
            resultMap.put("errorMessage", e.getMessage());
        }
        
        return resultMap;
    }
    
    @RequestMapping(value="/stop", method = RequestMethod.POST)
    public void stopTask(@RequestBody TaskManagerModel taskManagerModel, HttpServletResponse response) {
        String taskIdStr = taskManagerModel.getTaskId();
        
        try {
            BigInteger taskId = new BigInteger(taskIdStr);
            taskManagerService.stopTask(taskId);
        }
        catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
