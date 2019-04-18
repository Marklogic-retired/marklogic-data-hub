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

package com.marklogic.hub.scaffold;

import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;

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
     * Creates and returns a Scaffolding object
     * @param projectDir - the path to the project as a string
     * @param databaseClient - the database client that will be used to connect
     * @return Scaffolding object with project directory and database set
     */
    //static Scaffolding create(String projectDir, DatabaseClient databaseClient) {
        //return new ScaffoldingImpl(projectDir, databaseClient);
    //}

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
     * Create default flow with all the default steps
     * @param flowName - the name of the flow
     */
    void createDefaultFlow(String flowName);

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

    /**
     * Creates a rest extension on disk to be deployed to server
     * @param entityName - the entity which the flow is attached
     * @param extensionName - the name of the extension as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @param codeFormat - the format of the code as CodeFormat enum
     * @throws ScaffoldingValidationException - thrown if the extension fails to pass validation
     */
    void createRestExtension(String entityName, String extensionName,
                             FlowType flowType, CodeFormat codeFormat) throws ScaffoldingValidationException;

    /**
     * Creates a rest transform on disk to be deployed to server
     * @param entityName - the entity which the flow is attached
     * @param transformName - the name of the transform as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @param codeFormat - the format of the code as CodeFormat enum
     * @throws ScaffoldingValidationException - thrown if the extension fails to pass validation
     */
    void createRestTransform(String entityName, String transformName,
                             FlowType flowType, CodeFormat codeFormat) throws ScaffoldingValidationException;
}
