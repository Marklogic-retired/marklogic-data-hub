/*
 * Copyright 2012-2021 MarkLogic Corporation
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
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.io.Format;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.managers.ModelManager;
import com.marklogic.hub.central.schemas.ModelDefinitions;
import com.marklogic.hub.central.schemas.ModelDescriptor;
import com.marklogic.hub.central.schemas.PrimaryEntityType;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.deploy.util.ResourceUtil;
import com.marklogic.hub.util.QueryRolesetUtil;
import com.marklogic.mgmt.ManageClient;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.*;

@Controller
@RequestMapping("/api/models")
public class ModelController extends BaseController {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation("This should no longer be used, use /primaryEntityTypes instead")
    public ResponseEntity<?> getModels() {
        return ResponseEntity.ok(newModelManager().getModels());
    }

    @RequestMapping(value = "/job-info", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get info about the latest job info for each model", response = LatestJobInfoList.class)
    public ResponseEntity<List<JsonNode>> getLatestJobInfoForAllModels() {
        return ResponseEntity.ok(newModelManager().getLatestJobInfoForAllModels());
    }

    /**
     * We don't have an authority to secure this yet because this is used for the "Curate" tile, and there's no generic
     * "canViewCurate" authority yet.
     *
     * @return
     */
    @RequestMapping(value = "/primaryEntityTypes", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get primary entity types; does not include entity definitions that are considered 'structured' types", response = PrimaryEntityTypeList.class)
    public ResponseEntity<JsonNode> getPrimaryEntityTypes(@RequestParam(required = false, name = "includeDrafts", defaultValue = "false") Boolean includeDrafts) {
        // This must use the final client instead of staging so that the entityInstanceCount is derived from final
        return ResponseEntity.ok(ModelsService.on(getHubClient().getFinalClient()).getPrimaryEntityTypes(includeDrafts));
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Create a new model and return the persisted model descriptor", response = ModelDescriptor.class)
    @ApiImplicitParam(name = "entityModel", required = true, paramType = "body", dataTypeClass = CreateModelInput.class)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<JsonNode> createDraftModel(@RequestBody @ApiParam(name = "entityModel", hidden = true) JsonNode input) {
        JsonNode modelNode = newService().createDraftModel(input);

        JsonNode modelConfigNode = newService().generateModelConfig();
        logger.info("Deploying search options");
        deploySearchOptions(modelConfigNode);

        return new ResponseEntity<>(modelNode, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/{modelName}/info", method = RequestMethod.PUT)
    @ApiImplicitParam(name = "entityModel", required = true, paramType = "body", dataTypeClass = UpdateModelInfoInput.class)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<Void> updateDraftModelInfo(@PathVariable String modelName, @RequestBody @ApiParam(name = "entityModel", hidden = true) JsonNode input) {
        if(input.get("name") != null && !(input.get("name").asText().equals(modelName))){
            throw new RuntimeException("Unable to update entity model; incorrect model name: " + input.get("name").asText());
        }
        newService().updateDraftModelInfo(modelName, input);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{modelName}", method = RequestMethod.DELETE)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<Void> deleteDraftModel(@PathVariable String modelName) {
        newService().deleteDraftModel(modelName);

        /*
        * We're not doing anything with indexes or protected paths here because we don't have a reliable way to
        * identify the ones to delete and we only expect entity types to be deleted
        * in a development environment where it's usually fine if some old indexes / protected paths hang around.
        */
        logger.info("Deploying search options");
        deploySearchOptions(newService().generateModelConfig());

        return emptyOk();
    }

    @RequestMapping(value = "/{modelName}/references", method = RequestMethod.GET)
    @ApiOperation(value = "Get step and model names that refer to this model.", response = ModelReferencesInfo.class)
    public ResponseEntity<JsonNode> getModelReferences(@PathVariable String modelName, @RequestParam(value = "propertyName", required = false) String propertyName) {
        return ResponseEntity.ok(newService().getModelReferences(modelName, propertyName));
    }

    @RequestMapping(value = "/entityTypes", method = RequestMethod.PUT)
    @ApiImplicitParam(name = "entityTypes", required = true, paramType = "body", allowMultiple = true, dataTypeClass = UpdateModelInput.class)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<Void> updateDraftModelEntityTypes(@ApiParam(name = "entityTypes", hidden = true) @RequestBody JsonNode entityTypes) {
        // update the draft models
        newService().updateDraftModelEntityTypes(entityTypes);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/publishDraftModels", method = RequestMethod.PUT)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<Void> publishDraftModels() {
        // publish models to ES collection
        newService().publishDraftModels();
        // deploy the configs for the newly published models
        deployModelConfigs();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    void deployModelConfigs() {
        ManageClient manageClient = hubClientProvider.getHubClient().getManageClient();

        long start = System.currentTimeMillis();
        logger.info("Generating model-based resource configurations");

        JsonNode modelConfigNode = newService().generateModelConfig();

        logger.info("Deploying search options");
        deploySearchOptions(modelConfigNode);

        logger.info("Deploying protected paths");
        deployProtectedPaths(modelConfigNode, manageClient);

        logger.info("Deploying query rolesets");
        deployQueryRolesets(modelConfigNode, manageClient);

        logger.info("Deploying database indexes");
        deployIndexConfig(modelConfigNode, manageClient);

        logger.info("Finished generating and deploying model-based resource configurations, time: " + (System.currentTimeMillis() - start));
    }

    private void deployIndexConfig(JsonNode modelConfigNode, ManageClient manageClient) {
        try {
            for (String databaseName : Arrays.asList(getHubClient().getDbName(DatabaseKind.STAGING), getHubClient().getDbName(DatabaseKind.FINAL))) {
                final ObjectNode modelBasedProperties = modelConfigNode.get("indexConfig").deepCopy();
                final ObjectNode existingProperties = (ObjectNode)new ObjectMapper().readTree(manageClient.getJson("/manage/v2/databases/" + databaseName + "/properties"));
                JsonNode mergedProperties = ResourceUtil.mergeExistingArrayProperties(modelBasedProperties, existingProperties);
                manageClient.putJson("/manage/v2/databases/" + databaseName + "/properties", mergedProperties.toString());
            }
        } catch (Exception e) {
            throw new RuntimeException("Unable to deploy database indexes after updating entity models; cause: " + e.getMessage(), e);
        }
    }

    private void deployQueryRolesets(JsonNode modelConfigNode, ManageClient manageClient) {
        try {
            modelConfigNode.get("queryRolesets").forEach(jsonNode -> {
                try {
                    manageClient.postJson("/manage/v2/query-rolesets", jsonNode.toString());
                }
                catch (HttpClientErrorException ex) {
                    QueryRolesetUtil.handleSaveException(ex);
                }
            });
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to deploy query-rolesets after updating entity models; cause: " + e.getMessage(), e);
        }
    }

    private void deployProtectedPaths(JsonNode modelConfigNode, ManageClient manageClient) {
        try {
            modelConfigNode.get("protectedPaths").forEach(jsonNode -> manageClient.postJson("/manage/v2/protected-paths", jsonNode.toString()));
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to deploy protected-paths after updating entity models; cause: " + e.getMessage(), e);
        }
    }

    private void deploySearchOptions(JsonNode modelConfigNode) {
        DatabaseClient finalDatabaseClient = hubClientProvider.getHubClient().getFinalClient();
        DatabaseClient stagingDatabaseClient = hubClientProvider.getHubClient().getStagingClient();

        String explorerOptions = Optional.of(modelConfigNode)
                .map(node -> node.get("searchOptions"))
                .map(node -> node.get("explorer"))
                .map(JsonNode::asText)
                .orElse(null);
        String defaultOptions = Optional.of(modelConfigNode)
                .map(node -> node.get("searchOptions"))
                .map(node -> node.get("default"))
                .map(JsonNode::asText)
                .orElse(null);

        if (explorerOptions == null && defaultOptions == null) {
            return;
        }

        Map<String, DatabaseClient> clientMap = new HashMap<>();
        clientMap.put("staging", stagingDatabaseClient);
        clientMap.put("final", finalDatabaseClient);
        clientMap.forEach((databaseKind, databaseClient) -> {
            QueryOptionsManager queryOptionsManager = databaseClient.newServerConfigManager().newQueryOptionsManager();
            if (explorerOptions != null) {
                writeOptions(databaseKind, queryOptionsManager, "exp-" + databaseKind + "-entity-options", explorerOptions);
            }
            if (defaultOptions != null) {
                writeOptions(databaseKind, queryOptionsManager, databaseKind + "-entity-options", defaultOptions);
            }
        });
    }

    private void writeOptions(String databaseKind, QueryOptionsManager queryOptionsManager, String optionName, String options) {
        try {
            queryOptionsManager.writeOptionsAs(optionName, Format.XML, options);
        } catch (Exception e) {
            throw new RuntimeException("Unable to deploy search options file " + optionName + " to " + databaseKind + " database after updating entity models; cause: " + e.getMessage(), e);
        }
    }

    private ModelManager newModelManager() {
        return new ModelManager(getHubClient());
    }

    private ModelsService newService() {
        return ModelsService.on(getHubClient().getStagingClient());
    }

    public static class PrimaryEntityTypeList extends ArrayList<PrimaryEntityType> {
    }

    public static class LatestJobInfoList extends ArrayList<LatestJobInfo> {
    }

    public static class LatestJobInfo {
        public String entityCollection;
        public String latestJobId;
        public Date latestJobDateTime;
    }

    public static class CreateModelInput {
        public String name;
        public String description;
        public String namespace;
        public String namespacePrefix;
        public HubCentralConfig hubCentral;
    }

    public static class HubCentralConfig {
        public static Modeling modeling;
    }

    public static class Modeling{
        public double graphX;
        public double graphY;
        public String icon;
        public String color;
    }

    public static class UpdateModelInfoInput {
        public String name;
        public String description;
        public String namespace;
        public String namespacePrefix;
        public HubCentralConfig hubCentral;
    }

    public static class ModelReferencesInfo {
        public List<String> stepNames;
        public List<String> entityNames;
    }

    public static class UpdateModelInput {
        public String entityName;
        public ModelDefinitions modelDefinition;
    }
}
