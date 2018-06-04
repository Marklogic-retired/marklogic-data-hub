/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.HashMap;

public class MappingImpl implements Mapping {

    private String name;
    private String sourceContext;
    private String targetEntityType;
    private String description;
    private String language;
    private String version;
    private HashMap<String, ObjectNode> properties;

    public MappingImpl(String name) {
        this.name = name;
        this.language = "zxx";
        this.version = "1";
    }


    @Override
    public String getVersion() {
        return version;
    }

    @Override
    public void setVersion(String version) {
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
    public String getLanguage() {
        return language;
    }

    @Override
    public void setLanguage(String language) {
        this.language = language;
    }
}
