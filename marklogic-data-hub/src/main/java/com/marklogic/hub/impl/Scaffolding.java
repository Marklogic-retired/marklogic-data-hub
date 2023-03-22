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

package com.marklogic.hub.impl;

import com.marklogic.hub.HubProject;

import java.io.File;

/**
 * Interface that handles the management of DHF projects on disk
 *
 * Includes creating entities, flows, rest extensions, and transforms for an already initialized project
 *
 * @see HubProject for the initialization of the project itself to disk
 */
public interface Scaffolding {

    /**
     * Creates an entity given a string name
     * @param entityName - the name of the entity as string
     */
    void createEntity(String entityName);

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
}
