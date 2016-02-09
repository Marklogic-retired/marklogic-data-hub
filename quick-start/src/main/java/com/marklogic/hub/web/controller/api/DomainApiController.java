package com.marklogic.hub.web.controller.api;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.service.DomainManagerService;
import com.marklogic.hub.web.form.DomainForm;
import com.marklogic.hub.web.form.LoginForm;

@RestController
@RequestMapping("/api/domains")
public class DomainApiController {

	@Autowired
    private EnvironmentConfiguration environmentConfiguration;
	
	@Autowired
	private DomainManagerService domainManagerService;
	
	@RequestMapping(method = RequestMethod.GET)
	@ResponseBody
	public List<DomainModel> getDomains(HttpSession session) {
		LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
		List<DomainModel> domains = domainManagerService.getDomains();
		loginForm.setDomains(domains);
		return domains;
	}
	
	@RequestMapping(method = RequestMethod.POST, consumes={MediaType.APPLICATION_JSON_UTF8_VALUE}, produces={MediaType.APPLICATION_JSON_UTF8_VALUE})
	@ResponseBody
	public List<DomainModel> saveDomain(@RequestBody DomainForm domainForm, BindingResult bindingResult, HttpSession session) {
		DomainModel domainModel = domainManagerService.createDomain(domainForm.getDomainName(), domainForm.getInputFlowName(), 
				domainForm.getConformFlowName());
		LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
		List<DomainModel> domains = loginForm.getDomains();
		domains.add(domainModel);
		return domains;
	}
	
}
