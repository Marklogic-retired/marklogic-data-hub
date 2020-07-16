package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.ApplyTransformListener;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.QueryBatcher;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.MappingService;
import com.marklogic.hub.impl.Versions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class GenerateFunctionMetadataCommand extends AbstractCommand {

    @Autowired
    private HubConfig hubConfig;

    private boolean isCompatibleWithES;

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

    /**
     * @param hubConfig
     * @param isCompatibleWithES if it's known that the version of ML supports mapping based on Entity Services, then
     *                           can set this to true
     */
    public GenerateFunctionMetadataCommand(HubConfig hubConfig, boolean isCompatibleWithES) {
        this(hubConfig);
        this.isCompatibleWithES = isCompatibleWithES;
    }

    @Override
    public void execute(CommandContext context) {
        generateFunctionMetadata();
    }

    public void generateFunctionMetadata() {
        if (isCompatibleWithES || new Versions(hubConfig).isVersionCompatibleWithES()) {
            DatabaseClient modulesClient = hubConfig.newStagingClient(hubConfig.getDbName(DatabaseKind.MODULES));
            DataMovementManager dataMovementManager = modulesClient.newDataMovementManager();
            final List<Throwable> caughtExceptions = new ArrayList<>();

            StructuredQueryBuilder sb = modulesClient.newQueryManager().newStructuredQueryBuilder();
            ServerTransform serverTransform = new ServerTransform("mlGenerateFunctionMetadata");
            ApplyTransformListener transformListener = new ApplyTransformListener()
                .withTransform(serverTransform)
                .withApplyResult(ApplyTransformListener.ApplyResult.IGNORE)
                .onFailure((batch, throwable) -> {
                    logger.error("Caught error while generating function metadata: " + throwable.getMessage());
                    caughtExceptions.add(throwable);
                });

            // Query for uris "/data-hub/5/mapping-functions/" and "/custom-modules/mapping-functions/" which are reserved for mapping functions
            QueryBatcher queryBatcher = dataMovementManager.newQueryBatcher(
                new StructuredQueryBuilder().or(sb.directory(true, "/data-hub/5/mapping-functions/"), sb.directory(true, "/custom-modules/mapping-functions/")))
                .withBatchSize(1)
                .withThreadCount(4)
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
        } else {
            logger.info("Not generating function metadata for mapping libraries, as it's not supported by this version of MarkLogic");
        }
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }
}
