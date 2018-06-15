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
package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.util.JSONPObject;
import com.marklogic.hub.impl.MappingManagerImpl;
import com.marklogic.hub.mapping.Mapping;

import java.io.IOException;
import java.util.ArrayList;

public interface MappingManager {

    /**
     * String value for the mapping file extension
     */
    String MAPPING_FILE_EXTENSION = ".mapping.json";

    /**
     * Grabs the Mapping Manager instance and uses the given hubConfig
     * @param hubConfig
     * @return A mapping manager instance
     */
    static MappingManager getMappingManager(HubConfig hubConfig) {
        return MappingManagerImpl.getInstance(hubConfig);
    };

    /**
     * Creates a mapping given a string name
     * @param mappingName
     */
    Mapping createMapping(String mappingName);

    /**
     * Creates a mapping from a given JSON string
     * @param json - string representation of json
     */
    Mapping createMappingFromJSON(String json) throws IOException;

    /**
     * Creates a mapping from a given JsonNode
     * @param json - JsonNode
     */
    Mapping createMappingFromJSON(JsonNode json) throws IOException;


    /**
     * Saves a map to disk
     * @param mapping - the mapping object to be saved
     */
    void saveMapping(Mapping mapping);

    /**
     * Saves a map to disk, incrementing its version by 1
     * @param mapping the mapping object to be saved
     * @param incrementVersion - true to increment version, false if not to
     */
    void saveMapping(Mapping mapping, boolean incrementVersion);

    /**
     * Deletes a defined mapping by string name
     * @param mappingName
     */
    void deleteMapping(String mappingName);

    /**
     * Returns a list of all mappings currently defined
     */
    ArrayList<Mapping> getMappings();

    /**
     * Returns a string list of names for all mappings currently defined
     */
    ArrayList<String> getMappingsNames();

    /**
     * Returns a mapping based on the provided name
     * @param mappingName
     * @return Mapping object for the defined map
     */
    Mapping getMapping(String mappingName);

    /**
     * Returns a mapping based on the provided name
     * @param mappingName - name of the map
     * @param version - the version of the mapping
     * @return Mapping object for the defined map
     */
    Mapping getMapping(String mappingName, int version);

    /**
     * Returns a mapping based on the provided name as JSON string
     * @param mappingName - name of the mapping
     * @return string json respresentation of the mapping object
     */
    String getMappingAsJSON(String mappingName);

    /**
     * Returns a mapping based on the provided name as JSON string
     * @param mappingName - name of the mapping
     * @param version - the version number of the mapping
     * @return string json respresentation of the mapping object
     */
    String getMappingAsJSON(String mappingName, int version);

}
