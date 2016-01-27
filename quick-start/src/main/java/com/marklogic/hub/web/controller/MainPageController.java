package com.marklogic.hub.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.exception.DataHubException;
import com.marklogic.hub.service.DataHubService;
import com.marklogic.hub.web.form.DeploymentForm;

@Controller
@RequestMapping("/")
public class MainPageController extends BaseController {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(MainPageController.class);
	
	@Autowired
	private EnvironmentConfiguration environmentConfiguration;
	@Autowired
	private DataHubService dataHubService;
	
	@RequestMapping(method = RequestMethod.GET)
	public String getHomePage(@ModelAttribute("deploymentForm") DeploymentForm deploymentForm, Model model) {
		deploymentForm.setMlHost(environmentConfiguration.getMLHost());
		deploymentForm.setMlUsername(environmentConfiguration.getMLUsername());
		deploymentForm.setMlUsername(environmentConfiguration.getMLUsername());
		deploymentForm.setMlPassword(environmentConfiguration.getMLPassword());
		return "index";
	}
	
	@RequestMapping(params = "deployToMarkLogic", method = RequestMethod.POST)
	public String deployToMarkLogic(@ModelAttribute("deploymentForm") DeploymentForm deploymentForm, BindingResult bindingResult, Model model) {
		LOGGER.info("Trying to deploy to MarkLogic");
		updateConfiguration(deploymentForm);
		try {
			dataHubService.deployToMarkLogic();
		} catch(DataHubException e) {
			LOGGER.error(e.getMessage(), e);
			displayError(model, null, null, e.getMessage());
		}
		return "redirect:/";
	}
	
	private void updateConfiguration(DeploymentForm deploymentForm) {
		environmentConfiguration.setMLHost(deploymentForm.getMlHost());
		environmentConfiguration.setMLUsername(deploymentForm.getMlUsername());
		environmentConfiguration.setMLPassword(deploymentForm.getMlPassword());
	}

	@RequestMapping(params = "validateServer", method = RequestMethod.POST)
	public String validateServer(@ModelAttribute("deploymentForm")  DeploymentForm deploymentForm, BindingResult bindingResult, Model model) {
		LOGGER.info("Trying to validate server");
		updateConfiguration(deploymentForm);
		try {
			deploymentForm.setServerAcceptable(dataHubService.isServerAcceptable());
			deploymentForm.setValidServer(true);
		} catch(DataHubException e) {
			LOGGER.error(e.getMessage(), e);
			deploymentForm.setValidServer(false);
			displayError(model, null, null, e.getMessage());
		} finally {
			deploymentForm.setServerValidated(true);
		}
		return "redirect:/";
	}

}
