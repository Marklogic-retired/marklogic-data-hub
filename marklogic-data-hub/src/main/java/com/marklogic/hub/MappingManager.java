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
package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.mapping.Mapping;

import java.io.IOException;
import java.util.ArrayList;

/**
 * Handles the artifacts associated with mapping of source documents into entity services models.
 */
public interface MappingManager {

    /**
     * String value for the mapping file extension
     */
    String MAPPING_FILE_EXTENSION = ".mapping.json";

    /**
     * Creates a mapping given a string name
     * @param mappingName - the base name of the mapping you want to create
     * @return - a Mapping object
     */
    Mapping createMapping(String mappingName);

    /**
     * Creates a mapping from a given JsonNode
     * @param json - JsonNode
     * @return - a Mapping object
     * @throws IOException - thrown if mapping file cannot be found/read off disk
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
     * @param mappingName - the base-name of the mapping you want to delete as a string
     */
    void deleteMapping(String mappingName);

    /**
     * Returns a list of all mappings currently defined
     * @return - an arraylist of ALL mapping objects from disk
     */
    ArrayList<Mapping> getMappings();

    /**
     * Returns a string list of names for all mappings currently defined
     * @return - A list of strings that represent mapping names
     */
    ArrayList<String> getMappingsNames();

    /**
     * Returns a mapping based on the provided name
     * @param mappingName - the basename of the mapping
     * @return Mapping object for the defined map
     */
    Mapping getMapping(String mappingName);

    /**
     * Returns a mapping based on the provided name
     * @param mappingName - name of the map
     * @param version - the version of the mapping
     * @param createIfNotExisted - create mapping object if true, otherwise throws exception
     * @return Mapping object for the defined map
     */
    Mapping getMapping(String mappingName, int version, boolean createIfNotExisted);
}
