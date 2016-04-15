package com.marklogic.hub.web.form;

import java.util.List;

import com.marklogic.client.io.Format;
import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.exception.FormValidationException;
import com.marklogic.hub.model.EntityModel;

public class EntityForm extends BaseForm {

    private String entityName;
    private String inputFlowName;
    private String harmonizeFlowName;
    private PluginFormat pluginFormat;
    private Format dataFormat;

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getInputFlowName() {
        return inputFlowName;
    }

    public void setInputFlowName(String inputFlowName) {
        this.inputFlowName = inputFlowName;
    }

    public String getHarmonizeFlowName() {
        return harmonizeFlowName;
    }

    public void setHarmonizeFlowName(String harmonizeFlowName) {
        this.harmonizeFlowName = harmonizeFlowName;
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

    public void validate(List<EntityModel> entityList) {
        if (this.entityName == null || "".equals(this.entityName.trim())) {
            throw new FormValidationException("Entity Name is required.");
        }
        if (this.pluginFormat == null) {
            throw new FormValidationException("Extension is required.");
        }
        for (EntityModel entityModel : entityList) {
            if (entityModel.getEntityName().equals(this.entityName)) {
                throw new FormValidationException(
                        "Entity Name should be unique.");
            }
        }
        if ((this.inputFlowName == null || "".equals(this.inputFlowName.trim()))
                && (this.harmonizeFlowName == null || ""
                        .equals(this.harmonizeFlowName.trim()))) {
            throw new FormValidationException(
                    "Either the Ingest Flow Name or the Harmonize Flow Name must be supplied.");
        }
    }
}
