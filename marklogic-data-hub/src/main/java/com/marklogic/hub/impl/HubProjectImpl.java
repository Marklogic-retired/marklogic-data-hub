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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import com.marklogic.rest.util.JsonNodeUtil;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.marklogic.hub.HubConfig.HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES;
import static com.marklogic.hub.HubConfig.USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES;

/**
 * Class for creating a hub Project
 */
@Component
public class HubProjectImpl implements HubProject {

    public static final String ENTITY_CONFIG_DIR = PATH_PREFIX + "entity-config";
    public static final String MODULES_DIR = PATH_PREFIX + "ml-modules";
    public static final String USER_SCHEMAS_DIR = PATH_PREFIX + "ml-schemas";

    private String projectDirString;
    private Path projectDir;
    private Path pluginsDir;
    private Path stepDefinitionsDir;
    private String userModulesDeployTimestampFile = USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES;

    @Autowired @Lazy
    private FlowManagerImpl flowManager;

    @Autowired @Lazy
    private Versions versions;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

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
    public Path getStepsDirByType(StepDefinition.StepDefinitionType type) {
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
                    throw new DataHubProjectException("Invalid Step type");
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

    @Override public Path getHubStagingModulesDir() {
        return this.projectDir.resolve(MODULES_DIR);
    }

    @Override public Path getUserStagingModulesDir() {
        return this.projectDir.resolve(MODULES_DIR);
    }

    @Override public Path getModulesDir() {
        return this.projectDir.resolve(MODULES_DIR);
    }

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
        this.stepDefinitionsDir.toFile().mkdirs();

        Path userModules = this.projectDir.resolve(MODULES_DIR);
        userModules.toFile().mkdirs();

        Path customModulesDir = getCustomModulesDir();
        customModulesDir.toFile().mkdirs();
        getCustomMappingFunctionsDir().toFile().mkdirs();

        //scaffold custom mapping|ingestion|mastering dirs.
        for (StepDefinition.StepDefinitionType stepType : StepDefinition.StepDefinitionType.values()) {
            customModulesDir.resolve(stepType.toString().toLowerCase()).toFile().mkdirs();
        }

        Path entitiesDir = getHubEntitiesDir();
        entitiesDir.toFile().mkdirs();

        Path mappingsDir = getHubMappingsDir();
        mappingsDir.toFile().mkdirs();

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
        // the following config has to do with ordering of initialization.
        // users and roles must be present to install the hub.
        // amps cannot be installed until after staging modules db exists.
        Path hubSecurityDir = getHubSecurityDir();
        Path userSecurityDir = getUserSecurityDir();
        Path rolesDir = hubSecurityDir.resolve("roles");
        Path usersDir = hubSecurityDir.resolve("users");
        Path ampsDir = hubSecurityDir.resolve("amps");
        Path privilegesDir = hubSecurityDir.resolve("privileges");

        Path userRolesDir = userSecurityDir.resolve("roles");
        Path userUsersDir = userSecurityDir.resolve("users");
        Path userPrivilegesDir = userSecurityDir.resolve("privileges");

        rolesDir.toFile().mkdirs();
        usersDir.toFile().mkdirs();
        privilegesDir.toFile().mkdirs();

        userRolesDir.toFile().mkdirs();
        userUsersDir.toFile().mkdirs();
        userPrivilegesDir.toFile().mkdirs();

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

        // Ant-style path matching
        Resource[] resources = new Resource[0];
        InputStream is = null;
        try {
            resources = resolver.getResources("classpath:hub-internal-config/security/amps/*.json");
            for (Resource resource : resources) {
                is = resource.getInputStream();
                FileUtil.copy(is, ampsDir.resolve(resource.getFilename()).toFile());
            }
        } catch (IOException e) {
            logger.error("Failed to load amp resource", e);
        } finally {
            IOUtils.closeQuietly(is);
        }

        // New 5.2.0 roles
        writeRoleFile(rolesDir, "data-hub-admin.json");
        writeRoleFile(rolesDir, "data-hub-developer.json");
        writeRoleFile(rolesDir, "data-hub-environment-manager.json");
        writeRoleFile(rolesDir, "data-hub-job-internal.json");
        writeRoleFile(rolesDir, "data-hub-job-reader.json");
        writeRoleFile(rolesDir, "data-hub-monitor.json");
        writeRoleFile(rolesDir, "data-hub-operator.json");
        writeRoleFile(rolesDir, "data-hub-portal-security-admin.json");
        writeRoleFile(rolesDir, "data-hub-security-admin.json");
        writeRoleFile(rolesDir, "data-hub-flow-reader.json");
        writeRoleFile(rolesDir, "data-hub-flow-writer.json");
        writeRoleFile(rolesDir, "data-hub-mapping-reader.json");
        writeRoleFile(rolesDir, "data-hub-mapping-writer.json");
        writeRoleFile(rolesDir, "data-hub-step-definition-reader.json");
        writeRoleFile(rolesDir, "data-hub-step-definition-writer.json");
        writeRoleFile(rolesDir, "data-hub-entity-model-writer.json");
        writeRoleFile(rolesDir, "data-hub-module-reader.json");
        writeRoleFile(rolesDir, "data-hub-module-writer.json");


        // New 5.1.0 roles
        writeRoleFile(rolesDir, "data-hub-entity-model-reader.json");
        writeRoleFile(rolesDir, "data-hub-explorer-architect.json");

        // Legacy roles
        writeRoleFile(rolesDir, "data-hub-admin-role.json");
        writeRoleFile(rolesDir, "flow-developer-role.json");
        writeRoleFile(rolesDir, "flow-operator-role.json");

        writeResourceFile("hub-internal-config/security/users/flow-developer-user.json", usersDir.resolve("flow-developer-user.json"), true);
        writeResourceFile("hub-internal-config/security/users/flow-operator-user.json", usersDir.resolve("flow-operator-user.json"), true);

        writeResourceFile("hub-internal-config/security/privileges/dhf-internal-data-hub.json", privilegesDir.resolve("dhf-internal-data-hub.json"), true);
        writeResourceFile("hub-internal-config/security/privileges/dhf-internal-entities.json", privilegesDir.resolve("dhf-internal-entities.json"), true);
        writeResourceFile("hub-internal-config/security/privileges/dhf-internal-mappings.json", privilegesDir.resolve("dhf-internal-mappings.json"), true);
        writeResourceFile("hub-internal-config/security/privileges/dhf-internal-trace-ui.json", privilegesDir.resolve("dhf-internal-trace-ui.json"), true);

        getUserServersDir().toFile().mkdirs();
        getUserDatabaseDir().toFile().mkdirs();

        //scaffold schemas
        getUserDatabaseDir().resolve(customTokens.get("%%mlStagingSchemasDbName%%")).resolve("schemas").toFile().mkdirs();
        getUserSchemasDir().toFile().mkdirs();

        //create flow dir
        getFlowsDir().toFile().mkdirs();

        //create hub triggers
        Path hubTriggersDir = getHubTriggersDir();
        hubTriggersDir.toFile().mkdirs();
        writeResourceFile("hub-internal-config/triggers/ml-dh-entity-validate-create.json", hubTriggersDir.resolve("ml-dh-entity-validate-create.json"), true);
        writeResourceFile("hub-internal-config/triggers/ml-dh-entity-validate-modify.json", hubTriggersDir.resolve("ml-dh-entity-validate-modify.json"), true);
        writeResourceFile("hub-internal-config/triggers/ml-dh-entity-create.json", hubTriggersDir.resolve("ml-dh-entity-create.json"), true);
        writeResourceFile("hub-internal-config/triggers/ml-dh-entity-modify.json", hubTriggersDir.resolve("ml-dh-entity-modify.json"), true);
        writeResourceFile("hub-internal-config/triggers/ml-dh-entity-delete.json", hubTriggersDir.resolve("ml-dh-entity-delete.json"), true);

        // triggers for JSON mapping conversion to Entity Services mapping XML
        writeResourceFile("hub-internal-config/triggers/ml-dh-json-mapping-create.json", hubTriggersDir.resolve("ml-dh-json-mapping-create.json"), true);
        writeResourceFile("hub-internal-config/triggers/ml-dh-json-mapping-modify.json", hubTriggersDir.resolve("ml-dh-json-mapping-modify.json"), true);
        writeResourceFile("hub-internal-config/triggers/ml-dh-json-mapping-delete.json", hubTriggersDir.resolve("ml-dh-json-mapping-delete.json"), true);

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

    private void writeRoleFile(Path rolesDir, String filename) {
        writeResourceFile("hub-internal-config/security/roles/" + filename, rolesDir.resolve(filename), true);
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
            logger.info("Getting file: " + srcFile);
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
                logger.info("Getting file with Replace: " + srcFile);
                inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);

                String fileContents = IOUtils.toString(inputStream);
                for (String key : customTokens.keySet()) {

                    String value = customTokens.get(key);
                    if (value != null) {
                        fileContents = fileContents.replace(key, value);
                    }
                }
                try(FileWriter writer = new FileWriter(dstFile.toFile())) {
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
    public void upgradeProject() throws IOException {
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
        upgradeFlows();
        removeEmptyRangeElementIndexArrayFromFinalDatabaseFile();
        addPathRangeIndexesToFinalDatabase();
    }

    private void addPathRangeIndexesToFinalDatabase() {
        File finalDbFile = getUserConfigDir().resolve("database-fields").resolve("final-database.xml").toFile();
        try {
            FileInputStream fileInputStream = new FileInputStream(finalDbFile);
            DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();

            Document document = documentBuilder.parse(fileInputStream);

            XPathFactory xPathFactory = XPathFactory.newInstance();
            XPath xPath = xPathFactory.newXPath();

            XPathExpression expr = xPath.compile("//range-path-index/*[local-name()='path-expression']/text()='//actionDetails/*/uris'");

            Boolean isNodePresent = Boolean.parseBoolean(expr.evaluate(document));

            if(!isNodePresent) {
                Node node = (Node) xPath
                    .evaluate("//*[local-name()='range-path-indexes']", document.getDocumentElement(), XPathConstants.NODE);

                Node newNode = node.appendChild(document.createElement("range-path-index"));

                Element scalarType = document.createElement("scalar-type");
                scalarType.setTextContent("string");

                Element collation = document.createElement("scalar-type");
                collation.setTextContent("http://marklogic.com/collation/");

                Element pathExpression = document.createElement("path-expression");
                pathExpression.setTextContent("//actionDetails/*/uris");

                Element rangeValuePosition = document.createElement("range-value-positions");
                rangeValuePosition.setTextContent("true");

                Element invalidValues = document.createElement("invalid-values");
                invalidValues.setTextContent("reject");

                newNode.appendChild(scalarType);
                newNode.appendChild(collation);
                newNode.appendChild(pathExpression);
                newNode.appendChild(rangeValuePosition);
                newNode.appendChild(invalidValues);

                TransformerFactory tf = TransformerFactory.newInstance();
                Transformer transformer = tf.newTransformer();
                transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
                transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
                transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");

                transformer.transform(new DOMSource(document),
                    new StreamResult(new OutputStreamWriter(new FileOutputStream(finalDbFile), "UTF-8")));
            }
        }
        catch (Exception e) {
            throw new DataHubProjectException("Error while upgrading project; was not able to add //actionDetails/*/uris " +
                "path range index to final-database.xml file; cause: " + e.getMessage(), e);
        }

    }

    @Override
    public void exportProject(File location) {
        if(!location.getParentFile().exists()) {
            location.getParentFile().mkdirs();
        }
        try (ZipOutputStream zout = new ZipOutputStream(new FileOutputStream(location))){
            Stream.of("entities", "flows", "src" + File.separator + "main", "mappings", "step-definitions", "gradle",
                "gradlew", "gradlew.bat", "build.gradle", "gradle.properties").forEach(file ->{
                File fileToZip = getProjectDir().resolve(file).toFile();
                try {
                    if (fileToZip.isDirectory()) {
                        zout.putNextEntry(new ZipEntry(file + File.separator));
                        zipSubDirectory(file + File.separator, fileToZip, zout);
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

    private void zipSubDirectory(String basePath, File fileToZip, ZipOutputStream zout) throws IOException {
        File[] files = fileToZip.listFiles();
        if(files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    String path = basePath + file.getName() + File.separator;
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
        FileInputStream fin = new FileInputStream(fileToZip);
        zout.putNextEntry(new ZipEntry(basePath + fileToZip.getName()));
        IOUtils.copy(fin, zout);
        IOUtils.closeQuietly(fin);
    }

    protected void upgradeFlows() {
        if(versions.isVersionCompatibleWithES()){
            flowManager.getLocalFlows().forEach(flow ->{
                flow.getSteps().values().forEach((step) -> {
                    if((step.getStepDefinitionType().equals(StepDefinition.StepDefinitionType.MAPPING)) &&
                        step.getStepDefinitionName().equalsIgnoreCase("default-mapping")){
                        step.setStepDefinitionName("entity-services-mapping");
                    }
                });
                flowManager.saveFlow(flow);
            });
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

    @Override  public String getHubModulesDeployTimestampFile() {
        return Paths.get(projectDirString, ".tmp", HUB_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toString();
    }

    @Override public String getUserModulesDeployTimestampFile() {
        return Paths.get(projectDirString, ".tmp", userModulesDeployTimestampFile).toString();
    }

    @Override
    public void setUserModulesDeployTimestampFile(String userModulesDeployTimestampFile) {
        this.userModulesDeployTimestampFile = userModulesDeployTimestampFile;
    }

    /* copying only the required old hub-internal-config db and server files to new locations
     *  the security files (users, roles, privileges etc are not copied from old hub-internal-config)
     */
    private void upgradeHubInternalConfig(Path sourceDir, Path renamedSourceDir, Set<String> obsoleteFiles) throws IOException {
        if (Files.exists(sourceDir)) {
            logger.info("Upgrading hub-internal-config dir");
            try(Stream<Path> files = Files.walk(Paths.get(sourceDir.toUri()))) {
                files.filter(f -> !Files.isDirectory(f))
                    .forEach(f -> {
                        String path = f.toFile().getName();
                        //copy jobs,staging db to hub-internal-config
                        if (path.toLowerCase().equals("job-database.json")
                            || path.toLowerCase().equals("staging-database.json")) {
                            logger.info("Processing " + f.toFile().getAbsolutePath());
                            ObjectMapper mapper = new ObjectMapper();
                            ObjectNode rootNode;
                            File jsonFile = f.toFile();
                            try {
                                rootNode = (ObjectNode) mapper.readTree(jsonFile);
                                rootNode.put("schema-database", "%%mlStagingSchemasDbName%%");
                                logger.info("Setting \"schema-database\" to \"%%mlStagingSchemasDbName%%\"");
                                rootNode.put("triggers-database", "%%mlStagingTriggersDbName%%");
                                logger.info("Setting \"triggers-database\" to \"%%mlStagingTriggersDbName%%\"");

                                if (path.toLowerCase().equals("job-database.json")) {
                                    addPathRangeIndexesToJobDatabase(rootNode);
                                }

                                String dbFile = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode);
                                logger.info("Writing " + f.toFile().getAbsolutePath() + " to "
                                    + getHubDatabaseDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                                FileUtils.writeStringToFile(getHubDatabaseDir().resolve(f.getFileName()).toFile(), dbFile);
                            } catch (IOException e) {
                                logger.error("Unable to update " + f.getFileName());
                                throw new RuntimeException(e);
                            }

                        }
                        //copy modules,final db to ml-config
                        else if (path.toLowerCase().equals("modules-database.json")
                            || path.toLowerCase().equals("final-database.json")) {
                            try {
                                if (path.toLowerCase().equals("modules-database.json")) {
                                    logger.info("Writing " + f.toFile().getAbsolutePath() + " to "
                                        + getUserDatabaseDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                                    FileUtils.copyFile(f.toFile(), getUserDatabaseDir().resolve(f.getFileName()).toFile());
                                } else {
                                    logger.info("Processing " + f.toFile().getAbsolutePath());
                                    ObjectMapper mapper = new ObjectMapper();
                                    ObjectNode rootNode;
                                    File jsonFile = f.toFile();
                                    try {
                                        rootNode = (ObjectNode) mapper.readTree(jsonFile);
                                        rootNode.put("schema-database", "%%mlFinalSchemasDbName%%");
                                        logger.info("Setting \"schema-database\" to \"%%mlFinalSchemasDbName%%\"");
                                        rootNode.put("triggers-database", "%%mlFinalTriggersDbName%%");
                                        logger.info("Setting \"triggers-database\" to \"%%mlFinalTriggersDbName%%\"");
                                        String dbFile = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode);
                                        logger.info("Writing " + f.toFile().getAbsolutePath() + " to "
                                            + getUserDatabaseDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                                        FileUtils.writeStringToFile(getUserDatabaseDir().resolve(f.getFileName()).toFile(), dbFile);
                                    } catch (IOException e) {
                                        logger.error("Unable to update " + f.getFileName());
                                        throw new RuntimeException(e);
                                    }

                                }
                            } catch (IOException e) {
                                logger.error("Unable to update " + f.getFileName());
                                throw new RuntimeException(e);
                            }
                        }
                        //copy jobs,staging server to hub-internal-config
                        else if (path.toLowerCase().endsWith("job-server.json")
                            || path.toLowerCase().endsWith("staging-server.json")) {
                            logger.info("Processing " + f.toFile().getAbsolutePath());
                            ObjectMapper mapper = new ObjectMapper();
                            JsonNode rootNode = null;
                            File jsonFile = f.toFile();
                            try {
                                rootNode = mapper.readTree(jsonFile);
                                //set the url-rewriter and error-handler
                                if (path.toLowerCase().endsWith("staging-server.json")) {
                                    logger.info("Setting \"url-rewriter\" to \"/data-hub/5/rest-api/rewriter.xml\"");
                                    ((ObjectNode) rootNode).put("url-rewriter", "/data-hub/5/rest-api/rewriter/%%mlServerVersion%%-rewriter.xml");
                                    logger.info("Setting \"error-handler\" to \"/MarkLogic/rest-api/error-handler.xqy\"");
                                    ((ObjectNode) rootNode).put("error-handler", "/MarkLogic/rest-api/error-handler.xqy");
                                } else {
                                    logger.info("Setting \"url-rewriter\" to \"/data-hub/5/tracing/tracing-rewriter.xml\"");
                                    ((ObjectNode) rootNode).put("url-rewriter", "/data-hub/5/tracing/tracing-rewriter.xml");
                                }
                                String serverFile = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode);
                                logger.info("Writing " + f.toFile().getAbsolutePath() + " to "
                                    + getHubServersDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                                FileUtils.writeStringToFile(getHubServersDir().resolve(f.getFileName()).toFile(), serverFile);
                            } catch (IOException e) {
                                logger.error("Unable to update " + f.getFileName());
                                throw new RuntimeException(e);
                            }
                        }
                        //copy final server to ml-config
                        else if (path.toLowerCase().equals("final-server.json")) {
                            try {
                                logger.info("Writing " + f.toFile().getAbsolutePath() + " to "
                                    + getUserServersDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                                FileUtils.copyFile(f.toFile(), getUserServersDir().resolve(f.getFileName()).toFile());
                            } catch (IOException e) {
                                logger.error("Unable to update " + f.getFileName());
                                throw new RuntimeException(e);
                            }
                        }
                        //move the rest of the payloads that are not part of the set to
                        // hub-internal-config
                        else if (!obsoleteFiles.contains(path.toLowerCase())) {
                            InputStream inputStream = null;
                            try {
                                inputStream = Files.newInputStream(f);
                                FileUtils.copyInputStreamToFile(
                                    inputStream,
                                    getHubConfigDir().resolve(sourceDir.relativize(f)).toFile());
                            } catch (IOException e) {
                                logger.error("Unable to copy file " + f.getFileName());
                                throw new RuntimeException(e);
                            } finally {
                                IOUtils.closeQuietly(inputStream);
                            }
                        }
                    });
            }
           // Files.copy(sourceDir, destDir, StandardCopyOption.REPLACE_EXISTING);
            FileUtils.moveDirectory(sourceDir.toFile(), renamedSourceDir.toFile());
        }
    }

    /**
     * In the upgrade from 3.x to 4.x, the job-database.json file is copied to its new location, but it also needs
     * several indexes added to it.
     *
     * @param rootNode
     */
    private void addPathRangeIndexesToJobDatabase(ObjectNode rootNode) {
        if (rootNode.get("range-path-index") == null) {
            if (logger.isInfoEnabled()) {
                logger.info("Adding path range indexes to job-database.json");
            }

            ArrayNode indexes = rootNode.putArray("range-path-index");
            addStringPathRangeIndex(indexes, "/trace/hasError");
            addStringPathRangeIndex(indexes, "/trace/flowType");
            addStringPathRangeIndex(indexes, "/trace/jobId");
            addStringPathRangeIndex(indexes, "/trace/traceId");
            addStringPathRangeIndex(indexes, "/trace/identifier");

            ObjectNode node = indexes.addObject();
            node.put("scalar-type", "dateTime");
            node.put("path-expression", "/trace/created");
            node.put("collation", "");
            node.put("range-value-positions", false);
            node.put("invalid-values", "reject");
        }
    }

    private void addStringPathRangeIndex(ArrayNode indexes, String path) {
        ObjectNode node = indexes.addObject();
        node.put("scalar-type", "string");
        node.put("path-expression", path);
        node.put("collation", "http://marklogic.com/collation/codepoint");
        node.put("range-value-positions", false);
        node.put("invalid-values", "reject");
    }

    /*  "user-config" is the other config dir, it can contain "final-server.json". In 3.0 ,they are
     *  deployed after hub-internal-config. But we don't want to blindly copy all these files to ml-config
     *  as they would overwrite existing "final-server.json" (or database file)
     *  So merging the user-config files with the one copied to ml-config already and copying rest
     *  ml-config
    */
    private void upgradeUserConfig(Path sourceDir, Path renamedSourceDir, Set<String> obsoleteFiles) throws IOException {
        if (Files.exists(sourceDir)) {
            logger.info("Upgrading user-config dir");
            try (Stream<Path> files = Files.walk(Paths.get(sourceDir.toUri()))) {
                files.filter(f -> !Files.isDirectory(f))
                    .forEach(f -> {
                        String path = f.toFile().getName();
                        List<File> filesToMerge = new ArrayList<>();
                        //copy modules,final db to ml-config
                        if (path.toLowerCase().equals("modules-database.json")
                            || path.toLowerCase().equals("final-database.json")) {
                            try {
                                ObjectMapper mapper = new ObjectMapper();
                                //File copied to src/main/ml-config/databases earlier
                                filesToMerge.add(getUserDatabaseDir().resolve(f.getFileName()).toFile());
                                //File from user-config/databases
                                filesToMerge.add(f.toFile());
                                // write merged file back
                                logger.info("Merging " + path + "from hub-internal-config and user-config");
                                String dbFile = mapper.writerWithDefaultPrettyPrinter().
                                    writeValueAsString(JsonNodeUtil.mergeJsonFiles(filesToMerge));
                                logger.info("Writing merged " + path + "to " + getUserDatabaseDir().toFile().getAbsolutePath());
                                FileUtils.writeStringToFile(getUserDatabaseDir().resolve(f.getFileName()).toFile(), dbFile);

                            } catch (IOException e) {
                                logger.error("Unable to update " + f.getFileName());
                                throw new RuntimeException(e);
                            }
                        }
                        //copy final server to ml-config
                        else if (path.toLowerCase().equals("final-server.json")) {
                            try {
                                ObjectMapper mapper = new ObjectMapper();
                                //File copied to src/main/hub-internal-config/servers earlier
                                filesToMerge.add(getUserServersDir().resolve(f.getFileName()).toFile());
                                //File from user-config/servers
                                filesToMerge.add(f.toFile());
                                // write merged file back
                                logger.info("Merging " + path + "from hub-internal-config and user-config");
                                String serverFile = mapper.writerWithDefaultPrettyPrinter().
                                    writeValueAsString(JsonNodeUtil.mergeJsonFiles(filesToMerge));
                                logger.info("Writing merged " + path + "to " + getUserServersDir().toFile().getAbsolutePath());
                                FileUtils.writeStringToFile(getUserServersDir().resolve(f.getFileName()).toFile(),
                                    serverFile);
                            } catch (IOException e) {
                                logger.error("Unable to update " + f.getFileName());
                                throw new RuntimeException(e);
                            }
                        }
                        //copy all other files in user-config to ml-config except the obsolete ones
                        else if (!obsoleteFiles.contains(path.toLowerCase())) {
                            InputStream inputStream = null;
                            try {
                                inputStream = Files.newInputStream(f);
                                FileUtils.copyInputStreamToFile(
                                    inputStream,
                                    getUserConfigDir().resolve(sourceDir.relativize(f)).toFile());
                            } catch (IOException e) {
                                logger.error("Unable to copy " + f.getFileName());
                                throw new RuntimeException(e);
                            } finally {
                                IOUtils.closeQuietly(inputStream);
                            }
                        }

                    });
            }
           // Files.copy(sourceDir, destDir, StandardCopyOption.REPLACE_EXISTING);
            FileUtils.moveDirectory(sourceDir.toFile(), renamedSourceDir.toFile());
        }
    }

    private void upgradeProjectDir(Path sourceDir, Path destDir, Path renamedSourceDir) throws IOException {
        if (Files.exists(sourceDir)) {
            logger.info("Upgrading entity-config dir");
            FileUtils.copyDirectory(sourceDir.toFile(), destDir.toFile(), false);
           // Files.copy(sourceDir, destDir, StandardCopyOption.REPLACE_EXISTING);
            FileUtils.moveDirectory(sourceDir.toFile(), renamedSourceDir.toFile());
        }
    }

    /**
     * When upgrading to 4.1.0 or later, obsolete files may need to be delete from hub internal config
     * directory because they were left there by the 3.0 to 4.0.x upgrade. "staging-modules-database.json"
     * is an obsolete file from 4.0.0
     */
    private void deleteObsoleteDatabaseFilesFromHubInternalConfig() {
        File dir = getHubDatabaseDir().toFile();
        Set<String> filenames = Stream.of("final-database.json", "modules-database.json",
            "schemas-database.json", "trace-database.json", "triggers-database.json", "staging-modules-database.json"
        ).collect(Collectors.toSet());
        for (String filename : filenames) {
            File f = new File(dir, filename);
            if (f.exists()) {
                if (logger.isInfoEnabled()) {
                    logger.info("Deleting file because it should no longer be in hub-internal-config: " + f.getAbsolutePath());
                }
                f.delete();
            }
        }
    }

    private void deleteObsoleteDatabaseFilesFromMlConfig() {
        File dir = getUserDatabaseDir().toFile();
        Set<String> filenames = Stream.of("final-modules-database.json").collect(Collectors.toSet());
        for (String filename : filenames) {
            File f = new File(dir, filename);
            if (f.exists()) {
                if (logger.isInfoEnabled()) {
                    logger.info("Deleting file because it should no longer be in ml-config: " + f.getAbsolutePath());
                }
                f.delete();
            }
        }
    }

     private void deleteObsoleteServerFilesFromHubInternalConfig() {
        File dir = getHubServersDir().toFile();
        Set<String> filenames = Stream.of("final-server.json", "trace-server.json").collect(Collectors.toSet());
        for (String filename : filenames) {
            File f = new File(dir, filename);
            if (f.exists()) {
                if (logger.isInfoEnabled()) {
                    logger.info("Deleting file because it should no longer be in hub-internal-config: " + f.getAbsolutePath());
                }
                f.delete();
            }
        }
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
}
