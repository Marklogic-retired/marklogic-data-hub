package com.marklogic.quickstart.model.entity_services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.quickstart.model.FlowModel;

import java.util.List;

public class EntityModel extends JsonPojo {

    protected String filename;
    protected HubUIData hubUi;
    protected InfoType info;
    protected DefinitionType definition;
    public List<FlowModel> inputFlows;
    public List<FlowModel> harmonizeFlows;


    @JsonIgnore
    public String getName() {
        return getInfo().getTitle();
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public HubUIData getHubUi() {
        return hubUi;
    }

    public void setHubUi(HubUIData hubUi) {
        this.hubUi = hubUi;
    }

    /**
     * Gets the value of the info property.
     *
     * @return
     *     possible object is
     *     {@link InfoType }
     *
     */
    public InfoType getInfo() {
        return info;
    }

    /**
     * Sets the value of the info property.
     *
     * @param value
     *     allowed object is
     *     {@link InfoType }
     *
     */
    public void setInfo(InfoType value) {
        this.info = value;
    }

    /**
     * Gets the value of the definitions property.
     *
     * @return
     *     possible object is
     *     {@link DefinitionsType }
     *
     */
    public DefinitionType getDefinition() {
        return definition;
    }

    /**
     * Sets the value of the definitions property.
     *
     * @param value
     *     allowed object is
     *     {@link DefinitionsType }
     *
     */
    public void setDefinition(DefinitionType value) {
        this.definition = value;
    }

    public List<FlowModel> getInputFlows() {
        return inputFlows;
    }

    public void setInputFlows(List<FlowModel> inputFlows) {
        this.inputFlows = inputFlows;
    }

    public List<FlowModel> getHarmonizeFlows() {
        return harmonizeFlows;
    }

    public void setHarmonizeFlows(List<FlowModel> harmonizeFlows) {
        this.harmonizeFlows = harmonizeFlows;
    }

    public static EntityModel fromJson(String filename, JsonNode node) {
        EntityModel entityModel = new EntityModel();
        entityModel.setFilename(filename);
        entityModel.setInfo(InfoType.fromJson(node.get("info")));

        String title = entityModel.getInfo().getTitle();
        entityModel.setDefinition(DefinitionType.fromJson(title, node.get("definitions")));
        return entityModel;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        writeObjectIf(node, "info", info);

        ObjectNode definitions = JsonNodeFactory.instance.objectNode();
        definitions.set(info.getTitle(), definition.toJson());
        node.set("definitions",definitions);

        return node;
    }
}
