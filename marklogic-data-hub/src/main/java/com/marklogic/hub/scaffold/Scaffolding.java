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

package com.marklogic.hub.scaffold;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.impl.ScaffoldingImpl;

import java.nio.file.Path;
import java.util.List;

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
    static Scaffolding create(String projectDir, DatabaseClient databaseClient) {
        return new ScaffoldingImpl(projectDir, databaseClient);
    }

    /**
     * Returns the directory of the flow
     * @param entityName - the entity name
     * @param flowName - the name of the flow
     * @param flowType - FlowType (sjs or xqy)
     * @return the directory path as a Path type
     */
    Path getFlowDir(String entityName, String flowName, FlowType flowType);

    /**
     * Creates an entity given a string name
     * @param entityName - the name of the entity as string
     */
    void createEntity(String entityName);

    /**
     * Creates a flow for an entity with Entity Services model as default
     * @param entityName - name of the entity to associate the flow with
     * @param flowName - the name of the flow as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @param codeFormat - the format of the code as CodeFormat enum
     * @param dataFormat - the format of the data (json or xml)
     */
    void createFlow(String entityName, String flowName,
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
    void createFlow(String entityName, String flowName,
                    FlowType flowType, CodeFormat codeFormat,
                    DataFormat dataFormat, boolean useEsModel);

    /**
     * Updates a legacy flow on disk
     * @param fromVersion - string version number of DHF
     * @param entityName - the entity which the flow is attached
     * @return a list of updated flows by name
     */
    List<String> updateLegacyFlows(String fromVersion, String entityName);

    /**
     * Update a specific entity that's legacy
     * @param entityName - name of the entity
     */
    void updateLegacyEntity(String entityName);

    /**
     * Update a legacy flow
     * @param fromVersion - string version number of DHF
     * @param entityName - the entity which the flow is attached
     * @param flowName - the name of the flow as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @return
     */
    boolean updateLegacyFlow(String fromVersion, String entityName, String flowName, FlowType flowType);

    /**
     * Creates a rest extension on disk to be deployed to server
     * @param entityName - the entity which the flow is attached
     * @param extensionName - the name of the extension as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @param codeFormat - the format of the code as CodeFormat enum
     * @throws ScaffoldingValidationException
     */
    void createRestExtension(String entityName, String extensionName,
                             FlowType flowType, CodeFormat codeFormat) throws ScaffoldingValidationException;

    /**
     * Creates a rest transform on disk to be deployed to server
     * @param entityName - the entity which the flow is attached
     * @param transformName - the name of the transform as a string
     * @param flowType - the type of flow as TypeFlow, eg: harmonize or ingest
     * @param codeFormat - the format of the code as CodeFormat enum
     * @throws ScaffoldingValidationException
     */
    void createRestTransform(String entityName, String transformName,
                             FlowType flowType, CodeFormat codeFormat) throws ScaffoldingValidationException;
}
