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

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Class for creating a hub Project
 */
public class HubProjectImpl implements HubProject {

    public static final String ENTITY_CONFIG_DIR = PATH_PREFIX + "entity-config";
    public static final String MODULES_DIR = PATH_PREFIX + "ml-modules";
    public static final String USER_SCHEMAS_DIR = PATH_PREFIX + "ml-schemas";

    private Path projectDir;
    private Path pluginsDir;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public HubProjectImpl(String projectDirStr) {
        this.projectDir = Paths.get(projectDirStr).toAbsolutePath();
        this.pluginsDir = this.projectDir.resolve("plugins");
    }

    @Override public Path getHubPluginsDir() {
        return this.pluginsDir;
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

    @Override public Path getHubSchemasDir() { return getHubConfigDir().resolve("schemas"); }

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
        Path privDir = hubSecurityDir.resolve("privileges"); 

        Path userRolesDir = userSecurityDir.resolve("roles");
        Path userUsersDir = userSecurityDir.resolve("users");

        rolesDir.toFile().mkdirs();
        usersDir.toFile().mkdirs();
        privDir.toFile().mkdirs();
        userRolesDir.toFile().mkdirs();
        userUsersDir.toFile().mkdirs();

        writeResourceFile("hub-internal-config/security/roles/data-hub-role.json", rolesDir.resolve("data-hub-role.json"), true);
        writeResourceFile("hub-internal-config/security/users/data-hub-user.json", usersDir.resolve("data-hub-user.json"), true);
        writeResourceFile("hub-internal-config/security/roles/hub-admin-role.json", rolesDir.resolve("hub-admin-role.json"), true);
        writeResourceFile("hub-internal-config/security/users/hub-admin-user.json", usersDir.resolve("hub-admin-user.json"), true);
        
        writeResourceFile("hub-internal-config/security/privileges/dhf-internal-data-hub.json", privDir.resolve("dhf-internal-data-hub.json"), true);
        writeResourceFile("hub-internal-config/security/privileges/dhf-internal-entities.json", privDir.resolve("dhf-internal-entities.json"), true);
        writeResourceFile("hub-internal-config/security/privileges/dhf-internal-mappings.json", privDir.resolve("dhf-internal-mappings.json"), true);
        writeResourceFile("hub-internal-config/security/privileges/dhf-internal-trace-ui.json", privDir.resolve("dhf-internal-trace-ui.json"), true);
        
        getUserServersDir().toFile().mkdirs();
        getUserDatabaseDir().toFile().mkdirs();

        //scaffold schemas
        getHubSchemasDir().toFile().mkdirs();
        getUserSchemasDir().toFile().mkdirs();

        //scaffold triggers
        getHubConfigDir().resolve("triggers").toFile().mkdirs();
        getUserConfigDir().resolve("triggers").toFile().mkdirs();

        Path gradlew = projectDir.resolve("gradlew");
        writeResourceFile("scaffolding/gradlew", gradlew);
        makeExecutable(gradlew);

        Path gradlewbat = projectDir.resolve("gradlew.bat");
        writeResourceFile("scaffolding/gradlew.bat", gradlewbat);
        makeExecutable(gradlewbat);

        Path gradleWrapperDir = projectDir.resolve("gradle").resolve("wrapper");
        gradleWrapperDir.toFile().mkdirs();

        writeResourceFile("scaffolding/gradle/wrapper/gradle-wrapper.jar", gradleWrapperDir.resolve("gradle-wrapper.jar"));
        writeResourceFile("scaffolding/gradle/wrapper/gradle-wrapper.properties", gradleWrapperDir.resolve("gradle-wrapper.properties"));

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

        //let's set paths for dest directories
        Path newEntityConfigDir = Paths.get(HubConfig.ENTITY_CONFIG_DIR);
        Path newHubInternalConfigDir = Paths.get(HUB_CONFIG_DIR);
        Path mlConfigDir = Paths.get(USER_CONFIG_DIR);

        //and now what we want to name the old directories so they're not copied over again in another update
        Path oldEntityConfigDir = this.projectDir.resolve("entity-config.old");
        Path oldHubInternalConfigDir = this.projectDir.resolve("hub-internal-config.old");
        Path oldUserConfigDir = this.projectDir.resolve("user-config.old");

        //if the entity-config directory exists, we'll copy it to the src/main/entity-config
        upgradeProjectDir(entityConfigDir, newEntityConfigDir, oldEntityConfigDir);

        //if the hub-internal-config directory exists, we'll copy it to the src/main/hub-internal-config
        upgradeProjectDir(hubInternalConfigDir, newHubInternalConfigDir, oldHubInternalConfigDir);

        //if the user-config directory exists, we'll copy it to src/main/ml-config and rename this folder.old
        upgradeProjectDir(userConfigDir, mlConfigDir, oldUserConfigDir);

    }

    private void upgradeProjectDir(Path sourceDir, Path destDir, Path renamedSourceDir) throws IOException {
        if (Files.exists(sourceDir)) {
            FileUtils.copyDirectory(sourceDir.toFile(), destDir.toFile(), false);
           // Files.copy(sourceDir, destDir, StandardCopyOption.REPLACE_EXISTING);
            FileUtils.moveDirectory(sourceDir.toFile(), renamedSourceDir.toFile());
        }
    }
}
