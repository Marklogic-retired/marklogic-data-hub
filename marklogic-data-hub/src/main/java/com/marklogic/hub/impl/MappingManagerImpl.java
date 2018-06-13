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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;


public class MappingManagerImpl extends LoggingObject implements MappingManager {

    private static MappingManagerImpl mappingManager;
    public final String MAPPING_FILE_EXTENSION = ".mapping.json";
    private HubConfig hubConfig;


    private MappingManagerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    static public MappingManager getInstance(HubConfig hubConfig){
        if(mappingManager == null){
            mappingManager = new MappingManagerImpl(hubConfig);
        }
        return (MappingManager)mappingManager;
    }

    @Override public Mapping createMapping(String mappingName) {
        Mapping newMap = null;

        if(getMapping(mappingName) != null){

        }

        return newMap;
    }

    @Override public Mapping createMappingFromJSON(String json) {
        Mapping newMap = null;


        return newMap;
    }

    @Override public void deleteMapping(String mappingName) throws IOException {
        Path dir = getMappingDirPath(mappingName);
        if (dir.toFile().exists()) {
            FileUtils.deleteDirectory(dir.toFile());
        }
    }

    @Override public void saveMapping(Mapping mapping) throws IOException{
        Scaffolding scaffold = Scaffolding.create(hubConfig.getProjectDir(), hubConfig.newStagingManageClient());
        scaffold.createMappingDir(mapping.getName());

        try {
            String  mappingString = mapping.serialize();
            Path dir = getMappingDirPath(mapping.getName());
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            String mappingFileName = mapping.getName() + "-" + mapping.getVersion() + MAPPING_FILE_EXTENSION;
            File file = Paths.get(dir.toString(), mappingFileName).toFile();

            ObjectMapper objectMapper = new ObjectMapper();
            FileOutputStream fileOutputStream = new FileOutputStream(file);
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(fileOutputStream, mappingString);
            fileOutputStream.flush();
            fileOutputStream.close();
        } catch (JsonProcessingException e) {
            throw new DataHubProjectException("Could not serialize mapping for project.");
        }

    }

    @Override public ArrayList<String> getMappingsNames() {
        ArrayList<String> mappingNames = new ArrayList<>();

        return mappingNames;
    }

    @Override public ArrayList<Mapping> getMappings() {
        ArrayList<Mapping> mappings = new ArrayList<>();

        return mappings;
    }


    @Override public Mapping getMapping(String mappingName) {
        ArrayList<Mapping> mappings = getMappings();

        for (Mapping mapping : mappings) {
            if (mapping.getName().equals(mappingName)) {
                return mapping;
            }
        }
        throw new DataHubProjectException("Mapping not found in project: " + mappingName);
    }


    @Override public String getMappingAsJSON(String mappingName) {
        Mapping mapping = null;


        return "";
    }

    private Path getMappingDirPath(String mappingName){
        return Paths.get(hubConfig.getHubMappingsDir().toString(), mappingName);
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
