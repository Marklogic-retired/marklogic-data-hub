package com.marklogic.hub.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.service.DataHubService;
import com.marklogic.hub.web.form.MainPageForm;

@Controller
public class MainPageController {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(MainPageController.class);
	
	@Autowired
	private EnvironmentConfiguration environmentConfiguration;
	@Autowired
	private DataHubService dataHubService;
	
	@RequestMapping(value = "/", method = RequestMethod.GET)
	public String getHomePage(@ModelAttribute("mainPageForm")  MainPageForm mainPageForm, Model model) {
		LOGGER.debug("Loading home page from port " + environmentConfiguration.getServerPort());
		return "index";
	}
	
	@RequestMapping(value = "/deployToMarkLogic", method = RequestMethod.POST)
	public String deployToMarkLogic(@ModelAttribute("mainPageForm")  MainPageForm mainPageForm, Model model) {
		environmentConfiguration.setMLHost(mainPageForm.getMlHost());
		environmentConfiguration.setMLUserName(mainPageForm.getMlUsername());
		environmentConfiguration.setMLPassword(mainPageForm.getMlPassword());
		dataHubService.deployToMarkLogic();
		return "redirect:/";
	}
	
	

}
