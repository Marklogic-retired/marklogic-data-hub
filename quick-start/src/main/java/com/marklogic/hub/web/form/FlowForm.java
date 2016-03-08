package com.marklogic.hub.web.form;

import java.util.List;

import com.marklogic.client.io.Format;
import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.exception.FormValidationException;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.model.FlowModel;

public class FlowForm extends BaseForm {

    private String entityName;
    private FlowType flowType;
    private String flowName;
    private PluginFormat pluginFormat;
    private Format dataFormat;

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public FlowType getFlowType() {
        return flowType;
    }

    public void setFlowType(String flowType) {
        this.flowType = FlowType.getFlowType(flowType);
    }

    public PluginFormat getPluginFormat() {
        return pluginFormat;
    }

    public void setPluginFormat(String pluginFormat) {
        this.pluginFormat = PluginFormat.getPluginFormat(pluginFormat);
    }

    public Format getDataFormat() {
        return dataFormat;
    }

    public void setDataFormat(String dataFormat) {
        this.dataFormat = Format.getFromMimetype(dataFormat);
    }

    public String getFlowName() {
        return flowName;
    }

    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    public void validate(List<FlowModel> flowList)
            throws FormValidationException {
        if (this.flowName == null || "".equals(this.flowName.trim())) {
            throw new FormValidationException("Flow Name is required.");
        }
        for (FlowModel flowModel : flowList) {
            if (flowModel.getFlowName().equals(this.flowName)) {
                throw new FormValidationException("Flow Name should be unique.");
            }
        }
    }
}
