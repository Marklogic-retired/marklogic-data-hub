package com.marklogic.hub.web.form;

import java.util.List;

import com.marklogic.hub.exception.FormValidationException;
import com.marklogic.hub.model.DomainModel;

public class DomainForm extends BaseForm {

    private String domainName;
    private String inputFlowName;
    private String conformFlowName;

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getInputFlowName() {
        return inputFlowName;
    }

    public void setInputFlowName(String inputFlowName) {
        this.inputFlowName = inputFlowName;
    }

    public String getConformFlowName() {
        return conformFlowName;
    }

    public void setConformFlowName(String conformFlowName) {
        this.conformFlowName = conformFlowName;
    }

    public void validate(List<DomainModel> domainList) {
        if (this.domainName == null || "".equals(this.domainName.trim())) {
            throw new FormValidationException("Domain Name is required.");
        }
        for (DomainModel domainModel : domainList) {
            if (domainModel.getDomainName().equals(this.domainName)) {
                throw new FormValidationException(
                        "Domain Name should be unique.");
            }
        }
        if ((this.inputFlowName == null || "".equals(this.inputFlowName.trim()))
                && (this.conformFlowName == null || ""
                        .equals(this.conformFlowName.trim()))) {
            throw new FormValidationException(
                    "Either the Ingest Flow Name or the Conformance Flow Name must be supplied.");
        }
    }
}
