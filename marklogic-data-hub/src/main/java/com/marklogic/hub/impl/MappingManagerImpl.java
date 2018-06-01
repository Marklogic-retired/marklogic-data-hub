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
package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.modulesloader.impl.AssetFileLoader;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.error.EntityServicesGenerationException;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.FileUtils;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

import static com.marklogic.hub.impl.HubConfigImpl.logger;

public class MappingManagerImpl extends LoggingObject implements MappingManager {
    private static final String MAPPING_FILE_EXTENSION = ".mapping.json";

    private HubConfig hubConfig;

    public MappingManagerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override public void createMapping(String mappingName) {

    }

    @Override public void deleteMapping(String mappingName) {

    }

    @Override public ArrayList<String> getMappings() {
        ArrayList<String> mappingNames = new ArrayList<>();

        return mappingNames;
    }


    @Override public Mapping getMapping(String mappingName) {
        Mapping mapping = null;

        return mapping;
    }


    private HubModuleManager getPropsMgr() {
        String timestampFile = hubConfig.getUserModulesDeployTimestampFile();
        HubModuleManager propertiesModuleManager = new HubModuleManager(timestampFile);
        return propertiesModuleManager;
    }

    private List<JsonNode> getAllMappings() {
        List<JsonNode> mappings = new ArrayList<>();
        Path mappingsPath = hubConfig.getHubMappingsDir();
        File[] mappingFiles = mappingsPath.toFile().listFiles(pathname -> pathname.isDirectory() && !pathname.isHidden());
        List<String> mappingNames;
        if (mappingFiles != null) {
            mappingNames = Arrays.stream(mappingFiles)
                .map(file -> file.getName())
                .collect(Collectors.toList());

            ObjectMapper objectMapper = new ObjectMapper();
            try {
                boolean hasOneChanged = false;
                for (String mappingName : mappingNames) {
                    File[] mappingDefs = mappingsPath.resolve(mappingName).toFile().listFiles((dir, name) -> name.endsWith(MAPPING_FILE_EXTENSION));
                    for (File mappingDef : mappingDefs) {
                        FileInputStream fileInputStream = new FileInputStream(mappingDef);
                        mappings.add(objectMapper.readTree(fileInputStream));
                        fileInputStream.close();
                    }
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

        }
        return mappings;
    }

    private List<JsonNode> getModifiedRawMappings(long minimumFileTimestampToLoad) {
        logger.debug("min modified: " + minimumFileTimestampToLoad);
        HubModuleManager propsManager = getPropsMgr();
        propsManager.setMinimumFileTimestampToLoad(minimumFileTimestampToLoad);

        List<JsonNode> mappings = new ArrayList<>();
        List<JsonNode> tempMappings = new ArrayList<>();
        Path mappingsPath = hubConfig.getHubMappingsDir();
        File[] mappingFiles = mappingsPath.toFile().listFiles(pathname -> pathname.isDirectory() && !pathname.isHidden());
        List<String> mappingNames;
        if (mappingFiles != null) {
            mappingNames = Arrays.stream(mappingFiles)
                .map(file -> file.getName())
                .collect(Collectors.toList());

            ObjectMapper objectMapper = new ObjectMapper();
            try {
                boolean hasOneChanged = false;
                for (String mappingName : mappingNames) {
                    File[] mappingDefs = mappingsPath.resolve(mappingName).toFile().listFiles((dir, name) -> name.endsWith(MAPPING_FILE_EXTENSION));
                    for (File mappingDef : mappingDefs) {
                        if (propsManager.hasFileBeenModifiedSinceLastLoaded(mappingDef)) {
                            hasOneChanged = true;
                        }
                        FileInputStream fileInputStream = new FileInputStream(mappingDef);
                        tempMappings.add(objectMapper.readTree(fileInputStream));
                        fileInputStream.close();
                    }
                }
                // all or nothing
                if (hasOneChanged) {
                    mappings.addAll(tempMappings);
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

        }
        return mappings;
    }
}
