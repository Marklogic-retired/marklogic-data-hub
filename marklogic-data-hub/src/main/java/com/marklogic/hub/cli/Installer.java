package com.marklogic.hub.cli;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.resource.security.UserManager;
import com.marklogic.rest.util.ResourcesFragment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * Intended for installing and upgrading DHF via a command-line interface. It is expected to be run as the main class
 * of the jar produced by the "bootJar" Gradle task.
 * <p>
 * To mimic how DHF is installed locally, this installer will first initialize a DHF project in the directory in which
 * the installer is run. Properties will then be read from the gradle.properties and gradle-local.properties files that
 * are generated.
 * <p>
 * Because those properties are not intended to suffice for installation - specifically, mlUsername and mlPassword are
 * not expected to be set - a client can override any DHF property via JVM props when running the installer. For example:
 * <p>
 * {@code
 * java -DmlUsername=someuser -PmlPassword=somepassword -jar marklogic-data-hub-(version).jar
 * }
 */
public class Installer {

    private static ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(Installer.class);

    private DataHub dataHub;
    private HubConfigImpl hubConfig;

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(ApplicationConfig.class);

        String projectPath = ".";
        if (args.length > 0) {
            projectPath = args[0];
        }

        new Installer(
            context.getBean(DataHub.class),
            context.getBean(HubConfigImpl.class)
        ).install(new File(projectPath));
    }


    public Installer(DataHub dataHub, HubConfigImpl hubConfig) {
        this.dataHub = dataHub;
        this.hubConfig = hubConfig;
    }

    public void install(File projectDir) {
        logger.info("Installing DHF version " + hubConfig.getJarVersion());

        initializeProject(projectDir);
        dataHub.install();
    }

    /**
     * The intended use case is that an executable DHF jar can be run from any directory, which means we need to first
     * initialize a DHF project (specifically, generating the gradle.properties file) and then refresh HubConfig based
     * on those properties and anything a client passed in via JVM props.
     *
     * @param projectDir
     */
    protected void initializeProject(File projectDir) {
        logger.info("Initializing DHF into project directory: " + projectDir);

        hubConfig.createProject(projectDir.getAbsolutePath());
        hubConfig.initHubProject();

        // Passing in "true" causes properties to be read from the current directory
        // Include System properties so that a client can override e.g. mlHost/mlUsername/mlPassword via JVM props
        hubConfig.refreshProject(System.getProperties(), true);

        removeEmptyRangeIndexArrayFromFinalDatabaseFile(projectDir);
        removePasswordsFromUserFiles(projectDir, hubConfig);
    }

    /**
     * This is needed until DHFPROD-2547 is fixed. The empty range index array will remove any user-defined range
     * indexes, which will also cause a reindex.
     */
    protected void removeEmptyRangeIndexArrayFromFinalDatabaseFile(File projectDir) {
        final File file = new File(projectDir, "src/main/ml-config/databases/final-database.json");
        if (file.exists()) {
            ObjectNode node = readJsonFromFile(file);
            if (node.has("range-element-index")) {
                JsonNode json = node.get("range-element-index");
                if (json instanceof ArrayNode) {
                    ArrayNode array = (ArrayNode) json;
                    if (array.size() == 0) {
                        logger.info("Removing empty range-element-index array from " + file + " so any existing " +
                            "user-defined range indexes are not lost, nor is an unnecessary reindex caused.");
                        node.remove("range-element-index");
                        writeJsonToFile(node, file);
                    }
                }
            }
        }
    }

    /**
     * If a user already exists, we don't want to overwrite its password.
     */
    protected void removePasswordsFromUserFiles(File projectDir, HubConfigImpl hubConfig) {
        ResourcesFragment existingUsers = new UserManager(hubConfig.getManageClient()).getAsXml();
        File dir = new File(projectDir, "src/main/hub-internal-config");
        if (dir.exists()) {
            final Map<String, String> tokens = hubConfig.getAppConfig().getCustomTokens();

            File usersDir = new ConfigDir(dir).getUsersDir();
            if (usersDir.exists()) {
                for (File userFile : usersDir.listFiles()) {
                    ObjectNode user = readJsonFromFile(userFile);
                    String username = user.get("user-name").asText();
                    if (tokens != null && tokens.containsKey(username)) {
                        username = tokens.get(username);
                    }
                    if (existingUsers.resourceExists(username) && user.has("password")) {
                        logger.info("Removing password from " + userFile + " because the user already exists");
                        user.remove("password");
                        writeJsonToFile(user, userFile);
                    }
                }
            }
        }
    }

    protected ObjectNode readJsonFromFile(File file) {
        try {
            return (ObjectNode) objectMapper.readTree(file);
        } catch (IOException e) {
            throw new RuntimeException("Unable to read " + file + ", cause: " + e.getMessage(), e);
        }
    }

    protected void writeJsonToFile(ObjectNode node, File file) {
        try {
            objectMapper.writeValue(file, node);
        } catch (IOException e) {
            throw new RuntimeException("Unable to write " + file + ", cause: " + e.getMessage(), e);
        }
    }
}
