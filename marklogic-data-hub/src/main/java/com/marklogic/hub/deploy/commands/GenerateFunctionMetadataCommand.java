package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.MappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class GenerateFunctionMetadataCommand extends AbstractCommand {

    @Autowired
    private HubConfig hubConfig;

    private final static String DH_FUNCTION_MODULE_PATH = "/data-hub/5/mapping-functions/";
    private final static String USER_FUNCTION_MODULE_PATH = "/custom-modules/mapping-functions/";

    private boolean catchExceptionsForUserModules = false;

    // Need no-arg constructor for Spring
    public GenerateFunctionMetadataCommand() {
        super();

        // Per DHFPROD-3146, need this to run after modules are loaded. LoadUserModulesCommand is configured
        // to run after amps are deployed, so need this to run after user modules are loaded.
        setExecuteSortOrder(new LoadUserModulesCommand().getExecuteSortOrder() + 1);
    }

    public GenerateFunctionMetadataCommand(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
    }


    @Override
    public void execute(CommandContext context) {
        generateFunctionMetadata();
    }

    public void generateFunctionMetadata() {
        DatabaseClient stagingClient = hubConfig.newStagingClient(null);
        MappingService mappingService = MappingService.on(stagingClient);

        try {
            try {
                mappingService.generateMappingFunctions();
            } catch (FailedRequestException ex) {
                if (!isCatchExceptionsForUserModules()) {
                    throw ex;
                }
            }
            // Trigger regeneration of mapping transforms, as they are now out-of-date and will not work
            // Do this before throwing an exception, as the exception may only impact one mapping, and we don't
            // want none of them to work
            mappingService.generateMappingTransforms();
        } finally {
            stagingClient.release();
        }
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    public void setCatchExceptionsForUserModules(boolean catchExceptionsForUserModules) {
        this.catchExceptionsForUserModules = catchExceptionsForUserModules;
    }

    public boolean isCatchExceptionsForUserModules() {
        return catchExceptionsForUserModules;
    }
}
