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
package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.web.model.MappingModel;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;

@Service
public class MappingManagerService {

    private static final String PLUGINS_DIR = "plugins";
    private static final String MAPPINGS_DIR = "mappings";
    public static final String MAPPING_FILE_EXTENSION = ".mapping.json";

    private static Logger logger = LoggerFactory.getLogger(MappingManagerService.class);

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    private MappingManager mappingManager;

    @Autowired
    private Scaffolding scaffolding;

    @Autowired
    HubConfigImpl hubConfig;

    public ArrayList<Mapping> getMappings() {
        ArrayList<Mapping> mappings = mappingManager.getMappings();

        return mappings;
    }

    public ArrayList<String> getMappingsNames() {
        ArrayList<String> mappings = mappingManager.getMappingsNames();

        return mappings;
    }

    public MappingModel saveMapping(String mapName, JsonNode jsonMapping) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        MappingModel mapping = objectMapper.readValue(jsonMapping.toString(), MappingModel.class);
        MappingModel existingMapping= getMapping(mapName, false);
        if (existingMapping == null || existingMapping != null && !existingMapping.isEqual(mapping)) {
            mappingManager.saveMapping(mappingManager.createMappingFromJSON(mapping.toJson()),  existingMapping == null ? false : true);
            dataHubService.reinstallUserModules(hubConfig, null, null);
        }
        return mapping;
    }

    public void deleteMapping(String mapping) throws IOException {
        Path dir = hubConfig.getHubMappingsDir().resolve(mapping);
        if (dir.toFile().exists()) {
            watcherService.unwatch(dir.getParent().toString());
            FileUtils.deleteDirectory(dir.toFile());
        }
    }

    public MappingModel getMapping(String mappingName, boolean createIfNotExisted) throws IOException {
        try{
            ObjectMapper objectMapper = new ObjectMapper();
            return MappingModel.fromJson(objectMapper.readTree(mappingManager.getMappingAsJSON(mappingName, -1, createIfNotExisted)));
        }catch(DataHubProjectException e) {
            logger.error("Mapping not found in project: " + mappingName);
            return null;
        }
    }

}
