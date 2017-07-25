/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.exception.NotFoundException;
import com.marklogic.quickstart.model.EntityModel;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.PluginModel;
import com.marklogic.quickstart.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class EntityManagerService {

    private static final String PLUGINS_DIR = "plugins";
    private static final String ENTITIES_DIR = "entities";
    private static final String ENTITY_FILE_EXTENSION = ".entity.json";

    @Autowired
    private FlowManagerService flowManagerService;

    private EnvironmentConfig envConfig() {
        ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        return authenticationToken.getEnvironmentConfig();
    }

    public List<EntityModel> getEntities(String projectDir) {
        List<EntityModel> entities = new ArrayList<EntityModel>();
        Path entitiesPath = Paths.get(projectDir, "plugins", "entities");
        List<String> entityNames = FileUtil.listDirectFolders(entitiesPath.toFile());
        for (String entityName : entityNames) {
            EntityModel entity = getEntity(projectDir, entityName);
            if (entity != null) {
                entities.add(entity);
            }
        }

        return entities;
    }

    public void deleteEntity(String entity) throws IOException {
        Path dir = Paths.get(envConfig().getProjectDir(), PLUGINS_DIR, ENTITIES_DIR, entity);
        if (dir.toFile().exists()) {
            FileUtils.deleteDirectory(dir.toFile());
        }
    }

    public void saveFlowPlugin(
        String projectDir,
        String entityName,
        FlowType flowType,
        String flowName,
        PluginModel plugin
    ) throws IOException {
        Scaffolding scaffolding = new Scaffolding(projectDir);
        Path flowDir = scaffolding.getFlowDir(entityName, flowName, flowType);
        Path pluginDir = flowDir.resolve(plugin.pluginType);
        for (String pluginFile: plugin.files.keySet()) {
            String pluginContent = plugin.files.get(pluginFile);
            String[] filePathParts = pluginFile.split(Pattern.quote(File.separator));
            String fileName = filePathParts[filePathParts.length - 1];
            Files.write(pluginDir.resolve(fileName), pluginContent.getBytes(StandardCharsets.UTF_8), StandardOpenOption.TRUNCATE_EXISTING);
        }
    }


    public EntityModel getEntity(String projectDir, String entityName) {
        EntityModel entityModel = null;

        Path entityPath = Paths.get(projectDir, "plugins", "entities", entityName);
        File entityFile = entityPath.toFile();
        if (entityFile.exists() && entityFile.isDirectory()) {

            entityModel = new EntityModel(entityName);
            entityModel.inputFlows = flowManagerService.getFlows(projectDir, entityName, FlowType.INPUT);
            entityModel.harmonizeFlows = flowManagerService.getFlows(projectDir, entityName, FlowType.HARMONIZE);
        }

        if (entityModel == null) {
            throw new NotFoundException();
        }

        return entityModel;
    }

    public FlowModel getFlow(String projectDir, String entityName, FlowType flowType, String flowName) {
        EntityModel entity = getEntity(projectDir, entityName);

        List<FlowModel> flows;
        if (flowType.equals(FlowType.INPUT)) {
            flows = entity.inputFlows;
        }
        else {
            flows = entity.harmonizeFlows;
        }

        for (FlowModel flow : flows) {
            if (flow.flowName.equals(flowName)) {
                return flow;
            }
        }

        return null;
    }


    public void deleteFlow(String projectDir, String entityName, String flowName, FlowType flowType) throws IOException {
        Scaffolding scaffolding = new Scaffolding(projectDir);
        Path flowDir = scaffolding.getFlowDir(entityName, flowName, flowType);
        FileUtils.deleteDirectory(flowDir.toFile());
    }

    public JsonNode validatePlugin(
        HubConfig config,
        String entityName,
        String flowName,
        PluginModel plugin
    ) throws IOException {
        JsonNode result = null;
        for (String pluginFile: plugin.files.keySet()) {
            String type;
            if (plugin.pluginType.endsWith("sjs")) {
                type = "javascript";
            }
            else {
                type = "xquery";
            }
            result = (new DataHub(config)).validateUserModule(entityName, flowName, pluginFile.replaceAll("\\.(sjs|xqy)", ""), type, plugin.files.get(pluginFile));
        }
        return result;
    }

    public FlowModel createFlow(String projectDir, EntityModel entity, FlowType flowType, FlowModel newFlow) throws IOException {
        Scaffolding scaffolding = new Scaffolding(projectDir);
        newFlow.entityName = entity.entityName;
        scaffolding.createFlow(entity.entityName, newFlow.flowName, flowType, newFlow.pluginFormat, newFlow.dataFormat);
        return getFlow(projectDir, entity.entityName, flowType, newFlow.flowName);
    }

    public EntityModel createEntity(String projectDir, EntityModel newEntity) throws IOException {
        Scaffolding scaffolding = new Scaffolding(projectDir);

        scaffolding.createEntity(newEntity.entityName);

        for (FlowModel flow : newEntity.inputFlows) {
            scaffolding.createFlow(newEntity.entityName, flow.flowName, FlowType.INPUT, flow.pluginFormat, flow.dataFormat);
        }

        for (FlowModel flow : newEntity.harmonizeFlows) {
            scaffolding.createFlow(newEntity.entityName, flow.flowName, FlowType.HARMONIZE, flow.pluginFormat, flow.dataFormat);
        }

        return getEntity(projectDir, newEntity.entityName);
    }
}
