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
package com.marklogic.hub.legacy.flow;

import com.marklogic.hub.legacy.collector.LegacyCollector;
import com.marklogic.hub.main.MainPlugin;

import java.util.Properties;

/**
 * Manages the creation and configuration of flow objects
 */
public interface LegacyFlow {

    /**
     * Sets the entity name for the flow
     * @param entityName the string name of the entity to use in the flow
     */
    void setEntityName(String entityName);

    /**
     * Returns the name of the entity that's been set for the flow in strong form
     * @return entity name in string form
     */
    String getEntityName();

    /**
     * Sets the name of the flow
     * @param name - string representing the name of the flow
     */
    void setName(String name);

    /**
     * Gets the name of the flow
     * @return the name of the flow in string form
     */
    String getName();

    /**
     * Sets the mapping name used to generate the flow
     * @param mappingName - string representing the mapping name for the flow
     */
    void setMappingName(String mappingName);

    /**
     * Gets the mapping name used for the flow
     * @return the mapping name of the flow in string form
     */
    String getMappingName();

    /**
     * Sets the type of the flow
     * @param type - FlowType enum for harmonize or input
     */
    void setType(FlowType type);

    /**
     * Gets the FlowType enum for the flow
     * @return FlowType of ingest or harmonize
     */
    FlowType getType();

    /**
     * Sets the DataFormat for the flow
     * @param dataFormat - DataFormat enum of json or xml
     */
    void setDataFormat(DataFormat dataFormat);

    /**
     * Returns the DataForm enum of the flow
     * @return DataForm enum of json or xml
     */
    DataFormat getDataFormat();

    /**
     * Sets the CodeFormat enum of the flow
     * @param codeFormat enum of sjs or xqy
     */
    void setCodeFormat(CodeFormat codeFormat);

    /**
     * Returns the CodeFormat enum of the flow
     * @return CodeFormat enum of sjs or xqy
     */
    CodeFormat getCodeFormat();

    /**
     * Serializes the flow into an xml string
     * @return a serialized xml string of the flow
     */
    String serialize();

    /**
     * Creates a properties object representing the flow
     * @return a Properties object representation of the flow
     */
    Properties toProperties();

    /**
     * Gets the DbPath (uri) for the flow in string form
     * @return a uri path as a string
     */
    String getFlowDbPath();

    /**
     * Gets the collector to be used for the flow
     * @return the collector object that is used for the flow
     */
    LegacyCollector getCollector();

    /**
     * Sets the legacyCollector to be used for the flow
     * @param collector the legacyCollector to be used for the flow
     */
    void setCollector(LegacyCollector collector);

    /**
     * Gets the main plugin module that the flow is set to use
     * @return MainPlugin object
     */
    MainPlugin getMain();

    /**
     * Sets the main plugin module for the flow
     * @param main - a MainPlugin object that defines the main plugin to be used
     */
    void setMain(MainPlugin main);
}
