package com.marklogic.hub;

import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HubProject {

    static final private Logger LOGGER = LoggerFactory.getLogger(HubProject.class);

    private String projectDirStr;
    private Path projectDir;
    private Path configDir;
    private Path pluginsDir;
    private HubConfig hubConfig;

    private Map<String, String> customTokens = new HashMap<>();

    public HubProject(HubConfig config) {
        this.hubConfig = config;
        this.projectDirStr = config.projectDir;
        this.projectDir = Paths.get(this.projectDirStr);
        this.configDir = Paths.get(this.projectDirStr, "marklogic-config");
        this.pluginsDir = Paths.get(this.projectDirStr, "plugins");

        customTokens.put("%%mlHost%%", hubConfig.host);
        customTokens.put("%%mlAppName%%", hubConfig.name);
        customTokens.put("%%mlStagingAppserverName%%", hubConfig.stagingHttpName);
        customTokens.put("%%mlStagingPort%%", hubConfig.stagingPort.toString());
        customTokens.put("%%mlStagingDbName%%", hubConfig.stagingDbName);
        customTokens.put("%%mlStagingForestsPerHost%%", hubConfig.stagingForestsPerHost.toString());

        customTokens.put("%%mlFinalAppserverName%%", hubConfig.finalHttpName);
        customTokens.put("%%mlFinalPort%%", hubConfig.finalPort.toString());
        customTokens.put("%%mlFinalDbName%%", hubConfig.finalDbName);
        customTokens.put("%%mlFinalForestsPerHost%%", hubConfig.finalForestsPerHost.toString());

        customTokens.put("%%mlTraceAppserverName%%", hubConfig.traceHttpName);
        customTokens.put("%%mlTracePort%%", hubConfig.tracePort.toString());
        customTokens.put("%%mlTraceDbName%%", hubConfig.traceDbName);
        customTokens.put("%%mlTraceForestsPerHost%%", hubConfig.traceForestsPerHost.toString());

        customTokens.put("%%mlJobAppserverName%%", hubConfig.jobHttpName);
        customTokens.put("%%mlJobPort%%", hubConfig.jobPort.toString());
        customTokens.put("%%mlJobDbName%%", hubConfig.jobDbName);
        customTokens.put("%%mlJobForestsPerHost%%", hubConfig.jobForestsPerHost.toString());

        customTokens.put("%%mlModulesDbName%%", hubConfig.modulesDbName);
        customTokens.put("%%mlTriggersDbName%%", hubConfig.triggersDbName);
        customTokens.put("%%mlSchemasDbName%%", hubConfig.schemasDbName);
    }

    public void init() {
        try {
            LOGGER.error("PLUGINS DIR: " + pluginsDir.toString());
            this.pluginsDir.toFile().mkdirs();

            Path serversDir = configDir.resolve("servers");
            serversDir.toFile().mkdirs();
            writeResourceFile("ml-config/servers/staging-server.json", serversDir.resolve("staging-server.json"));
            writeResourceFile("ml-config/servers/final-server.json", serversDir.resolve("final-server.json"));
            writeResourceFile("ml-config/servers/trace-server.json", serversDir.resolve("trace-server.json"));
            writeResourceFile("ml-config/servers/job-server.json", serversDir.resolve("job-server.json"));

            Path databasesDir = configDir.resolve("databases");
            databasesDir.toFile().mkdirs();
            writeResourceFile("ml-config/databases/staging-database.json", databasesDir.resolve("staging-database.json"));
            writeResourceFile("ml-config/databases/final-database.json", databasesDir.resolve("final-database.json"));
            writeResourceFile("ml-config/databases/trace-database.json", databasesDir.resolve("trace-database.json"));
            writeResourceFile("ml-config/databases/job-database.json", databasesDir.resolve("job-database.json"));
            writeResourceFile("ml-config/databases/modules-database.json", databasesDir.resolve("modules-database.json"));
            writeResourceFile("ml-config/databases/schemas-database.json", databasesDir.resolve("schemas-database.json"));
            writeResourceFile("ml-config/databases/triggers-database.json", databasesDir.resolve("triggers-database.json"));

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
            LOGGER.info("Getting file: " + srcFile);
            InputStream inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);
            Files.copy(inputStream, dstFile);
        }
    }

    private void writeResourceFileWithReplace(String srcFile, Path dstFile) throws IOException {
        if (!dstFile.toFile().exists()) {
            LOGGER.info("Getting file with Replace: " + srcFile);
            InputStream inputStream = HubProject.class.getClassLoader().getResourceAsStream(srcFile);

            String fileContents = IOUtils.toString(inputStream);
            for (String key : customTokens.keySet()) {
                fileContents = fileContents.replace(key, customTokens.get(key));
            }
            FileWriter writer = new FileWriter(dstFile.toFile());
            writer.write(fileContents);
            writer.close();
        }
    }
}
