package com.marklogic.quickstart.web;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.marklogic.quickstart.model.TaskModel;
import com.marklogic.quickstart.service.TaskManagerService;

@Controller
@Scope("session")
public class TasksController extends BaseController {

    @Autowired
    private TaskManagerService taskManagerService;

    @RequestMapping(value = "/tasks/", method = RequestMethod.GET)
    @ResponseBody
    public List<TaskModel> getTasks() {
        requireAuth();

        return taskManagerService.getTasks();
    }

}
