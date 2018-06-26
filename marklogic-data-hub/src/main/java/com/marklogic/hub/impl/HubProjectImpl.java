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

import com.marklogic.hub.HubProject;
import com.marklogic.hub.util.FileUtil;
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

    public static final String ENTITY_CONFIG_DIR = "entity-config";

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

    @Override public Path getUserConfigDir() {
        return this.projectDir.resolve(USER_CONFIG_DIR);
    }

    @Override public Path getUserSecurityDir() {
        return getUserConfigDir().resolve("security");
    }

    @Override public Path getUserDatabaseDir() {
        return getUserConfigDir().resolve("databases");
    }

    @Override public Path getUserSchemasDir() {
        return getUserConfigDir().resolve("schemas");
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

        Path serversDir = getHubServersDir();
        serversDir.toFile().mkdirs();
        writeResourceFile("ml-config/servers/staging-server.json", serversDir.resolve("staging-server.json"), true);
        writeResourceFile("ml-config/servers/final-server.json", serversDir.resolve("final-server.json"), true);
        writeResourceFile("ml-config/servers/job-server.json", serversDir.resolve("job-server.json"), true);

        Path databasesDir = getHubDatabaseDir();
        databasesDir.toFile().mkdirs();
        writeResourceFile("ml-config/databases/staging-database.json", databasesDir.resolve("staging-database.json"), true);
        writeResourceFile("ml-config/databases/final-database.json", databasesDir.resolve("final-database.json"), true);
        writeResourceFile("ml-config/databases/job-database.json", databasesDir.resolve("job-database.json"), true);
        writeResourceFile("ml-config/databases/modules-database.json", databasesDir.resolve("modules-database.json"), true);
        writeResourceFile("ml-config/databases/schemas-database.json", databasesDir.resolve("schemas-database.json"), true);
        writeResourceFile("ml-config/databases/triggers-database.json", databasesDir.resolve("triggers-database.json"), true);

        Path securityDir = getHubSecurityDir();
        Path rolesDir = securityDir.resolve("roles");
        Path usersDir = securityDir.resolve("users");

        rolesDir.toFile().mkdirs();
        usersDir.toFile().mkdirs();

        writeResourceFile("ml-config/security/roles/data-hub-role.json", rolesDir.resolve("data-hub-role.json"), true);
        writeResourceFile("ml-config/security/users/data-hub-user.json", usersDir.resolve("data-hub-user.json"), true);
        writeResourceFile("ml-config/security/roles/hub-admin-role.json", rolesDir.resolve("hub-admin-role.json"), true);
        writeResourceFile("ml-config/security/users/hub-admin-user.json", usersDir.resolve("hub-admin-user.json"), true);

        getUserServersDir().toFile().mkdirs();
        getUserDatabaseDir().toFile().mkdirs();

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
}
