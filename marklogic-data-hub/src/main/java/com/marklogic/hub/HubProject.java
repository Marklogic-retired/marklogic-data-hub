package com.marklogic.hub;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.PosixFilePermission;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Class for creating a hub Project
 */
class HubProject {

    private String projectDirStr;
    private Path projectDir;
    private Path pluginsDir;
    private HubConfig hubConfig;

    private Map<String, String> customTokens;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public HubProject(HubConfig config) {
        this.hubConfig = config;
        this.projectDirStr = config.projectDir;
        this.projectDir = Paths.get(this.projectDirStr);
        this.pluginsDir = Paths.get(this.projectDirStr, "plugins");
        customTokens = hubConfig.getCustomTokens(new HashMap<>());
    }

    /**
     * Initializes a directory as a hub project directory.
     * This means putting certain files and folders in place.
     */
    public void init() {
        try {
            logger.error("PLUGINS DIR: " + pluginsDir.toString());
            this.pluginsDir.toFile().mkdirs();

            Path serversDir = hubConfig.getHubServersDir();
            serversDir.toFile().mkdirs();
            writeResourceFile("ml-config/servers/staging-server.json", serversDir.resolve("staging-server.json"), true);
            writeResourceFile("ml-config/servers/final-server.json", serversDir.resolve("final-server.json"), true);
            writeResourceFile("ml-config/servers/trace-server.json", serversDir.resolve("trace-server.json"), true);
            writeResourceFile("ml-config/servers/job-server.json", serversDir.resolve("job-server.json"), true);

            Path databasesDir = hubConfig.getHubDatabaseDir();
            databasesDir.toFile().mkdirs();
            writeResourceFile("ml-config/databases/staging-database.json", databasesDir.resolve("staging-database.json"), true);
            writeResourceFile("ml-config/databases/final-database.json", databasesDir.resolve("final-database.json"), true);
            writeResourceFile("ml-config/databases/trace-database.json", databasesDir.resolve("trace-database.json"), true);
            writeResourceFile("ml-config/databases/job-database.json", databasesDir.resolve("job-database.json"), true);
            writeResourceFile("ml-config/databases/modules-database.json", databasesDir.resolve("modules-database.json"), true);
            writeResourceFile("ml-config/databases/schemas-database.json", databasesDir.resolve("schemas-database.json"), true);
            writeResourceFile("ml-config/databases/triggers-database.json", databasesDir.resolve("triggers-database.json"), true);

            Path securityDir = hubConfig.getHubSecurityDir();
            Path rolesDir = securityDir.resolve("roles");
            Path usersDir = securityDir.resolve("users");

            rolesDir.toFile().mkdirs();
            usersDir.toFile().mkdirs();

            writeResourceFile("ml-config/security/roles/data-hub-role.json", rolesDir.resolve("data-hub-role.json"), true);
            writeResourceFile("ml-config/security/users/data-hub-user.json", usersDir.resolve("data-hub-user.json"), true);

            Path mimetypesDir = hubConfig.getHubMimetypesDir();
            mimetypesDir.toFile().mkdirs();
            writeResourceFile("ml-config/mimetypes/woff.json", mimetypesDir.resolve("woff.json"), true);
            writeResourceFile("ml-config/mimetypes/woff2.json", mimetypesDir.resolve("woff2.json"), true);

            hubConfig.getUserServersDir().toFile().mkdirs();
            hubConfig.getUserDatabaseDir().toFile().mkdirs();

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
            writeResourceFileWithReplace("scaffolding/gradle_properties", projectDir.resolve("gradle.properties"));
            writeResourceFile("scaffolding/gradle-local_properties", projectDir.resolve("gradle-local.properties"));
        }
        catch(IOException e) {
            throw new RuntimeException(e);
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

    private void writeResourceFile(String srcFile, Path dstFile) throws IOException {
        writeResourceFile(srcFile, dstFile, false);
    }

    private void writeResourceFile(String srcFile, Path dstFile, boolean overwrite) throws IOException {
        if (overwrite || !dstFile.toFile().exists()) {
            logger.info("Getting file: " + srcFile);
            InputStream inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);
            Files.copy(inputStream, dstFile, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private void writeResourceFileWithReplace(String srcFile, Path dstFile) throws IOException {
        writeResourceFileWithReplace(srcFile, dstFile, false);
    }

    private void writeResourceFileWithReplace(String srcFile, Path dstFile, boolean overwrite) throws IOException {
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
}
