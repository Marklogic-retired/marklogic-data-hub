package com.marklogic.hub.web.controller.api;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.model.FlowType;
import com.marklogic.hub.service.FlowManagerService;
import com.marklogic.hub.web.controller.BaseController;
import com.marklogic.hub.web.form.FlowForm;
import com.marklogic.hub.web.form.LoginForm;

@RestController
@RequestMapping("/api/flows")
public class FlowApiController extends BaseController {

	private static final Logger LOGGER = LoggerFactory
			.getLogger(FlowApiController.class);

	@Autowired
	private FlowManagerService flowManagerService;

	@RequestMapping(value = "/flow", method = RequestMethod.GET)
	@ResponseBody
	public Flow getFlow(HttpServletRequest request) {
		final String domainName = request.getParameter("domainName");
		final String flowName = request.getParameter("flowName");
		return flowManagerService.getFlow(domainName, flowName);
	}

	@RequestMapping(method = RequestMethod.POST, consumes = { MediaType.APPLICATION_JSON_UTF8_VALUE }, produces = { MediaType.APPLICATION_JSON_UTF8_VALUE })
	@ResponseBody
	public DomainModel saveFlow(@RequestBody FlowForm flowForm,
			BindingResult bindingResult, HttpSession session) {
		FlowModel flowModel = flowManagerService.createFlow(
				flowForm.getDomainName(), flowForm.getFlowName(),
				flowForm.getFlowType());
		LoginForm loginForm = (LoginForm) session.getAttribute("loginForm");
		DomainModel selectedDomain = loginForm.getSelectedDomain();
		if (FlowType.getFlowType(flowForm.getFlowType()) == FlowType.CONFORM) {
			selectedDomain.getConformFlows().add(flowModel);
		} else {
			selectedDomain.getInputFlows().add(flowModel);
		}
		return selectedDomain;
	}

	@RequestMapping(value = "/install", method = RequestMethod.POST)
	public void installFlow(HttpServletRequest request) {
		final String domainName = request.getParameter("domainName");
		final String flowName = request.getParameter("flowName");
		final Flow flow = flowManagerService.getFlow(domainName, flowName);
		flowManagerService.installFlow(flow);
	}

	@RequestMapping(value = "/uninstall", method = RequestMethod.POST)
	public void uninstallFlow(HttpServletRequest request) {
		final String flowName = request.getParameter("flowName");
		flowManagerService.uninstallFlow(flowName);
	}

	@RequestMapping(value = "/test", method = RequestMethod.POST)
	public void testFlow(HttpServletRequest request) {
		final String domainName = request.getParameter("domainName");
		final String flowName = request.getParameter("flowName");
		final Flow flow = flowManagerService.getFlow(domainName, flowName);
		flowManagerService.testFlow(flow);
	}

	@RequestMapping(value = "/run", method = RequestMethod.POST)
	public void runFlow(HttpServletRequest request) {
		final String domainName = request.getParameter("domainName");
		final String flowName = request.getParameter("flowName");
		final Flow flow = flowManagerService.getFlow(domainName, flowName);
		// TODO update and move BATCH SIZE TO a constant or config - confirm
		// desired behavior
		flowManagerService.runFlow(flow, 100);
	}

	@RequestMapping(value = "/runInParallel", method = RequestMethod.POST)
	public void runFlowsInParallel(HttpServletRequest request) {
		final String domainName = request.getParameter("domainName");
		String[] flowNames = request.getParameterValues("flowName");
		List<Flow> flows = new ArrayList<Flow>();
		for (String flowName : flowNames) {
			final Flow flow = flowManagerService.getFlow(domainName, flowName);
			flows.add(flow);
		}
		flowManagerService.runFlowsInParallel(flows.toArray(new Flow[flows
				.size()]));
	}

}
