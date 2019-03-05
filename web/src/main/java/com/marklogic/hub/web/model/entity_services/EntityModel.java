/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web.model.entity_services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.web.model.FlowModel;

import java.util.List;

public class EntityModel extends JsonPojo {

    protected String filename;
    protected HubUIData hubUi;
    protected InfoType info;
    protected DefinitionsType definitions;
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
    @JsonUnwrapped
    public DefinitionsType getDefinitions() {
        return definitions;
    }

    /**
     * Sets the value of the definitions property.
     *
     * @param value
     *     allowed object is
     *     {@link DefinitionsType }
     *
     */
    public void setDefinitions(DefinitionsType value) {
        this.definitions = value;
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

        entityModel.setDefinitions(DefinitionsType.fromJson(node.get("definitions")));
        return entityModel;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        writeObjectIf(node, "info", info);

        node.set("definitions",definitions.toJson());

        return node;
    }
}
