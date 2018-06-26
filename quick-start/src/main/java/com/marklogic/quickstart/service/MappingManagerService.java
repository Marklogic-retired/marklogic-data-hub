/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.model.MappingModel;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class MappingManagerService extends EnvironmentAware {

    private static final String PLUGINS_DIR = "plugins";
    private static final String MAPPINGS_DIR = "mappings";
    public static final String MAPPING_FILE_EXTENSION = ".mapping.json";

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private DataHubService dataHubService;

    private MappingManager mappingManager = MappingManager.getMappingManager(envConfig().getMlSettings());

    public ArrayList<MappingModel> getMappings() throws IOException {

        String projectDir = envConfig().getProjectDir();

        ArrayList<MappingModel> mappings = new ArrayList<>();
        Path mappingsPath = Paths.get(envConfig().getProjectDir(), PLUGINS_DIR, MAPPINGS_DIR);
        List<String> mappingNames = FileUtil.listDirectFolders(mappingsPath.toFile());
        ObjectMapper objectMapper = new ObjectMapper();
        for (String mappingName : mappingNames) {
            File[] mappingDefs = mappingsPath.resolve(mappingName).toFile().listFiles((dir, name) -> name.endsWith(MAPPING_FILE_EXTENSION));
            for (File mappingDef : mappingDefs) {
                FileInputStream fileInputStream = new FileInputStream(mappingDef);
                JsonNode node = objectMapper.readTree(fileInputStream);
                fileInputStream.close();
                MappingModel mappingModel = MappingModel.fromJson(mappingDef.getAbsolutePath(), node);
                if (mappingModel != null) {
                    mappings.add(mappingModel);
                }
            }
        }

        return mappings;
    }

    public MappingModel createMapping(String projectDir, MappingModel newMapping) throws IOException {
        Scaffolding scaffolding = Scaffolding.create(projectDir, envConfig().getFinalClient());
        scaffolding.createMappingDir(newMapping.getName());

        return getMapping(newMapping.getName());
    }

    public MappingModel saveMapping(String mapName, JsonNode jsonMapping) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        MappingModel mapping = objectMapper.readValue(jsonMapping.toString(), MappingModel.class);
        if( getMapping(mapName) == null) {
            String projectDir = envConfig().getProjectDir();
            createMapping(projectDir, mapping);
        }
        return mapping;
    }

    public void deleteMapping(String mapping) throws IOException {
        Path dir = Paths.get(envConfig().getProjectDir(), PLUGINS_DIR, MAPPINGS_DIR, mapping);
        if (dir.toFile().exists()) {
            watcherService.unwatch(dir.getParent().toString());
            FileUtils.deleteDirectory(dir.toFile());
        }
    }

    public MappingModel getMapping(String mappingName) throws IOException {
        if(mappingManager.getMapping(mappingName, -1) != null){
            return mappingManager.getMapping(mappingName, -1);
        }
        throw new DataHubProjectException("Mapping not found in project: " + mappingName);
    }

}
