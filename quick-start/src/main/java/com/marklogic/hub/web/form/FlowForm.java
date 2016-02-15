package com.marklogic.hub.web.form;

import java.util.List;

import com.marklogic.hub.exception.FormValidationException;
import com.marklogic.hub.model.FlowModel;

public class FlowForm extends BaseForm {

    private String domainName;
    private String flowType;
    private String flowName;

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getFlowType() {
        return flowType;
    }

    public void setFlowType(String flowType) {
        this.flowType = flowType;
    }

    public String getFlowName() {
        return flowName;
    }

    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    public void validate(List<FlowModel> flowList)
            throws FormValidationException {
        if (this.flowName == null || "".equals(this.flowName)) {
            throw new FormValidationException("Flow Name is required.");
        }
        for (FlowModel flowModel : flowList) {
            if (flowModel.getFlowName().equals(this.flowName)) {
                throw new FormValidationException("Flow Name should be unique.");
            }
        }
    }
}
