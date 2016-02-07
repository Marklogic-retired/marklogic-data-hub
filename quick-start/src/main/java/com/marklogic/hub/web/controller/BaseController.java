package com.marklogic.hub.web.controller;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

import com.marklogic.hub.web.form.BaseForm;

@Controller
public class BaseController {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(BaseController.class);
	
	@Autowired
	private MessageSource messageSource;
	
	public String convertMessage(String messageKey, Object[] messageParams, String defaultMessage) {
		try {
			return this.messageSource.getMessage(messageKey, messageParams, null);
		} catch (final NoSuchMessageException e) {
			LOGGER.error(e.getMessage(), e);
			return defaultMessage;
		}
	}
	
	public void displayError(Model model, String errorKey, Object[] messageParams, String defaultError) {
		List<String> errors = new ArrayList<String>();
		String error = defaultError;
		if(errorKey != null) {
			error = this.convertMessage(errorKey, messageParams, defaultError);
		}
		errors.add(error);
		displayErrors(model, errors);
	}
	
	public void displayErrors(Model model, List<String> errors) {
		model.addAttribute("errors", errors);
		model.addAttribute("hasErrors", true);
	}
	
	public void displayError(BaseForm form, String errorKey, Object[] messageParams, String defaultError) {
		List<String> errors = new ArrayList<String>();
		String error = defaultError;
		if(errorKey != null) {
			error = this.convertMessage(errorKey, messageParams, defaultError);
		}
		errors.add(error);
		displayErrors(form, errors);
	}
	
	public void displayErrors(BaseForm form, List<String> errors) {
		form.setErrors(errors);
		form.setHasErrors(true);
	}
}
