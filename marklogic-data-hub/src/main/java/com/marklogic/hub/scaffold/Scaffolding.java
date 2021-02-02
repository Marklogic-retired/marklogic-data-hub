/*
 * Copyright (c) 2021 MarkLogic Corporation
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

package com.marklogic.hub.scaffold;

import com.marklogic.hub.HubProject;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;

import java.io.File;
import java.nio.file.Path;

/**
 * Interface that handles the management of DHF projects on disk
 *
 * Includes creating entities, flows, rest extensions, and transforms for an already initialized project
 *
 * @see HubProject for the initialization of the project itself to disk
 */
public interface Scaffolding {

    /**
     * Returns the directory of the flow
     * @param entityName - the entity name
     * @param flowName - the name of the flow
     * @param flowType - FlowType (sjs or xqy)
     * @return the directory path as a Path type
     */
    Path getLegacyFlowDir(String entityName, String flowName, FlowType flowType);

    /**
     * Creates an entity given a string name
     * @param entityName - the name of the entity as string
     */
    void createEntity(String entityName);

    /**
     * Creates a legacy mapping given a string name
     * @param mappingName - the name of the mapping as string
     */
    void createLegacyMappingDir(String mappingName);

    /**
     * Creates a mapping given a string name
     * @param mappingName - the name of the mapping as string
     */
    void createMappingDir(String mappingName);

    /**
     * Creates a custom module given a string stepName
     * @param stepName - the name of the step as string
     * @param stepType - the type of the step as string
     */
    void createCustomModule(String stepName, String stepType);

    /**
     * Creates a custom module given a string stepName
     * @param stepName - the name of the step as string
     * @param stepType - the type of the step as string
     * @param format - the format of the custom module (allowed values are xqy, sjs)
     */
    void createCustomModule(String stepName, String stepType, String format);

    /**
     * Create default flow with all the default steps
     * @param flowName - the name of the flow
     * @return the File that the flow was written to
     */
    File createDefaultFlow(String flowName);

    /**
     * Creates a flow for an entity with Entity Services model as default
     * @param entityName - name of the entity to associate the flow with
     * @param flowName - the name of the flow as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @param codeFormat - the format of the code as CodeFormat enum
     * @param dataFormat - the format of the data (json or xml)
     */
    void createLegacyFlow(String entityName, String flowName,
                          FlowType flowType, CodeFormat codeFormat,
                          DataFormat dataFormat);

    /**
     * Creates a flow for an entity with an additional option for using Entity Services
     * @param entityName - name of the entity to associate the flow with
     * @param flowName - the name of the flow as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @param codeFormat - the format of the code as CodeFormat enum
     * @param dataFormat - the format of the data (json or xml)
     * @param useEsModel - true to use Entity Services, false not to
     */
    void createLegacyFlow(String entityName, String flowName,
                          FlowType flowType, CodeFormat codeFormat,
                          DataFormat dataFormat, boolean useEsModel);

    /**
     * Creates a flow for an entity with an additional option for using Entity Services
     * @param entityName - name of the entity to associate the flow with
     * @param flowName - the name of the flow as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @param codeFormat - the format of the code as CodeFormat enum
     * @param dataFormat - the format of the data (json or xml)
     * @param useEsModel - true to use Entity Services, false not to
     * @param mappingNameWithVersion - the name of the mapping name and version together (name-version) you wish to use to generate the content plugin
     */
    void createLegacyFlow(String entityName, String flowName,
                          FlowType flowType, CodeFormat codeFormat,
                          DataFormat dataFormat, boolean useEsModel, String mappingNameWithVersion);


    /**
     * Update a specific entity that's legacy
     * @param entityName - name of the entity
     */
    void updateLegacyEntity(String entityName);
}
