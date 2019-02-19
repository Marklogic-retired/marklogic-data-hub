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
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.rest.util.JsonNodeUtil;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    private Path stepsDir;
    private String userModulesDeployTimestampFile = USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES;

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
        this.stepsDir = this.projectDir.resolve("steps");
    }

    @Override public Path getHubPluginsDir() {
        return this.pluginsDir;
    }

    @Override
    public Path getStepsDir() {
        return this.stepsDir;
    }

    @Override
    public Path getStepsDirByType(Step.StepType type) {
        Path path;

        if (type == null) {
            throw new DataHubProjectException("Invalid Step type");
        }
        else {
            switch (type) {
                case CUSTOM:
                    path = this.stepsDir.resolve("custom");
                    break;
                case INGEST:
                    path = this.stepsDir.resolve("ingest");
                    break;
                case MAPPING:
                    path = this.stepsDir.resolve("mapping");
                    break;
                default:
                    throw new DataHubProjectException("Invalid Step type");
            }
        }

        return path;
    }

    @Override public Path getHubEntitiesDir() {
        return this.pluginsDir.resolve("entities");
    }

    @Override public Path getHubMappingsDir() {
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
        this.pluginsDir.toFile().mkdirs();
        this.stepsDir.toFile().mkdirs();

        Path userModules = this.projectDir.resolve(MODULES_DIR);
        userModules.toFile().mkdirs();

        Path hubServersDir = getHubServersDir();
        hubServersDir.toFile().mkdirs();
        writeResourceFile("hub-internal-config/servers/staging-server.json", hubServersDir.resolve("staging-server.json"), true);
        writeResourceFile("hub-internal-config/servers/job-server.json", hubServersDir.resolve("job-server.json"), true);

        Path userServersDir = getUserServersDir();
        userServersDir.toFile().mkdirs();
        writeResourceFile("ml-config/servers/final-server.json", userServersDir.resolve("final-server.json"), true);

        Path hubDatabaseDir = getHubDatabaseDir();
        hubDatabaseDir.toFile().mkdirs();
        writeResourceFile("hub-internal-config/databases/staging-database.json", hubDatabaseDir.resolve("staging-database.json"), true);
        writeResourceFile("hub-internal-config/databases/job-database.json", hubDatabaseDir.resolve("job-database.json"), true);
        writeResourceFile("hub-internal-config/databases/staging-schemas-database.json", hubDatabaseDir.resolve("staging-schemas-database.json"), true);
        writeResourceFile("hub-internal-config/databases/staging-triggers-database.json", hubDatabaseDir.resolve("staging-triggers-database.json"), true);

        Path userDatabaseDir = getUserDatabaseDir();
        userDatabaseDir.toFile().mkdirs();
        writeResourceFile("ml-config/databases/final-database.json", userDatabaseDir.resolve("final-database.json"), true);
        writeResourceFile("ml-config/databases/modules-database.json", userDatabaseDir.resolve("modules-database.json"), true);
        writeResourceFile("ml-config/databases/final-schemas-database.json", userDatabaseDir.resolve("final-schemas-database.json"), true);
        writeResourceFile("ml-config/databases/final-triggers-database.json", userDatabaseDir.resolve("final-triggers-database.json"), true);

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
        try {
            resources = resolver.getResources("classpath:hub-internal-config/security/amps/*.json");
            for (Resource resource : resources) {
                InputStream is = resource.getInputStream();
                FileUtil.copy(is, ampsDir.resolve(resource.getFilename()).toFile());
            }
        } catch (IOException e) {
            logger.error("Failed to load amp resource", e);
        }

        writeResourceFile("hub-internal-config/security/roles/data-hub-role.json", rolesDir.resolve("data-hub-role.json"), true);
        writeResourceFile("hub-internal-config/security/users/data-hub-user.json", usersDir.resolve("data-hub-user.json"), true);
        writeResourceFile("hub-internal-config/security/roles/hub-admin-role.json", rolesDir.resolve("hub-admin-role.json"), true);
        writeResourceFile("hub-internal-config/security/users/hub-admin-user.json", usersDir.resolve("hub-admin-user.json"), true);

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
        writeResourceFile("hub-internal-config/triggers/ml-dh-entity-create.json", hubTriggersDir.resolve("ml-dh-entity-create.json"), true);
        writeResourceFile("hub-internal-config/triggers/ml-dh-entity-modify.json", hubTriggersDir.resolve("ml-dh-entity-modify.json"), true);
        writeResourceFile("hub-internal-config/triggers/ml-dh-entity-delete.json", hubTriggersDir.resolve("ml-dh-entity-delete.json"), true);
               
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
            InputStream inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);
            FileUtil.copy(inputStream, dstFile.toFile());
        }
    }

    private void writeResourceFileWithReplace(Map<String, String> customTokens, String srcFile, Path dstFile) {
        writeResourceFileWithReplace(customTokens, srcFile, dstFile, false);
    }

    private void writeResourceFileWithReplace(Map<String, String> customTokens, String srcFile, Path dstFile, boolean overwrite) {
        try {
            if (overwrite || !dstFile.toFile().exists()) {
                logger.info("Getting file with Replace: " + srcFile);
                InputStream inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);

                String fileContents = IOUtils.toString(inputStream);
                for (String key : customTokens.keySet()) {

                    String value = customTokens.get(key);
                    if (value != null) {
                        fileContents = fileContents.replace(key, value);
                    }
                }
                FileWriter writer = new FileWriter(dstFile.toFile());
                writer.write(fileContents);
                writer.close();
            }
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void upgradeProject() throws IOException {

        //let's check if we have legacy config directories, then we copy them to their new places, and rename the previous ones as .old
        Path entityConfigDir = this.projectDir.resolve("entity-config");
        Path hubInternalConfigDir = this.projectDir.resolve("hub-internal-config");
        Path userConfigDir = this.projectDir.resolve("user-config");

        //and now what we want to name the old directories so they're not copied over again in another update
        Path oldEntityConfigDir = this.projectDir.resolve("entity-config.old");
        Path oldHubInternalConfigDir = this.projectDir.resolve("hub-internal-config.old");
        Path oldUserConfigDir = this.projectDir.resolve("user-config.old");
        
        //obsolete database/server/role names in hub-internal-config from 3.0
        Set<String> obsoleteFiles = Stream.of("trace-database.json", "triggers-database.json", 
                "schemas-database.json", "trace-server.json", "data-hub-role.json").collect(Collectors.toSet());
                
        //if the entity-config directory exists, we'll copy it to the src/main/entity-config
        upgradeProjectDir(entityConfigDir, getEntityConfigDir(), oldEntityConfigDir);
        
        upgradeHubInternalConfig(hubInternalConfigDir, oldHubInternalConfigDir, obsoleteFiles );
        
        upgradeUserConfig(userConfigDir, oldUserConfigDir, obsoleteFiles);
       
        /*If the upgrade path is 3.0 -> 4.0.x -> 4.1.0 or 4.0.0 -> 4.1.0, the obsolete files have to be removed, 
         * else, they will cause deployment to fail
         */
        deleteObsoleteDatabaseFilesFromHubInternalConfig();
        deleteObsoleteServerFilesFromHubInternalConfig();
        deleteObsoleteDatabaseFilesFromMlConfig();

        //remove hub-internal-config/schemas dir
        deleteObsoleteDirsFromHubInternalConfig();

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
            Files.walk(Paths.get(sourceDir.toUri()))
            .filter( f -> !Files.isDirectory(f))
            .forEach(f -> {
                String path = f.toFile().getName();
                //copy jobs,staging db to hub-internal-config
                if(path.toLowerCase().equals("job-database.json")
                || path.toLowerCase().equals("staging-database.json")) {
                    logger.info("Processing "+ f.toFile().getAbsolutePath());
                    ObjectMapper mapper = new ObjectMapper();
                    ObjectNode rootNode;
                    File jsonFile = f.toFile();
                    try {
                        rootNode = (ObjectNode)mapper.readTree(jsonFile);
                        rootNode.put("schema-database", "%%mlStagingSchemasDbName%%");
                        logger.info("Setting \"schema-database\" to \"%%mlStagingSchemasDbName%%\"");
                        rootNode.put("triggers-database", "%%mlStagingTriggersDbName%%");
                        logger.info("Setting \"triggers-database\" to \"%%mlStagingTriggersDbName%%\"");

                        if (path.toLowerCase().equals("job-database.json")) {
                            addPathRangeIndexesToJobDatabase(rootNode);
                        }

                        String dbFile = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode);
                        logger.info("Writing "+ f.toFile().getAbsolutePath() +" to "
                        +getHubDatabaseDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                        FileUtils.writeStringToFile(getHubDatabaseDir().resolve(f.getFileName()).toFile(), dbFile);
                    } catch (IOException e) {
                        logger.error("Unable to update "+f.getFileName());
                        throw new RuntimeException(e);
                    }
    
                }
                //copy modules,final db to ml-config
                else if(path.toLowerCase().equals("modules-database.json")
                || path.toLowerCase().equals("final-database.json")) {
                    try {
                        if (path.toLowerCase().equals("modules-database.json")) {
                            logger.info("Writing "+ f.toFile().getAbsolutePath() +" to "
                                    +getUserDatabaseDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                            FileUtils.copyFile(f.toFile(), getUserDatabaseDir().resolve(f.getFileName()).toFile());
                        }
                        else {
                            logger.info("Processing "+ f.toFile().getAbsolutePath());
                            ObjectMapper mapper = new ObjectMapper();
                            ObjectNode rootNode;
                            File jsonFile = f.toFile();
                            try {
                                rootNode = (ObjectNode)mapper.readTree(jsonFile);
                                rootNode.put("schema-database", "%%mlFinalSchemasDbName%%");
                                logger.info("Setting \"schema-database\" to \"%%mlFinalSchemasDbName%%\"");
                                rootNode.put("triggers-database", "%%mlFinalTriggersDbName%%");
                                logger.info("Setting \"triggers-database\" to \"%%mlFinalTriggersDbName%%\"");                              
                                String dbFile = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode);
                                logger.info("Writing "+ f.toFile().getAbsolutePath() +" to "
                                +getUserDatabaseDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                                FileUtils.writeStringToFile(getUserDatabaseDir().resolve(f.getFileName()).toFile(), dbFile);
                            } catch (IOException e) {
                                logger.error("Unable to update "+f.getFileName());
                                throw new RuntimeException(e);
                            }
                            
                        }
                    } catch (IOException e) {
                        logger.error("Unable to update "+f.getFileName());
                        throw new RuntimeException(e);
                    }
                }
                //copy jobs,staging server to hub-internal-config
                else if(path.toLowerCase().equals("job-server.json")
                || path.toLowerCase().equals("staging-server.json")) {
                    logger.info("Processing "+ f.toFile().getAbsolutePath());
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode rootNode = null;
                    File jsonFile = f.toFile();
                    try {
                        rootNode = mapper.readTree(jsonFile);
                        //set the url-rewriter and error-handler
                        if(path.toLowerCase().equals("staging-server.json")) {
                            logger.info("Setting \"url-rewriter\" to \"/data-hub/5/rest-api/rewriter.xml\"");
                            ((ObjectNode) rootNode).put("url-rewriter", "/data-hub/5/rest-api/rewriter.xml");
                            logger.info("Setting \"error-handler\" to \"/data-hub/5/rest-api/error-handler.xqy\"");
                            ((ObjectNode) rootNode).put("error-handler", "/data-hub/5/rest-api/error-handler.xqy");
                        }
                        else {
                            logger.info("Setting \"url-rewriter\" to \"/data-hub/5/tracing/tracing-rewriter.xml\"");
                            ((ObjectNode) rootNode).put("url-rewriter", "/data-hub/5/tracing/tracing-rewriter.xml");
                        }
                        String serverFile = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode);
                        logger.info("Writing "+ f.toFile().getAbsolutePath() +" to "
                                +getHubServersDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                        FileUtils.writeStringToFile(getHubServersDir().resolve(f.getFileName()).toFile(), serverFile);
                    } catch (IOException e) {
                        logger.error("Unable to update "+f.getFileName());
                        throw new RuntimeException(e);
                    }        
                }
                //copy final server to ml-config
                else if(path.toLowerCase().equals("final-server.json")) {
                    try {
                        logger.info("Writing "+ f.toFile().getAbsolutePath() +" to "
                                +getUserServersDir().resolve(f.getFileName()).toFile().getAbsolutePath());
                        FileUtils.copyFile(f.toFile(), getUserServersDir().resolve(f.getFileName()).toFile());
                    } catch (IOException e) {
                        logger.error("Unable to update "+f.getFileName());
                        throw new RuntimeException(e);
                    }
                }
                //move the rest of the payloads that are not part of the set to 
                // hub-internal-config
                else if(! obsoleteFiles.contains(path.toLowerCase())) {
                    try {
                        FileUtils.copyInputStreamToFile(
                                Files.newInputStream(f),
                                getHubConfigDir().resolve(sourceDir.relativize(f)).toFile());
                    } catch (IOException e) {
                        logger.error("Unable to copy file "+f.getFileName());
                        throw new RuntimeException(e);
                    }
                }
            });                        
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
            Files.walk(Paths.get(sourceDir.toUri()))
            .filter( f -> !Files.isDirectory(f))
            .forEach(f -> {
                String path = f.toFile().getName();
                List<File> filesToMerge = new ArrayList<>();             
                //copy modules,final db to ml-config
                if(path.toLowerCase().equals("modules-database.json")
                || path.toLowerCase().equals("final-database.json")) {
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        //File copied to src/main/ml-config/databases earlier
                        filesToMerge.add(getUserDatabaseDir().resolve(f.getFileName()).toFile());
                        //File from user-config/databases
                        filesToMerge.add(f.toFile());
                        // write merged file back
                        logger.info("Merging "+ path + "from hub-internal-config and user-config");
                        String dbFile = mapper.writerWithDefaultPrettyPrinter().
                                writeValueAsString(JsonNodeUtil.mergeJsonFiles(filesToMerge));
                        logger.info("Writing merged "+ path + "to "+getUserDatabaseDir().toFile().getAbsolutePath());
                        FileUtils.writeStringToFile(getUserDatabaseDir().resolve(f.getFileName()).toFile(), dbFile);
                       
                    } catch (IOException e) {
                        logger.error("Unable to update "+f.getFileName());
                        throw new RuntimeException(e);
                    }
                }
                //copy final server to ml-config
                else if(path.toLowerCase().equals("final-server.json")) {
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        //File copied to src/main/hub-internal-config/servers earlier
                        filesToMerge.add(getUserServersDir().resolve(f.getFileName()).toFile());
                        //File from user-config/servers
                        filesToMerge.add(f.toFile());
                        // write merged file back
                        logger.info("Merging "+ path + "from hub-internal-config and user-config");
                        String serverFile = mapper.writerWithDefaultPrettyPrinter().
                                writeValueAsString(JsonNodeUtil.mergeJsonFiles(filesToMerge));
                        logger.info("Writing merged "+ path + "to "+getUserServersDir().toFile().getAbsolutePath());
                        FileUtils.writeStringToFile(getUserServersDir().resolve(f.getFileName()).toFile(),
                                serverFile);                       
                    } catch (IOException e) {
                        logger.error("Unable to update "+f.getFileName());
                        throw new RuntimeException(e);
                    }
                }
                //copy all other files in user-config to ml-config except the obsolete ones 
                else if(! obsoleteFiles.contains(path.toLowerCase())) {
                    try {
                        FileUtils.copyInputStreamToFile(
                                Files.newInputStream(f),
                                getUserConfigDir().resolve(sourceDir.relativize(f)).toFile());
                    } catch (IOException e) {
                        logger.error("Unable to copy "+f.getFileName());
                        throw new RuntimeException(e);
                    }
                }
                               
            });                        
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

    private void deleteObsoleteDirsFromHubInternalConfig() {
        File dir = getHubConfigDir().resolve("schemas").toFile();
        if (dir.exists()) {
            if (logger.isInfoEnabled()) {
                logger.info("Deleting hub-internal-config/schemas dir because it is no longer used");
            }
            try {
                FileUtils.deleteDirectory(dir);
            } catch (IOException e) {
                logger.error("Unable to delete "+ dir.getAbsolutePath());
                throw new RuntimeException(e);
            }
        }

    }

    @Override
    public Path getEntityDir(String entityName) {
        return getHubEntitiesDir().resolve(entityName);
    }

    @Override
    public Path getMappingDir(String mappingName) {
        return getHubMappingsDir().resolve(mappingName);
    }

    @Override
    public Path getProjectDir() {
        return projectDir;
    }
}
