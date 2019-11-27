package com.marklogic.hub.deploy.util;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand;
import com.marklogic.hub.impl.Versions;
import org.springframework.core.io.Resource;

import java.util.Set;
import java.util.function.Consumer;

/**
 * Consumer implementation to be used with mlWatch. Expected to be invoked after one or more new/modified modules have
 * been detected and loaded.
 */
public class ModuleWatchingConsumer extends LoggingObject implements Consumer<Set<Resource>> {

    private CommandContext commandContext;
    private HubConfig hubConfig;
    private Versions versions;

    private Command generateFunctionMetadataCommand;

    public ModuleWatchingConsumer(CommandContext commandContext, Command generateFunctionMetadataCommand) {
        this.commandContext = commandContext;
        this.generateFunctionMetadataCommand = generateFunctionMetadataCommand;
    }

    /**
     * This constructor is needed for when a user invokes "hubInit" when using the DH Gradle plugin, as the plugin
     * won't be able to create a modules DatabaseClient yet as no username/password have been defined.
     *
     * @param commandContext
     * @param hubConfig
     * @param versions
     */
    public ModuleWatchingConsumer(CommandContext commandContext, HubConfig hubConfig, Versions versions) {
        this.commandContext = commandContext;
        this.hubConfig = hubConfig;
        this.versions = versions;
    }

    @Override
    public void accept(Set<Resource> resources) {
        if (generateFunctionMetadataCommand == null && hubConfig != null && versions != null) {
            generateFunctionMetadataCommand = new GenerateFunctionMetadataCommand(hubConfig.newModulesDbClient(), versions);
        }

        if (generateFunctionMetadataCommand != null && commandContext != null && shouldFunctionMetadataBeGenerated(resources)) {
            try {
                logger.info("Generating function metadata for modules containing mapping functions");
                generateFunctionMetadataCommand.execute(commandContext);
            } catch (Exception ex) {
                logger.error("Unable to generate function metadata, cause: " + ex.getMessage());
            }
        }
    }

    protected boolean shouldFunctionMetadataBeGenerated(Set<Resource> resources) {
        if (resources != null && !resources.isEmpty()) {
            for (Resource r : resources) {
                try {
                    if (r.getFile().getAbsolutePath().contains("mapping-functions")) {
                        return true;
                    }
                } catch (Exception ex) {
                    // This is not expected to ever happen, and it shouldn't cause a failure, but a log message is
                    // still warranted in case there's a real problem, as it may result in function metadata never being
                    // generated while mlWatch is running
                    logger.warn("Unable to read resource: " + r + "; cause: " + ex.getMessage());
                }
            }
        }
        return false;
    }
}
