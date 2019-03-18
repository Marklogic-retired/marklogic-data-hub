package com.marklogic.hub.web.service;

import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubConfigImpl;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FlowManagerService {

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private HubConfigImpl hubConfig;

    public List<Flow> getFlows() {
        return flowManager.getFlows();
    }

    public Flow createFlow(String flowJson) {
        Flow flow = flowManager.createFlowFromJSON(flowJson);
        if (flow != null && StringUtils.isEmpty(flow.getName())) {
            return null;
        }
        flowManager.saveFlow(flow);
        return flow;
    }

    public Flow getFlow(String flowName) {
        return flowManager.getFlow(flowName);
    }

    public List<String> getFlowNames() {
        return flowManager.getFlowNames();
    }

    public void deleteFlow(String flowName) {
        flowManager.deleteFlow(flowName);
    }

}
