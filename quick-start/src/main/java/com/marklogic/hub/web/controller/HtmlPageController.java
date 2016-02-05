package com.marklogic.hub.web.controller;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.RequestToViewNameTranslator;
import org.springframework.web.servlet.view.DefaultRequestToViewNameTranslator;

@Controller
@RequestMapping("/**/**.html")
public class HtmlPageController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(HtmlPageController.class);
    
    @RequestMapping(method = RequestMethod.GET)
    public String getPage(HttpServletRequest request) throws Exception {
        RequestToViewNameTranslator translator = new DefaultRequestToViewNameTranslator();
        String viewName = translator.getViewName(request);
        
        String uri = request.getRequestURI();
        LOGGER.debug(uri + " = " + viewName);
        
        return uri.equals("/") ? "index" : viewName;
    }
}
