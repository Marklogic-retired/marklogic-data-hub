/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.mapping;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.entity.DefinitionType;
import com.marklogic.hub.entity.HubEntity;
import com.marklogic.hub.entity.InfoType;
import com.marklogic.hub.entity.PropertyType;
import com.marklogic.hub.error.DataHubProjectException;

import java.util.HashMap;

@JsonPropertyOrder({ "lang", "name", "description", "version",  "targetEntityType", "sourceContext", "sourceURI", "properties"})
public class MappingImpl implements Mapping {

    private String name;
    private String sourceContext;
    private String targetEntityType;
    private String description;
    private String lang;
    private int version;
    private String sourceURI;
    private HashMap<String, ObjectNode> properties;

    public MappingImpl(String name) {
        this.name = name;
        this.lang = "zxx";
        this.version = 1;
        this.description = "Default description";
        this.sourceContext = "/";
        this.sourceURI = "";
        this.properties = new HashMap<>();
        properties.put("id", createProperty("sourcedFrom", "id"));
        this.targetEntityType = "http://example.org/modelName-version/entityType";
    }

    public MappingImpl(String name, HubEntity entity) {
        this(name);
        if (entity != null) {
            InfoType info = entity.getInfo();
            if (info != null) {
                String prefix = info.getBaseUri() != null ? info.getBaseUri(): "";
                this.targetEntityType = prefix + info.getTitle() + "-" + info.getVersion() + "/" + info.getTitle();
                DefinitionType definition = entity.getDefinitions().getDefinitions().get(info.getTitle());
                if (definition != null) {
                    this.properties.clear();
                    for (PropertyType property: definition.getProperties()) {
                        String propertyName = property.getName();
                        properties.put(propertyName, createProperty("sourcedFrom", propertyName));
                    }
                }
            }
        }
    }

    @Override
    public Mapping deserialize(JsonNode json) {
        ObjectMapper mapper = new ObjectMapper();
        HashMap<String, ObjectNode> jsonProperties = new HashMap<>();
        try {
            jsonProperties = mapper.treeToValue(json.get("properties"), HashMap.class);
        } catch (JsonProcessingException e) {
            throw new DataHubProjectException("Could not parse mapper properties");
        }

        if(json.has("version")) {
            setVersion(json.get("version").asInt());
        }
        if(json.has("name")) {
            setName(json.get("name").asText());
        }
        if(json.has("sourceContext")) {
            setSourceContext(json.get("sourceContext").asText());
        }

        if(json.has("description")) {
            setDescription(json.get("description").asText());
        }

        if(json.has("targetEntityType")) {
            setTargetEntityType(json.get("targetEntityType").asText());
        }

        if(json.has("language")) {
            setLang(json.get("language").asText());
        }
        if(json.has("lang")) {
            setLang(json.get("lang").asText());
        }

        if(json.has("sourceURI")) {
            setSourceURI(json.get("sourceURI").asText());
        }

        if(json.has("properties")) {
            setProperties(jsonProperties);
        }

        return this;
    }

    private ObjectNode createProperty(String name, String value) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode node = mapper.createObjectNode();
        node.put(name, value);
        return node;
    }

    @Override
    public int getVersion() {
        return version;
    }

    @Override
    public void setVersion(int version) {
        this.version = version;
    }

    @Override
    public HashMap<String, ObjectNode> getProperties() {
        return properties;
    }

    @Override
    public void setProperties(HashMap<String, ObjectNode> properties) {
        this.properties = properties;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String getSourceContext() {
        return sourceContext;
    }

    @Override
    public void setSourceContext(String sourceContext) {
        this.sourceContext = sourceContext;
    }

    @Override
    public String getTargetEntityType() {
        return targetEntityType;
    }

    @Override
    public void setTargetEntityType(String targetEntityType) {
        this.targetEntityType = targetEntityType;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Override
    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String getSourceURI() {
        return sourceURI;
    }

    @Override
    public void setSourceURI(String sourceURI) {
        this.sourceURI = sourceURI;
    }

    @Override
    @Deprecated
    public String getLanguage() {
        return lang;
    }

    @Override
    @Deprecated
    public void setLanguage(String language) {
        this.lang = language;
    }

    @Override
    public String getLang() {
        return lang;
    }

    @Override
    public void setLang(String lang) {
        this.lang = lang;
    }

    @Override
    public String serialize() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
        throw new DataHubProjectException("Unable to serialize mapping object.");
    }
    }

    @Override
    public void incrementVersion() {
        setVersion(getVersion()+1);
    }
}
