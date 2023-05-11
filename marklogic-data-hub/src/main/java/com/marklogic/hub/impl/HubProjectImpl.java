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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileCopyUtils;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.marklogic.hub.HubConfig.USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES;

public class HubProjectImpl extends LoggingObject implements HubProject {

    public static final String ENTITY_CONFIG_DIR = PATH_PREFIX + "entity-config";
    public static final String MODULES_DIR = PATH_PREFIX + "ml-modules";
    public static final String USER_SCHEMAS_DIR = PATH_PREFIX + "ml-schemas";

    private String projectDirString;
    private Path projectDir;
    private Path pluginsDir;
    private Path stepDefinitionsDir;
    private String userModulesDeployTimestampFile = USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES;

    private String[] artifactTypes = new String[]{"entities", "step-definitions", "steps"};

    public HubProjectImpl(){
    }

    public String getProjectDirString() {
        return projectDirString;
    }

    public void createProject(String projectDirString) {
        this.projectDirString = projectDirString;
        this.projectDir = Paths.get(projectDirString).toAbsolutePath();
        this.pluginsDir = this.projectDir.resolve("plugins");
        this.stepDefinitionsDir = this.projectDir.resolve("step-definitions");
    }

    @Override public Path getHubPluginsDir() {
        return this.pluginsDir;
    }

    @Override
    public Path getStepDefinitionsDir() {
        return this.stepDefinitionsDir;
    }

    @Override
    public Path getStepDefinitionPath(StepDefinition.StepDefinitionType type) {
        Path path;

        if (type == null) {
            throw new DataHubProjectException("Invalid Step type");
        }
        else {
            switch (type) {
                case CUSTOM:
                    path = this.stepDefinitionsDir.resolve("custom");
                    break;
                case INGESTION:
                    path = this.stepDefinitionsDir.resolve("ingestion");
                    break;
                case MAPPING:
                    path = this.stepDefinitionsDir.resolve("mapping");
                    break;
                case MASTERING:
                    path = this.stepDefinitionsDir.resolve("mastering");
                    break;
                case MATCHING:
                    path = this.stepDefinitionsDir.resolve("matching");
                    break;
                case MERGING:
                    path = this.stepDefinitionsDir.resolve("merging");
                    break;
                default:
                    throw new DataHubProjectException("Invalid Step type" + type.toString());
            }
        }

        return path;
    }

    @Override public Path getHubEntitiesDir() { return this.projectDir.resolve("entities"); }

    @Override public Path getHubMappingsDir() {
        return this.projectDir.resolve("mappings");
    }

    @Override public Path getLegacyHubEntitiesDir() {
        return this.pluginsDir.resolve("entities");
    }

    @Override public Path getLegacyHubMappingsDir() {
        return this.pluginsDir.resolve("mappings");
    }

    @Override public Path getHubConfigDir() {
        return this.projectDir.resolve(HUB_CONFIG_DIR);
    }

    @Override public Path getHubDatabaseDir() {
        return getHubConfigDir().resolve("databases");
    }

    @Override public Path getHubServersDir() {
        return getHubConfigDir().resolve("servers");
    }

    @Override public Path getHubSecurityDir() {
        return getHubConfigDir().resolve("security");
    }

    @Override public Path getHubTriggersDir() {
    	return getHubConfigDir().resolve("triggers");
    }

    @Override public Path getUserConfigDir() {
        return this.projectDir.resolve(USER_CONFIG_DIR);
    }

    @Override public Path getUserSecurityDir() { return getUserConfigDir().resolve("security"); }

    @Override public Path getUserDatabaseDir() {
        return getUserConfigDir().resolve("databases");
    }

    @Override public Path getUserSchemasDir() {
        return this.projectDir.resolve(USER_SCHEMAS_DIR);
    }

    @Override public Path getUserServersDir() {
        return getUserConfigDir().resolve("servers");
    }

    @Override public Path getEntityConfigDir() {
        return this.projectDir.resolve(ENTITY_CONFIG_DIR);
    }

    @Override public Path getEntityDatabaseDir() {
        return getEntityConfigDir().resolve("databases");
    }

    @Override public Path getFlowsDir() {
        return this.projectDir.resolve("flows");
    }

    @Deprecated
    @Override public Path getHubStagingModulesDir() {
        return this.projectDir.resolve(MODULES_DIR);
    }

    @Deprecated
    @Override public Path getUserStagingModulesDir() {
        return this.projectDir.resolve(MODULES_DIR);
    }

    @Override public Path getModulesDir() {
        return this.projectDir.resolve(MODULES_DIR);
    }

    @Deprecated
    @Override public Path getUserFinalModulesDir() {
        return this.projectDir.resolve(MODULES_DIR);
    }

    @Override
    public Path getCustomModulesDir() {
        return getModulesDir().resolve("root").resolve("custom-modules");
    }

    @Override
    public Path getCustomMappingFunctionsDir() {
        return getCustomModulesDir().resolve("mapping-functions");
    }

    @Override public boolean isInitialized() {
        File buildGradle = this.projectDir.resolve("build.gradle").toFile();
        File gradleProperties = this.projectDir.resolve("gradle.properties").toFile();

        File hubConfigDir = getHubConfigDir().toFile();
        File userConfigDir = getUserConfigDir().toFile();
        File databasesDir = getHubDatabaseDir().toFile();
        File serversDir = getHubServersDir().toFile();
        File securityDir = getHubSecurityDir().toFile();

        boolean newConfigInitialized =
            hubConfigDir.exists() &&
                hubConfigDir.isDirectory() &&
                userConfigDir.exists() &&
                userConfigDir.isDirectory() &&
                databasesDir.exists() &&
                databasesDir.isDirectory() &&
                serversDir.exists() &&
                serversDir.isDirectory() &&
                securityDir.exists() &&
                securityDir.isDirectory();

        return buildGradle.exists() &&
            gradleProperties.exists() &&
            newConfigInitialized;
    }

    @Override public void init(Map<String, String> customTokens) {
        if (customTokens == null) {
            customTokens = new HashMap<>();
        }

        // Scaffold out artifact directories
        for (String artifactType: artifactTypes) {
            File artifactTypeDir =  getProjectDir().resolve(artifactType).toFile();
            if (!artifactTypeDir.exists()) {
                artifactTypeDir.mkdirs();
            }
        }

        Path userModules = this.projectDir.resolve(MODULES_DIR);
        userModules.toFile().mkdirs();

        Path customModulesDir = getCustomModulesDir();
        customModulesDir.toFile().mkdirs();
        getCustomMappingFunctionsDir().toFile().mkdirs();

        //scaffold custom mapping|ingestion|mastering dirs.
        for (StepDefinition.StepDefinitionType stepType : StepDefinition.StepDefinitionType.values()) {
            customModulesDir.resolve(stepType.toString().toLowerCase()).toFile().mkdirs();
        }

        Path hubServersDir = getHubServersDir();
        hubServersDir.toFile().mkdirs();
        writeResourceFile("hub-internal-config/servers/staging-server.json", hubServersDir.resolve("staging-server.json"), true);
        writeResourceFile("hub-internal-config/servers/job-server.json", hubServersDir.resolve("job-server.json"), true);

        Path hubDatabaseDir = getHubDatabaseDir();
        hubDatabaseDir.toFile().mkdirs();
        writeResourceFile("hub-internal-config/databases/staging-database.json", hubDatabaseDir.resolve("staging-database.json"), true);
        writeResourceFile("hub-internal-config/databases/job-database.json", hubDatabaseDir.resolve("job-database.json"), true);
        writeResourceFile("hub-internal-config/databases/staging-schemas-database.json", hubDatabaseDir.resolve("staging-schemas-database.json"), true);
        writeResourceFile("hub-internal-config/databases/staging-triggers-database.json", hubDatabaseDir.resolve("staging-triggers-database.json"), true);

        Path hubDatabaseFieldsDir = getHubConfigDir().resolve("database-fields");
        hubDatabaseFieldsDir.toFile().mkdirs();
        writeResourceFile("hub-internal-config/database-fields/staging-database.xml",
            hubDatabaseFieldsDir.resolve("staging-database.xml"), true);
        writeResourceFile("hub-internal-config/database-fields/job-database.xml",
            hubDatabaseFieldsDir.resolve("job-database.xml"), true);


        // Per DHFPROD-3159, we no longer overwrite user config (ml-config) files. These are rarely updated by DHF,
        // while users may update them at any time. If DHF ever needs to update one of these files in the future, it
        // should do so via a method in this class that makes the update directly to the file without losing any
        // changes made by the user.
        final boolean overwriteUserConfigFiles = false;

        Path userServersDir = getUserServersDir();
        userServersDir.toFile().mkdirs();
        writeResourceFile("ml-config/servers/final-server.json", userServersDir.resolve("final-server.json"), overwriteUserConfigFiles);

        Path userDatabaseDir = getUserDatabaseDir();
        userDatabaseDir.toFile().mkdirs();
        writeResourceFile("ml-config/databases/final-database.json", userDatabaseDir.resolve("final-database.json"), overwriteUserConfigFiles);
        writeResourceFile("ml-config/databases/modules-database.json", userDatabaseDir.resolve("modules-database.json"), overwriteUserConfigFiles);
        writeResourceFile("ml-config/databases/final-schemas-database.json", userDatabaseDir.resolve("final-schemas-database.json"), overwriteUserConfigFiles);
        writeResourceFile("ml-config/databases/final-triggers-database.json", userDatabaseDir.resolve("final-triggers-database.json"), overwriteUserConfigFiles);

        Path userDatabaseFieldsDir = getUserConfigDir().resolve("database-fields");
        userDatabaseFieldsDir.toFile().mkdirs();
        writeResourceFile("ml-config/database-fields/final-database.xml", userDatabaseFieldsDir.resolve("final-database.xml"), overwriteUserConfigFiles);

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            writeResources(resolver, "classpath:hub-internal-config/security/amps/*.json", getHubSecurityDir().resolve("amps"));
            writeResources(resolver, "classpath:hub-internal-config/security/privileges/*.json", getHubSecurityDir().resolve("privileges"));
            writeResources(resolver, "classpath:hub-internal-config/security/roles/*.json", getHubSecurityDir().resolve("roles"));
            writeResources(resolver, "classpath:hub-internal-config/triggers/*.json", getHubTriggersDir());
        } catch (IOException e) {
            throw new RuntimeException("Unable to write project resources to project filesystem; cause: " + e.getMessage(), e);
        }

        Path userSecurityDir = getUserSecurityDir();
        userSecurityDir.resolve("roles").toFile().mkdirs();
        userSecurityDir.resolve("users").toFile().mkdirs();
        userSecurityDir.resolve("privileges").toFile().mkdirs();

        getUserServersDir().toFile().mkdirs();
        getUserDatabaseDir().toFile().mkdirs();

        //scaffold schemas
        final String stagingSchemasKey = "%%mlStagingSchemasDbName%%";
        if (customTokens.containsKey(stagingSchemasKey)) {
            getUserDatabaseDir().resolve(customTokens.get(stagingSchemasKey)).resolve("schemas").toFile().mkdirs();
        }
        getUserSchemasDir().toFile().mkdirs();

        //create flow dir
        getFlowsDir().toFile().mkdirs();

        Path gradlew = projectDir.resolve("gradlew");
        writeResourceFile("scaffolding/gradlew", gradlew);
        makeExecutable(gradlew);

        Path gradlewbat = projectDir.resolve("gradlew.bat");
        writeResourceFile("scaffolding/gradlew.bat", gradlewbat);
        makeExecutable(gradlewbat);

        Path gradleWrapperDir = projectDir.resolve("gradle").resolve("wrapper");
        gradleWrapperDir.toFile().mkdirs();

        writeResourceFile("scaffolding/gradle/wrapper/gradle-wrapper.jar", gradleWrapperDir.resolve("gradle-wrapper.jar"), true);
        writeResourceFile("scaffolding/gradle/wrapper/gradle-wrapper.properties", gradleWrapperDir.resolve("gradle-wrapper.properties"), true);

        writeResourceFile("scaffolding/build_gradle", projectDir.resolve("build.gradle"));
        writeResourceFileWithReplace(customTokens, "scaffolding/gradle_properties", projectDir.resolve("gradle.properties"));
        writeResourceFile("scaffolding/gradle-local_properties", projectDir.resolve("gradle-local.properties"));
    }

    private void writeResources(PathMatchingResourcePatternResolver resolver, String pattern, Path projectTargetPath) throws IOException {
        File projectTargetDir = projectTargetPath.toFile();
        if (!(projectTargetDir.mkdirs() || projectTargetDir.exists())) {
            throw new RuntimeException("Unable to create directory at '"+ projectTargetDir.getAbsolutePath() +"'.");
        }
        for (Resource resource : resolver.getResources(pattern)) {
            FileCopyUtils.copy(resource.getInputStream(), new FileOutputStream(projectTargetPath.resolve(resource.getFilename()).toFile()));
        }
    }

    private void makeExecutable(Path file) {
        Set<PosixFilePermission> perms = new HashSet<>();
        perms.add(PosixFilePermission.OWNER_READ);
        perms.add(PosixFilePermission.OWNER_WRITE);
        perms.add(PosixFilePermission.OWNER_EXECUTE);

        try {
            Files.setPosixFilePermissions(file, perms);
        } catch (Exception e) {

        }
    }

    private void writeResourceFile(String srcFile, Path dstFile) {
        writeResourceFile(srcFile, dstFile, false);
    }

    private void writeResourceFile(String srcFile, Path dstFile, boolean overwrite) {
        if (overwrite || !dstFile.toFile().exists()) {
            if (logger.isDebugEnabled()) {
                logger.debug("Getting file: " + srcFile);
            }
            InputStream inputStream = null;
            try {
                inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);
                FileUtil.copy(inputStream, dstFile.toFile());
            } finally {
                IOUtils.closeQuietly(inputStream);
            }
        }
    }

    private void writeResourceFileWithReplace(Map<String, String> customTokens, String srcFile, Path dstFile) {
        writeResourceFileWithReplace(customTokens, srcFile, dstFile, false);
    }

    private void writeResourceFileWithReplace(Map<String, String> customTokens, String srcFile, Path dstFile, boolean overwrite) {
        InputStream inputStream = null;
        try {
            if (overwrite || !dstFile.toFile().exists()) {
                logger.debug("Getting file with replace: " + srcFile);
                inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);

                String fileContents = IOUtils.toString(inputStream, Charset.defaultCharset());
                for (Map.Entry<String, String> entry : customTokens.entrySet()) {
                    String value = entry.getValue();
                    if (value != null) {
                        fileContents = fileContents.replace(entry.getKey(), value);
                    }
                }
                try (OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(dstFile.toFile()), StandardCharsets.UTF_8)) {
                    writer.write(fileContents);
                }
            }
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        } finally {
            IOUtils.closeQuietly(inputStream);
        }
    }

    @Override
    public void upgradeProject(FlowManagerImpl flowManager) throws IOException {
        Path oldEntitiesDir = this.getLegacyHubEntitiesDir();
        Path oldMappingsDir = this.getLegacyHubMappingsDir();
        Path newEntitiesDirPath = this.getHubEntitiesDir();
        Path newMappingsDirPath = this.getHubMappingsDir();
        File newEntitiesDirFile = newEntitiesDirPath.toFile();
        File newMappingsDirFile = newMappingsDirPath.toFile();
        if (!newEntitiesDirFile.exists()) {
            newEntitiesDirFile.mkdir();
        }
        if (!newMappingsDirFile.exists()) {
            newMappingsDirFile.mkdir();
        }
        File[] oldEntityDirectories = oldEntitiesDir.toFile().listFiles();
        if (oldEntityDirectories != null) {
            for (File legacyEntityDir : oldEntityDirectories) {
                if (legacyEntityDir.isDirectory()) {
                    File[] entityFiles = legacyEntityDir.listFiles((File file, String name) -> name.endsWith(".entity.json"));
                    if (entityFiles != null) {
                        for (File entityFile : entityFiles) {
                            logger.info("Moving plugins/entities/" + legacyEntityDir.getName()+"/"+entityFile.getName() + " to entities/" + entityFile.getName());
                            Files.move(entityFile.toPath(), newEntitiesDirPath.resolve(entityFile.getName()));
                        }
                    }
                }
            }
            upgradeLegacyFlows(flowManager);
        }
        File[] oldMappingsDirectories = oldMappingsDir.toFile().listFiles();
        if (oldMappingsDirectories != null) {
            for (File legacyMappingsDir : oldMappingsDirectories) {
                if (legacyMappingsDir.isDirectory()) {
                    if(!newMappingsDirPath.resolve(legacyMappingsDir.getName()).toFile().exists()){
                        newMappingsDirPath.resolve(legacyMappingsDir.getName()).toFile().mkdir();
                    }
                    File[] mappingsFiles = legacyMappingsDir.listFiles((File file, String name) -> name.endsWith(".mapping.json"));
                    if (mappingsFiles != null) {
                        for (File mappingsFile : mappingsFiles) {
                            logger.info("Moving plugins/mappings/" + legacyMappingsDir.getName()+"/"+mappingsFile.getName() + " to mappings/" + legacyMappingsDir.getName()+"/"+mappingsFile.getName());
                            Files.move(mappingsFile.toPath(), newMappingsDirPath.resolve(legacyMappingsDir.getName()).resolve(mappingsFile.getName()));
                        }
                    }
                }
            }
        }

        convertHubCommunityProject();

        removeEmptyRangeElementIndexArrayFromFinalDatabaseFile();
        upgradeFinalDatabaseXmlFile();
        updateStepDefinitionTypeForInlineMappingSteps(flowManager);
    }

    public void upgradeLegacyFlows(FlowManagerImpl flowManager) {
        Path oldEntitiesDir = this.getLegacyHubEntitiesDir();
        File[] oldEntityDirectories = oldEntitiesDir.toFile().listFiles();
        if(ArrayUtils.isEmpty(oldEntityDirectories)) {
            return;
        }
        ScaffoldingImpl scaffolding = new ScaffoldingImpl(flowManager.getHubConfig());
        ObjectMapper objectMapper = new ObjectMapper();
        if(oldEntityDirectories != null) {
            for(File legacyEntityDir: oldEntityDirectories) {
                File[] flowTypes = legacyEntityDir.listFiles(File::isDirectory);
                Arrays.sort(flowTypes, Collections.reverseOrder());
                if(flowTypes != null) {
                    String flowName = "dh_Upgrade_".concat(legacyEntityDir.getName()).concat("Flow");
                    ObjectNode flow = objectMapper.createObjectNode();
                    flow.put("name", flowName);
                    ObjectNode steps = objectMapper.createObjectNode();
                    flow.put("steps", steps);
                    int stepNumber = 1;
                    for(File oldFlowType: flowTypes) {
                        File[] stepFiles = oldFlowType.listFiles(File::isDirectory);
                        for(int i=0; i<stepFiles.length; i++) {
                            File stepFile = stepFiles[i];
                            String stepName = stepFile.getName();
                            // Step names are not allowed to have special characters
                            String newStepName = stepName.replaceAll("[^\\w\\-]", "");
                            newStepName = Character.isLetter(newStepName.charAt(0)) ? newStepName : "dh_".concat(newStepName);
                            String slash = "/";
                            String mainModulePath = slash
                                .concat("entities").concat(slash)
                                .concat(legacyEntityDir.getName()).concat(slash)
                                .concat(oldFlowType.getName()).concat(slash)
                                .concat(stepName);
                            String stepType = "";
                            boolean acceptSourceModule = false;
                            if(oldFlowType.getName().equals("input")) {
                                stepType = "ingestion";
                            } else if(oldFlowType.getName().equals("harmonize")) {
                                stepType = "custom";
                                acceptSourceModule = true;
                            }
                            JsonNode stepPayLoad = scaffolding.getStepConfig(newStepName, stepType, newStepName, null, acceptSourceModule);
                            // Save StepDefinition to local file
                            scaffolding.saveStepDefinition(newStepName, newStepName, stepType, true);
                            updateStepOptionsFor4xFlow(stepName, stepFile, stepPayLoad, mainModulePath, legacyEntityDir.getName());
                            // Save Step to local file
                            scaffolding.saveLocalStep(stepType, stepPayLoad);
                            // Add step to local Flow
                            ObjectNode stepIdObj = objectMapper.createObjectNode();
                            steps.put(Integer.toString(stepNumber++), stepIdObj);
                            stepIdObj.put("stepId", newStepName.concat("-").concat(stepType));
                        }
                    }
                    flowManager.saveLocalFlow(flow);
                }
            }
        }
    }

    private void updateStepOptionsFor4xFlow(String stepName, File stepFile, JsonNode stepPayLoad, String mainModulePath, String entityType) {
        ObjectNode step = (ObjectNode) stepPayLoad;
        ObjectMapper mapper = new ObjectMapper();
        Properties properties = new Properties();
        try {
            File propsFile = stepFile.listFiles((File file, String name) -> name.equals(stepName.concat(".properties")))[0];
            properties.load(new FileInputStream(propsFile));
        } catch (IOException e) {
            logger.warn("%s.properties file is missing in the %s directory. The dataFormat and mainModule is defaulted to json and main.sjs" +
                "If the default values are inappropriate, change the values in steps/%s file", stepName, stepName, stepPayLoad.get("name").asText());
            properties.put("mainModule", "main.sjs");
            properties.put("dataFormat", "json");
        }
        ObjectNode optionsNode = mapper.createObjectNode();
        optionsNode.put("flow", stepName);
        optionsNode.put("entity", "");
        optionsNode.put("dataFormat", properties.get("dataFormat").toString());
        optionsNode.put("mainModuleUri", mainModulePath.concat("/").concat(properties.get("mainModule").toString()));

        if(step.get("stepDefinitionType").asText().equals("custom")) {
            step.put("sourceDatabase", "data-hub-STAGING");
            step.put("targetDatabase", "data-hub-FINAL");
            step.put("sourceQueryIsModule", true);
            mainModulePath = mainModulePath.concat("/").concat(properties.get("collectorModule").toString());
            ObjectNode sourceModuleNode = (ObjectNode) step.get("sourceModule");
            sourceModuleNode.put("modulePath", mainModulePath);
            sourceModuleNode.put("functionName", "collect");

            optionsNode.put("entity", entityType);
        } else {
            step.put("targetDatabase", "data-hub-STAGING");
        }
        step.put("options", optionsNode);

        step.putArray("collections").add(stepPayLoad.get("name").asText()).add(entityType);
        step.put("permissions", "data-hub-common,read,data-hub-common,update");
        step.put("stepId", step.get("name").asText().concat("-").concat(step.get("stepDefinitionType").asText()));
    }

    private JsonNode retrieveEntityFromCommunityNode(String modelName, JsonNode modelNodes, Map<String, JsonNode> entityModels) throws IOException {
        if (!entityModels.containsKey(modelName)) {
            Path newEntitiesDirPath = this.getHubEntitiesDir();
            JsonNode communityModelNode = modelNodes.path(modelName);
            String entityName = communityModelNode.path("entityName").asText();
            File entityFile = newEntitiesDirPath.resolve(entityName + ".entity.json").toFile();
            if (entityFile.exists()) {
                entityModels.put(modelName, ObjectMapperFactory.getObjectMapper().readTree(entityFile));
            }
        }
        return entityModels.get(modelName);
    }

    // This function migrates information from DHCCE connector models into Entity Service Models and Hub Central configuration
    private void convertHubCommunityProject() {
        Path conceptConnectorModelsDir = this.getProjectDir().resolve("conceptConnectorModels");
        File hubConfigFile = this.getHubCentralConfigPath().resolve("hubCentral.json").toFile();
        JsonNode hubConfigNode = null;
        if (hubConfigFile.exists()) {
            try {
                hubConfigNode = ObjectMapperFactory.getObjectMapper().readTree(hubConfigFile);
            } catch (Exception ex) {
                logger.warn("Unable to parse Hub Central Config " + hubConfigFile.getName() + "; exception: " + ex.toString());
                return;
            }
        } else {
            hubConfigNode = ObjectMapperFactory.getObjectMapper().createObjectNode();
        }
        JsonNode hubConfigEntitiesNode = hubConfigNode.path("modeling").path("entities");
        if (hubConfigEntitiesNode.isMissingNode()) {
            hubConfigEntitiesNode = ObjectMapperFactory.getObjectMapper().createObjectNode();
        }
        File[] communityModelFiles = conceptConnectorModelsDir.toFile().listFiles((File file, String name) -> name.endsWith(".json"));
        if (communityModelFiles != null) {
            Path newEntitiesDirPath = this.getHubEntitiesDir();
            Map<String, JsonNode> entityModels = new HashMap<>();
            for (File communityModelFile : communityModelFiles) {
                try {
                    JsonNode communityModel = ObjectMapperFactory.getObjectMapper().readTree(communityModelFile);
                    JsonNode modelNodes = communityModel.path("nodes");
                    JsonNode modelEdges = communityModel.path("edges");
                    for (Iterator<JsonNode> it = modelNodes.elements(); it.hasNext(); ) {
                        JsonNode communityModelNode = it.next();
                        JsonNode communityModelLabel = communityModelNode.path("labelField");
                        if (!communityModelLabel.isMissingNode() && "entity".equals(communityModelNode.path("type").asText())) {
                            String modelFrom = communityModelNode.path("entityName").asText();
                            if (!hubConfigEntitiesNode.hasNonNull(modelFrom)) {
                                ((ObjectNode) hubConfigEntitiesNode).set(modelFrom, ObjectMapperFactory.getObjectMapper().createObjectNode());
                            }
                            JsonNode hubCentralNode = hubConfigEntitiesNode.path(modelFrom);
                            ((ObjectNode) hubCentralNode).set("label", communityModelLabel);
                        }
                    }
                    for (Iterator<JsonNode> it = modelEdges.elements(); it.hasNext(); ) {
                        JsonNode edge = it.next();
                        String modelFromName = edge.path("from").asText();
                        if (!entityModels.containsKey(modelFromName)) {
                            JsonNode communityModelNode = modelNodes.path(modelFromName);
                            String modelFrom = communityModelNode.path("entityName").asText();
                            File entityFile = newEntitiesDirPath.resolve(modelFrom + ".entity.json").toFile();
                            if (entityFile.exists()) {
                                entityModels.put(modelFromName, ObjectMapperFactory.getObjectMapper().readTree(entityFile));
                            }
                        }
                        JsonNode modelFromNode = retrieveEntityFromCommunityNode(modelFromName, modelNodes, entityModels);
                        String edgeLabel =  edge.path("label").asText();
                        String modelToName = edge.path("to").asText();
                        JsonNode modelToNode = retrieveEntityFromCommunityNode(modelToName, modelNodes, entityModels);
                        if (!(modelFromNode == null || modelToNode == null)) {
                            JsonNode fromEntityNode = entityModels.get(modelFromName);
                            String modelFromTitle = fromEntityNode.path("info").path("title").asText();
                            String modelToTitle = modelToNode.path("info").path("title").asText();
                            String[] modelFromPropertyPath = edge.path("keyFrom").asText("").split("/");
                            String[] modelToPropertyPath = edge.path("keyTo").asText("").split("/");
                            if (modelFromPropertyPath.length > 1) {
                                modelFromTitle = modelFromPropertyPath[modelFromPropertyPath.length - 2];
                            }
                            if (modelToPropertyPath.length > 1) {
                                modelToTitle = modelFromPropertyPath[modelToPropertyPath.length - 2];
                            }
                            String modelFromProperty = modelFromPropertyPath[modelFromPropertyPath.length - 1];
                            String modelToProperty = modelToPropertyPath[modelToPropertyPath.length - 1];
                            JsonNode modelFromTypeNode = modelFromNode.path("definitions").path(modelFromTitle);
                            if ("concept".equals(modelToNode.path("type").asText())) {
                                ArrayNode relatedConcepts = modelFromTypeNode.withArray("relatedConcepts");
                                boolean conceptExists = false;
                                String context = edge.path("keyFrom").isNull() ?  modelToProperty: modelFromProperty;
                                for (Iterator<JsonNode> iter = relatedConcepts.elements(); iter.hasNext(); ) {
                                    JsonNode related = iter.next();
                                    if (context.equals(related.path("context").asText())) {
                                        conceptExists = true;
                                        break;
                                    }
                                }
                                if (!conceptExists) {
                                    ObjectNode relatedConcept = relatedConcepts.addObject();
                                    relatedConcept.put("context", context);
                                    relatedConcept.set("predicate", edge.get("label"));
                                    relatedConcept.put("conceptClass", modelToTitle);
                                }
                            } else {
                                String modelToBaseUri = modelToNode.path("info").path("baseUri").asText();
                                String modelToVersion = modelToNode.path("info").path("version").asText();
                                String modelToIRI = modelToBaseUri + modelToTitle + "-" + modelToVersion;
                                String typeToIRI = modelToIRI + "/" + modelToTitle;
                                JsonNode modelFromProperties = modelFromTypeNode.path("properties");
                                JsonNode modelFromPropertyNode = modelFromProperties.hasNonNull(edgeLabel) ? modelFromProperties.path(edgeLabel): modelFromProperties.path(modelFromProperty);
                                if (modelFromPropertyNode.hasNonNull("items")) {
                                    modelFromPropertyNode = modelFromPropertyNode.get("items");
                                }
                                if (modelFromPropertyNode.isObject() && !modelFromPropertyNode.hasNonNull("relatedEntityType")) {
                                    ((ObjectNode) modelFromPropertyNode).put("relatedEntityType", typeToIRI);
                                    ((ObjectNode) modelFromPropertyNode).put("joinPropertyName", modelToProperty);
                                    if (modelFromPropertyNode.hasNonNull("$ref")) {
                                        ((ObjectNode) modelFromPropertyNode).remove("$ref");
                                    }
                                    if (!modelFromPropertyNode.hasNonNull("datatype")) {
                                        JsonNode modelToPropertyNode = modelToNode.path("definitions").path(modelToTitle).path("properties").path(modelToProperty);
                                        if (modelToPropertyNode.hasNonNull("items")) {
                                            modelToPropertyNode = modelToPropertyNode.path("items");
                                        }
                                        ((ObjectNode) modelFromPropertyNode).put("datatype", modelToPropertyNode.path("datatype").asText(""));
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception ex) {
                    logger.warn("Unable to parse Hub Community Model " + communityModelFile.getName() + "; exception: " + ex.toString());
                }
                for (JsonNode entityNode: entityModels.values()) {
                    String title = entityNode.path("info").path("title").asText();
                    File entityFile = newEntitiesDirPath.resolve(title + ".entity.json").toFile();
                    try {
                        ObjectMapperFactory.getObjectMapper().writeValue(entityFile, entityNode);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
                if (hubConfigNode.path("modeling").isMissingNode()) {
                    ((ObjectNode) hubConfigNode).set("modeling", ObjectMapperFactory.getObjectMapper().createObjectNode());
                }
                ((ObjectNode) hubConfigNode.path("modeling")).set("entities", hubConfigEntitiesNode);
                try {
                    if (!hubConfigFile.exists()) {
                        File parentFile = hubConfigFile.getParentFile();
                        if (!(parentFile.mkdirs() || parentFile.exists())) {
                            throw new RuntimeException("Unable to create parent directory at '"+ parentFile.getAbsolutePath() +"' for Hub config file.");
                        }
                        hubConfigFile.createNewFile();
                    }
                    ObjectMapperFactory.getObjectMapper().writeValue(hubConfigFile, hubConfigNode);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }

    /**
     * Because this file is under src/main/ml-config, we cannot overwrite it, as a user may have modifications to it,
     * and we don't want to lose those (while we could copy the existing file to a separate directory, forcing the user
     * to then have to restore all their additions is a lousy user experience).
     *
     * Because dataHub.upgradeHub initializes the project first, we don't have a way of skipping this if the file
     * didn't already exist.
     */
    public void upgradeFinalDatabaseXmlFile() {
        Path userDatabaseFieldsDir =  getUserConfigDir().resolve("database-fields");
        Path fileDatabasePath = userDatabaseFieldsDir.resolve("final-database.xml");
        if (fileDatabasePath.toFile().exists()) {
            File finalDbFile = userDatabaseFieldsDir.resolve("final-database.xml").toFile();
            try {
                String fileContents = new String(FileCopyUtils.copyToByteArray(finalDbFile), StandardCharsets.UTF_8);
                String upgradedFileContents = new FinalDatabaseXmlFileUpgrader().updateFinalDatabaseXmlFile(fileContents);
                FileCopyUtils.copy(upgradedFileContents.getBytes(StandardCharsets.UTF_8), finalDbFile);
            } catch (Exception e) {
                throw new DataHubProjectException("Error while upgrading project; was not able to add /matchSummary/actionDetails/*/uris " +
                        "path range index to final-database.xml file; cause: " + e.getMessage(), e);
            }
        } else {
            writeResourceFile("ml-config/database-fields/final-database.xml", fileDatabasePath, false);
        }
    }

    @Override
    public void exportProject(File location) {
        File parentFile = location.getParentFile();
        if (parentFile == null ||!(location.getParentFile().exists() || location.getParentFile().mkdirs())) {
            throw new RuntimeException("Unable to create parent directory at '"+ parentFile != null ? parentFile.getAbsolutePath(): location.getAbsolutePath() +"' for project export.");
        }
        try(FileOutputStream out = new FileOutputStream(location)) {
            exportProject(out, new ArrayList<>());
        } catch (Exception e) {
            throw new RuntimeException("Unable to export project, cause: " + e.getMessage(), e);
        }
    }

    @Override
    public void exportProject(OutputStream outputStream) {
        exportProject(outputStream, new ArrayList<>());
    }

    public void exportProject(OutputStream outputStream, List<String> additionalFilesTobeAdded){
        Stream<String> filesToBeAddedToZip = Stream.of("entities", "flows", "src/main", "step-definitions", "steps", "gradle",
            "gradlew", "gradlew.bat", "build.gradle", "gradle.properties", "concepts", "config");
        if(additionalFilesTobeAdded.isEmpty()){
            writeToStream(outputStream, filesToBeAddedToZip);
        }
        else{
            writeToStream(outputStream, Stream.concat(filesToBeAddedToZip, additionalFilesTobeAdded.stream()));
        }
    }
    private void writeToStream(OutputStream out, Stream<String> filesToBeAddedToZip) {
        try (ZipOutputStream zout = new ZipOutputStream(out)){
            filesToBeAddedToZip.forEach(file ->{
                File fileToZip = getProjectDir().resolve(file).toFile();
                if (!fileToZip.exists()) {
                    logger.warn(String.format("%s does not exist during project export.", fileToZip.toString()));
                    return;
                }
                try {
                    if (fileToZip.isDirectory()) {
                        zout.putNextEntry(new ZipEntry(file + "/"));
                        zipSubDirectory(file + "/", fileToZip, zout);
                    } else {
                        zipSubDirectory("", fileToZip, zout);
                    }
                }
                catch (Exception ex){
                    throw new RuntimeException("Unable to export project, cause: " + ex.getMessage(), ex);
                }
            });
        }
        catch (Exception e){
            throw new RuntimeException("Unable to export project, cause: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProjectName() {
        return getProjectDir().toFile().getName();
    }

    private void zipSubDirectory(String basePath, File fileToZip, ZipOutputStream zout) throws IOException {
        File[] files = fileToZip.listFiles();
        if(files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    String path = basePath + file.getName() + "/";
                    zout.putNextEntry(new ZipEntry(path));
                    zipSubDirectory(path, file, zout);
                } else {
                    addFileToZip(basePath, file, zout);
                }
            }
        }
        else {
            addFileToZip(basePath, fileToZip, zout);
        }
    }

    private void addFileToZip(String basePath, File fileToZip, ZipOutputStream zout) throws  IOException {
        try (FileInputStream fin = new FileInputStream(fileToZip)) {
            zout.putNextEntry(new ZipEntry(basePath + fileToZip.getName()));
            IOUtils.copy(fin, zout);
            IOUtils.closeQuietly(fin);
        }
    }

    protected void updateStepDefinitionTypeForInlineMappingSteps(FlowManager flowManager) {
        try {
            flowManager.getLocalFlows().forEach(flow -> {
                AtomicBoolean shouldSaveFlow = new AtomicBoolean(false);
                flow.getSteps().values().forEach(step -> {
                    if (
                        StepDefinition.StepDefinitionType.MAPPING.equals(step.getStepDefinitionType()) &&
                            "default-mapping".equalsIgnoreCase(step.getStepDefinitionName()))
                    {
                        step.setStepDefinitionName("entity-services-mapping");
                        shouldSaveFlow.set(true);
                    }
                });
                //save flow only if one or more steps are modified
                if(shouldSaveFlow.get()){
                    flowManager.saveLocalFlow(flow);
                }
            });
        } catch (Exception ex) {
            logger.warn("Error occurred while attempting to upgrade mapping steps to use 'entity-services-mapping' " +
                "stepDefinitionType instead of 'default-mapping'; error: " + ex.getMessage());
            logger.warn("If you have any steps in flows with a stepDefinitionType of 'default-mapping', please change these to be " +
                "'entity-services-mapping' instead, as this is the preferred type for mapping steps as of DHF 5.1.0.");
        }
    }

    /**
     * This method uses warn-level log messages to ensure they appear when upgrading a project via Gradle.
     */
    protected void removeEmptyRangeElementIndexArrayFromFinalDatabaseFile() {
        File dbFile = getUserConfigDir().resolve("databases").resolve("final-database.json").toFile();
        if (dbFile != null && dbFile.exists()) {
            try {
                ObjectNode db = (ObjectNode)ObjectMapperFactory.getObjectMapper().readTree(dbFile);
                if (hasEmptyRangeElementIndexArray(db)) {
                    logger.warn("Removing empty range-element-index array from final-database.json to avoid " +
                        "unnecessary reindexing");
                    db.remove("range-element-index");
                    ObjectMapperFactory.getObjectMapper().writeValue(dbFile, db);
                }
            } catch (Exception ex) {
                logger.warn("Unable to determine if final-database.json file has a range-element-index field with an " +
                    "empty array as its value; if it does, please remove this to avoid unnecessary reindexing; exception: " + ex.getMessage());
            }
        }
    }

    protected boolean hasEmptyRangeElementIndexArray(ObjectNode db) {
        if (db.has("range-element-index")) {
            JsonNode node = db.get("range-element-index");
            if (node instanceof ArrayNode) {
                ArrayNode indexes = (ArrayNode)node;
                if (indexes.size() == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public String getUserModulesDeployTimestampFile() {
        Path timestampPath = Paths.get(projectDirString, ".tmp", userModulesDeployTimestampFile);
        Path parentPath = timestampPath.getParent();
        if (parentPath == null) {
            return null;
        }
        File parentFile = parentPath.toFile();
        if (!(parentFile.mkdirs() || parentFile.exists())) {
            logger.warn("Unable to create parent directory at '"+ parentFile.getAbsolutePath() +"' for module timestamp file.");
        }
        return timestampPath.toString();
    }

    @Override
    public void setUserModulesDeployTimestampFile(String userModulesDeployTimestampFile) {
        this.userModulesDeployTimestampFile = userModulesDeployTimestampFile;
    }

    @Override
    @Deprecated
    public Path getEntityDir(String entityName) {
        return getLegacyHubEntitiesDir().resolve(entityName);
    }

    @Override
    public Path getMappingDir(String mappingName) {
        return getHubMappingsDir().resolve(mappingName);
    }

    @Override
    public Path getLegacyMappingDir(String mappingName) {
        return getLegacyHubMappingsDir().resolve(mappingName);
    }

    @Override
    public Path getCustomModuleDir(String stepName, String stepType) {
        return getCustomModulesDir().resolve(stepType).resolve(stepName);
    }

    @Override
    public Path getProjectDir() {
        return projectDir;
    }

    @Override
    public Path getHubCentralConfigPath() {
        return this.projectDir.resolve("config");
    }

    @Override
    public Path getHubCentralConceptsPath() {
        return this.projectDir.resolve("concepts");
    }

    @Override
    public Path getStepsPath() {
        return this.projectDir.resolve("steps");
    }

    @Override
    public Path getStepsPath(StepDefinition.StepDefinitionType type) {
        Path path;

        Path parent = this.getStepsPath();

        if (type == null) {
            throw new DataHubProjectException("Invalid Step type");
        }
        else {
            switch (type) {
                case CUSTOM:
                    path = parent.resolve("custom");
                    break;
                case INGESTION:
                    path = parent.resolve("ingestion");
                    break;
                case MAPPING:
                    path = parent.resolve("mapping");
                    break;
                case MASTERING:
                    path = parent.resolve("mastering");
                    break;
                case MATCHING:
                    path = parent.resolve("matching");
                    break;
                case MERGING:
                    path = parent.resolve("merging");
                    break;
                default:
                    throw new DataHubProjectException("Invalid Step type" + type.toString());
            }
        }

        return path;
    }

    @Override
    public File getStepFile(StepDefinition.StepDefinitionType stepType, String stepName) {
        // Have to use toString instead of name so we get lowercase
        return getStepsPath().resolve(stepType.toString()).resolve(stepName + ".step.json").toFile();
    }
}
