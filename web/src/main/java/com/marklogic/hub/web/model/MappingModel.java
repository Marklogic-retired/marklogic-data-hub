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
package com.marklogic.hub.web.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.web.model.entity_services.JsonPojo;

public class MappingModel extends JsonPojo {

    protected String filename;

    protected String name;
    protected String sourceContext;
    protected String targetEntityType;
    protected String description;
    protected String sourceURI;
    protected String language;
    protected int version = 1;
    protected JsonNode properties;

    @JsonIgnore
    public String getFilename() {
        return filename;
    }

    public String getVersionedName() {
        return this.name + "-" + this.version;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSourceContext() {
        return sourceContext;
    }

    public void setSourceContext(String sourceContext) {
        this.sourceContext = sourceContext;
    }

    public String getTargetEntityType() {
        return targetEntityType;
    }

    public void setTargetEntityType(String targetEntityType) {
        this.targetEntityType = targetEntityType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSourceURI() {
        return sourceURI;
    }

    public void setSourceURI(String sourceURI) {
        this.sourceURI = sourceURI;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public JsonNode getProperties() {return properties;}

    public void setProperties(JsonNode properties) {this.properties = properties;}

    public static MappingModel fromJson(JsonNode node) {
        MappingModel mapping = new MappingModel();
        mapping.setName(node.get("name").asText());
        mapping.setVersion((node.get("version").asInt()));
        mapping.setDescription(node.get("description").asText());
        mapping.setSourceURI(node.get("sourceURI").asText());
        mapping.setTargetEntityType(node.get("targetEntityType").asText());
        mapping.setSourceContext(node.get("sourceContext").asText());
        mapping.setProperties(node.get("properties"));
        mapping.setLanguage("zxx");

        return mapping;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();

        node.put("version", getVersion());
        if(getLanguage() != null) {
            node.put("language", getLanguage());
        }
        node.put("name", getName());
        node.set("properties", getProperties());
        if(getSourceContext() != null) {
            node.put("sourceContext", getSourceContext());
        }
        if(getTargetEntityType() != null) {
            node.put("targetEntityType", getTargetEntityType());
        }
        if(getDescription() != null) {
            node.put("description", getDescription());
        }
        if(getSourceURI() != null) {
            node.put("sourceURI", getSourceURI());
        }
        return node;
    }
}
