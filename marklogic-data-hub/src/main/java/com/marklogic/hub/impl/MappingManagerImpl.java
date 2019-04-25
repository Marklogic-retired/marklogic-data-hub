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
package com.marklogic.hub.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.mapping.MappingImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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


@Component
public class MappingManagerImpl extends LoggingObject implements MappingManager {

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private HubProject hubProject;

    @Autowired
    private Scaffolding scaffolding;


    @Override public Mapping createMapping(String mappingName) {
        try {
            getMapping(mappingName);
            throw new DataHubProjectException("Mapping with that name already exists");
        }
        catch (DataHubProjectException e) {
           return Mapping.create(mappingName);
        }
    }

    @Override public Mapping createMappingFromJSON(String json) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readValue(json, JsonNode.class);
        return mapper.treeToValue(node, MappingImpl.class);
    }

    @Override public Mapping createMappingFromJSON(JsonNode json) throws IOException {
        Mapping newMap = Mapping.create("default");
        newMap.deserialize(json);
        return newMap;
    }

    @Override public void deleteMapping(String mappingName) {
        Path dir = getMappingDirPath(mappingName);
        if (dir.toFile().exists()) {
            try {
                FileUtils.deleteDirectory(dir.toFile());
            } catch (IOException e){
                throw new DataHubProjectException("Could not delete mapping for project.");
            }
        }
    }

    @Override public void saveMapping(Mapping mapping) {
        saveMapping(mapping, false);
    }

    @Override public void saveMapping(Mapping mapping, boolean autoIncrement) {
        scaffolding.createMappingDir(mapping.getName());

        try {
            if(autoIncrement){
                mapping.incrementVersion();;
            }
            String mappingString = mapping.serialize();
            Path dir = getMappingDirPath(mapping.getName());
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            String mappingFileName = mapping.getName() + "-" + mapping.getVersion() + MAPPING_FILE_EXTENSION;
            File file = Paths.get(dir.toString(), mappingFileName).toFile();
            //create the object mapper to pretty print to disk
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
            Object json = objectMapper.readValue(mappingString, Object.class);
            FileOutputStream fileOutputStream = new FileOutputStream(file);
            fileOutputStream.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json).getBytes());
            fileOutputStream.flush();
            fileOutputStream.close();
        } catch (JsonProcessingException e) {
            throw new DataHubProjectException("Could not serialize mapping for project.");
        } catch (IOException e){
            throw new DataHubProjectException("Could not write mapping to disk for project.");
        }
    }

    @Override public ArrayList<String> getMappingsNames() {
        return (ArrayList<String>)FileUtil.listDirectFolders(hubConfig.getHubMappingsDir().toFile());
    }

    @Override public ArrayList<Mapping> getMappings() {
        ArrayList<Mapping> mappings = new ArrayList<>();
        ArrayList<String> mappingNames = getMappingsNames();
        for(String mappingName : mappingNames) {
          Mapping newMap = getMappingVersion(mappingName);
          if(newMap != null) {
              mappings.add(newMap);
          }
        }

        return mappings;
    }

    private Mapping getMappingVersion(String mappingName) {
        return  getMappingVersion(mappingName, -1);
    }

    private Mapping getMappingVersion(String mappingName, int version){
        int mappingExtensionCount = MAPPING_FILE_EXTENSION.length();
        Path mappingPath = Paths.get(hubConfig.getHubMappingsDir().toString(), mappingName);
        List<String> fileNames = FileUtil.listDirectFiles(mappingPath);
        String targetFileName = null;
        int    highestVersion  = -1;
        for(String fileName : fileNames) {
            if(!(fileName.substring(0,mappingName.length()).equalsIgnoreCase(mappingName.toLowerCase()))
                || !(fileName.substring(fileName.length()-mappingExtensionCount).equalsIgnoreCase(MAPPING_FILE_EXTENSION))
                ){
                continue;
            }
            /*  Captures the number between that is in between "-" and  ".mapping.json"
             *  as in test-mapping-5.mapping.json would set parsedFileNameVersion to "5"
             */
            String parsedFileNameVersion = fileName.replaceAll(".+\\-([0-9]+)\\.mapping\\.json" , "$1");
            int fileNameVersion = Integer.parseInt(parsedFileNameVersion);
            if( version == -1 && fileNameVersion > highestVersion){
                highestVersion = fileNameVersion;
                targetFileName = fileName;
            } else if(version != -1 && fileNameVersion == version) {
                targetFileName = fileName;
                break;
            }
        }
        if(targetFileName !=null ){
            try {
                //String jsonMap = new String(Files.readAllBytes(mappingPath.resolve(targetFileName)), StandardCharsets.UTF_8);
                FileInputStream fileInputStream = new FileInputStream(mappingPath.resolve(targetFileName).toFile());
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode node = objectMapper.readTree(fileInputStream);
                Mapping newMap = createMappingFromJSON(node);
                if(newMap != null && newMap.getName().length() > 0) {
                    return newMap;
                }
            } catch (IOException e) {
                throw new DataHubProjectException("Could not read mapping on disk.");
            }
        }
        return null;
    }

    @Override public Mapping getMapping(String mappingName) {
        Mapping foundMap = getMappingVersion(mappingName);
        if(foundMap != null){
            return foundMap;
        } else {
            throw new DataHubProjectException("Mapping not found in project: " + mappingName);
        }
    }

    @Override public Mapping getMapping(String mappingName, int version, boolean createIfNotExisted) {
        Mapping foundMap = getMappingVersion(mappingName, version);
        if(foundMap != null){
            return foundMap;
        } else if (createIfNotExisted) {
            return Mapping.create(mappingName);
        } else {
            throw new DataHubProjectException("Mapping not found in project: " + mappingName);
        }
    }


    @Override public String getMappingAsJSON(String mappingName) {
        Mapping mapping = getMapping(mappingName);
        String jsonMap = null;
        if(mapping != null){
            jsonMap = mapping.serialize();
        }
        return jsonMap;
    }

    @Override public String getMappingAsJSON(String mappingName, int version, boolean createIfNotExisted) {
        Mapping mapping = getMapping(mappingName, version, createIfNotExisted);
        String jsonMap = null;
        if(mapping != null){
            jsonMap = mapping.serialize();
        }
        return jsonMap;
    }

    private Path getMappingDirPath(String mappingName){
        return Paths.get(hubConfig.getHubMappingsDir().toString(), mappingName);
    }


    private HubModuleManager getPropsMgr() {
        String timestampFile = hubProject.getUserModulesDeployTimestampFile();
        HubModuleManager propertiesModuleManager = new HubModuleManager(timestampFile);
        return propertiesModuleManager;
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
