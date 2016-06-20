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
        this.configDir = Paths.get(this.projectDirStr, "config");
        this.pluginsDir = Paths.get(this.projectDirStr, "plugins");

        customTokens.put("%%ML_HOST%%", hubConfig.host);
        customTokens.put("%%STAGING_SERVER_NAME%%", hubConfig.stagingHttpName);
        customTokens.put("%%STAGING_SERVER_PORT%%", hubConfig.stagingPort.toString());
        customTokens.put("%%STAGING_DB_NAME%%", hubConfig.stagingDbName);
        customTokens.put("%%STAGING_FORESTS_PER_HOST%%", hubConfig.stagingForestsPerHost.toString());

        customTokens.put("%%FINAL_SERVER_NAME%%", hubConfig.finalHttpName);
        customTokens.put("%%FINAL_SERVER_PORT%%", hubConfig.finalPort.toString());
        customTokens.put("%%FINAL_DB_NAME%%", hubConfig.finalDbName);
        customTokens.put("%%FINAL_FORESTS_PER_HOST%%", hubConfig.finalForestsPerHost.toString());

        customTokens.put("%%TRACE_SERVER_NAME%%", hubConfig.tracingHttpName);
        customTokens.put("%%TRACE_SERVER_PORT%%", hubConfig.tracePort.toString());
        customTokens.put("%%TRACE_DB_NAME%%", hubConfig.tracingDbName);
        customTokens.put("%%TRACE_FORESTS_PER_HOST%%", hubConfig.tracingForestsPerHost.toString());

        customTokens.put("%%MODULES_DB_NAME%%", hubConfig.modulesDbName);
    }

    public void init() {
        try {
            this.pluginsDir.toFile().mkdirs();

            Path serversDir = configDir.resolve("servers");
            serversDir.toFile().mkdirs();
            writeResourceFile("ml-config/servers/staging-server.json", serversDir.resolve("staging-server.json"));
            writeResourceFile("ml-config/servers/final-server.json", serversDir.resolve("final-server.json"));
            writeResourceFile("ml-config/servers/trace-server.json", serversDir.resolve("trace-server.json"));

            Path databasesDir = configDir.resolve("databases");
            databasesDir.toFile().mkdirs();
            writeResourceFile("ml-config/databases/staging-database.json", databasesDir.resolve("staging-database.json"));
            writeResourceFile("ml-config/databases/final-database.json", databasesDir.resolve("final-database.json"));
            writeResourceFile("ml-config/databases/trace-database.json", databasesDir.resolve("trace-database.json"));
            writeResourceFile("ml-config/databases/modules-database.json", databasesDir.resolve("modules-database.json"));
            writeResourceFile("ml-config/databases/schemas-database.json", databasesDir.resolve("schemas-database.json"));
            writeResourceFile("ml-config/databases/triggers-database.json", databasesDir.resolve("triggers-database.json"));

            writeResourceFile("scaffolding/build_gradle", projectDir.resolve("build.gradle"));
            writeResourceFile(Paths.get("scaffolding", "gradle_properties"), projectDir.resolve("gradle.properties"));
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

    private void writeResourceFile(Path file, Path dest) throws IOException {
        if (!dest.toFile().exists()) {
            InputStream inputStream = HubProject.class.getClassLoader().getResourceAsStream(file.toString());

            String fileContents = IOUtils.toString(inputStream);
            for (String key : customTokens.keySet()) {
                fileContents = fileContents.replace(key, customTokens.get(key));
            }
            FileWriter writer = new FileWriter(dest.toFile());
            writer.write(fileContents);
            writer.close();
        }
    }
}
