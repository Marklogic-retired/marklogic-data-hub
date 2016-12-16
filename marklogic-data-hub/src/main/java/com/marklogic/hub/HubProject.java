package com.marklogic.hub;

import com.marklogic.client.helper.LoggingObject;
import org.apache.commons.io.IOUtils;

import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * Class for creating a hub Project
 */
class HubProject extends LoggingObject {

    private String projectDirStr;
    private Path projectDir;
    private Path pluginsDir;
    private HubConfig hubConfig;

    private Map<String, String> customTokens = new HashMap<>();

    public HubProject(HubConfig config) {
        this.hubConfig = config;
        this.projectDirStr = config.projectDir;
        this.projectDir = Paths.get(this.projectDirStr);
        this.pluginsDir = Paths.get(this.projectDirStr, "plugins");

        customTokens.put("%%mlHost%%", hubConfig.host);
        customTokens.put("%%mlAppName%%", hubConfig.name);
        customTokens.put("%%mlAdminUsername%%", hubConfig.username);
        customTokens.put("%%mlStagingAppserverName%%", hubConfig.stagingHttpName);
        customTokens.put("%%mlStagingPort%%", hubConfig.stagingPort.toString());
        customTokens.put("%%mlStagingDbName%%", hubConfig.stagingDbName);
        customTokens.put("%%mlStagingForestsPerHost%%", hubConfig.stagingForestsPerHost.toString());
        customTokens.put("%%mlStagingAuth%%", hubConfig.stagingAuthMethod);

        customTokens.put("%%mlFinalAppserverName%%", hubConfig.finalHttpName);
        customTokens.put("%%mlFinalPort%%", hubConfig.finalPort.toString());
        customTokens.put("%%mlFinalDbName%%", hubConfig.finalDbName);
        customTokens.put("%%mlFinalForestsPerHost%%", hubConfig.finalForestsPerHost.toString());
        customTokens.put("%%mlFinalAuth%%", hubConfig.finalAuthMethod);

        customTokens.put("%%mlTraceAppserverName%%", hubConfig.traceHttpName);
        customTokens.put("%%mlTracePort%%", hubConfig.tracePort.toString());
        customTokens.put("%%mlTraceDbName%%", hubConfig.traceDbName);
        customTokens.put("%%mlTraceForestsPerHost%%", hubConfig.traceForestsPerHost.toString());
        customTokens.put("%%mlTraceAuth%%", hubConfig.traceAuthMethod);

        customTokens.put("%%mlJobAppserverName%%", hubConfig.jobHttpName);
        customTokens.put("%%mlJobPort%%", hubConfig.jobPort.toString());
        customTokens.put("%%mlJobDbName%%", hubConfig.jobDbName);
        customTokens.put("%%mlJobForestsPerHost%%", hubConfig.jobForestsPerHost.toString());
        customTokens.put("%%mlJobAuth%%", hubConfig.jobAuthMethod);

        customTokens.put("%%mlModulesDbName%%", hubConfig.modulesDbName);
        customTokens.put("%%mlTriggersDbName%%", hubConfig.triggersDbName);
        customTokens.put("%%mlSchemasDbName%%", hubConfig.schemasDbName);

        customTokens.put("%%mlHubUserName%%", hubConfig.hubUserName);
        customTokens.put("%%mlHubUserPassword%%", hubConfig.hubUserPassword);
        customTokens.put("%%mlHubUserRole%%", hubConfig.hubUserRole);
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
            writeResourceFile("ml-config/servers/staging-server.json", serversDir.resolve("staging-server.json"));
            writeResourceFile("ml-config/servers/final-server.json", serversDir.resolve("final-server.json"));
            writeResourceFile("ml-config/servers/trace-server.json", serversDir.resolve("trace-server.json"));
            writeResourceFile("ml-config/servers/job-server.json", serversDir.resolve("job-server.json"));

            Path databasesDir = hubConfig.getHubDatabaseDir();
            databasesDir.toFile().mkdirs();
            writeResourceFile("ml-config/databases/staging-database.json", databasesDir.resolve("staging-database.json"));
            writeResourceFile("ml-config/databases/final-database.json", databasesDir.resolve("final-database.json"));
            writeResourceFile("ml-config/databases/trace-database.json", databasesDir.resolve("trace-database.json"));
            writeResourceFile("ml-config/databases/job-database.json", databasesDir.resolve("job-database.json"));
            writeResourceFile("ml-config/databases/modules-database.json", databasesDir.resolve("modules-database.json"));
            writeResourceFile("ml-config/databases/schemas-database.json", databasesDir.resolve("schemas-database.json"));
            writeResourceFile("ml-config/databases/triggers-database.json", databasesDir.resolve("triggers-database.json"));

            Path securityDir = hubConfig.getHubSecurityDir();
            Path rolesDir = securityDir.resolve("roles");
            Path usersDir = securityDir.resolve("users");

            rolesDir.toFile().mkdirs();
            usersDir.toFile().mkdirs();

            writeResourceFileWithReplace("ml-config/security/roles/data-hub-user.json", rolesDir.resolve("data-hub-user.json"));
            writeResourceFileWithReplace("ml-config/security/users/data-hub-user.json", usersDir.resolve("data-hub-user.json"));

            hubConfig.getUserServersDir().toFile().mkdirs();
            hubConfig.getUserDatabaseDir().toFile().mkdirs();

            writeResourceFile("scaffolding/build_gradle", projectDir.resolve("build.gradle"));
            writeResourceFileWithReplace("scaffolding/gradle_properties", projectDir.resolve("gradle.properties"));
            writeResourceFile("scaffolding/gradle-local_properties", projectDir.resolve("gradle-local.properties"));
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void writeResourceFile(String srcFile, Path dstFile) throws IOException {
        if (!dstFile.toFile().exists()) {
            logger.info("Getting file: " + srcFile);
            InputStream inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);
            Files.copy(inputStream, dstFile);
        }
    }

    private void writeResourceFileWithReplace(String srcFile, Path dstFile) throws IOException {
        if (!dstFile.toFile().exists()) {
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
