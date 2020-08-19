package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.ApplyTransformListener;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.QueryBatcher;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.MappingService;
import com.marklogic.hub.impl.Versions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

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
        DatabaseClient modulesClient = hubConfig.newStagingClient(hubConfig.getDbName(DatabaseKind.MODULES));
        DataMovementManager dataMovementManager = modulesClient.newDataMovementManager();
        final List<Throwable> caughtExceptions = new ArrayList<>();

        ApplyTransformListener transformListener = new ApplyTransformListener()
            .withTransform(new ServerTransform("mlGenerateFunctionMetadata"))
            .withApplyResult(ApplyTransformListener.ApplyResult.IGNORE)
            .onFailure((batch, throwable) -> {
                boolean throwException = true;
                if (this.catchExceptionsForUserModules && batch.getItems().length > 0) {
                    final String moduleUri = batch.getItems()[0];
                    if (moduleUri != null && moduleUri.startsWith(USER_FUNCTION_MODULE_PATH)) {
                        logger.info("Caught error while generating function metadata for user module: " + throwable.getMessage()
                            + "; will not rethrow this as the user is expected to fix this themselves and then regenerate " +
                            "function metadata once the error is resolved.");
                        throwException = false;
                    }
                }

                if (throwException) {
                    logger.error("Caught error while generating function metadata: " + throwable.getMessage());
                    caughtExceptions.add(throwable);
                }
            });

        QueryBatcher queryBatcher = dataMovementManager.newQueryBatcher(
            modulesClient.newQueryManager().newStructuredQueryBuilder().directory(true, DH_FUNCTION_MODULE_PATH, USER_FUNCTION_MODULE_PATH)
        )
            .withBatchSize(1)
            .withThreadCount(4)
            .onUrisReady(batch -> logger.info("Processing: " + Arrays.asList(batch.getItems())))
            .onUrisReady(transformListener);

        dataMovementManager.startJob(queryBatcher);
        //Stop batcher if transform takes more than 2 minutes.
        try {
            queryBatcher.awaitCompletion(2L, TimeUnit.MINUTES);
        } catch (InterruptedException e) {
            logger.error("Loading function metadata timed out, took longer than 2 minutes");
        }
        dataMovementManager.stopJob(queryBatcher);

        // Trigger regeneration of mapping transforms, as they are now out-of-date and will not work
        // Do this before throwing an exception, as the exception may only impact one mapping, and we don't
        // want none of them to work
        DatabaseClient stagingClient = hubConfig.newStagingClient(null);
        try {
            MappingService.on(stagingClient).generateMappingTransforms();
        } finally {
            stagingClient.release();
        }

        if (!caughtExceptions.isEmpty()) {
            throw new RuntimeException(caughtExceptions.get(0));
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
