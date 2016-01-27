package com.marklogic.hub.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.marklogic.hub.config.EnvironmentConfiguration;

@Controller
public class MainPageController {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(MainPageController.class);
	
	@Autowired
	private EnvironmentConfiguration environmentConfiguration;
	
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String getHomePage(Model model) {
		LOGGER.debug("Loading home page from port " + environmentConfiguration.getServerPort());
		return "index";
	}
	
	@RequestMapping(value = "/deployToMarkLogic", method = RequestMethod.POST)
	public String deployToMarkLogic(Model model) {
		return "redirect:/";
	}
	
	

}
