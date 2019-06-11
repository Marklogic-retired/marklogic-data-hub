package com.marklogic.hub.cli;

import com.beust.jcommander.Parameters;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.hub.cli.upgrader.Upgrader;
import com.marklogic.hub.cli.upgrader.UpgraderFactory;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.resource.security.UserManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import com.marklogic.rest.util.ResourcesFragment;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@Parameters(commandDescription = "Install or upgrade DHF into a local (non-DHS) environment")
public class InstallLocalDhfCommand extends AbstractInstallerCommand {

    private ObjectMapper objectMapper = ObjectMapperFactory.getObjectMapper();

    @Override
    public void run(Options options) {
        initializeProject(options);

        logger.info("Installing DHF version " + hubConfig.getJarVersion());

        /**
         * Okay - so we check to see if the modules database exists already - can use the Manage API for that.
         * If so, we get the version of the existing install. We then pass that into an UpgraderFactory that
         * gives us back an Upgrader based on that version (the Upgrader will always be based on the version of the
         * current code.
         */
        final String existingVersion = getExistingDhfVersion();
        logger.info("VERSION: " + existingVersion);

        Upgrader upgrader = null;
        if (existingVersion != null) {
            upgrader = UpgraderFactory.newUpgrader(existingVersion);
            upgrader.beforeInstall(context, this, options);
        }

        dataHub.install();

        if (upgrader != null) {
            upgrader.afterInstall(context, this, options);
        }
    }

    /**
     * The intended use case is that an executable DHF jar can be run from any directory, which means we need to first
     * initialize a DHF project (specifically, generating the gradle.properties file) and then refresh HubConfig based
     * on those properties and anything a client passed in via JVM props.
     *
     * @param options
     */
    protected void initializeProject(Options options) {
        File projectDir = initializeProject(options, System.getProperties());
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
