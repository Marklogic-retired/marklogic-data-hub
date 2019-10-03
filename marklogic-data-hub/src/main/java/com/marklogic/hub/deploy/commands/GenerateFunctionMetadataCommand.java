package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.ApplyTransformListener;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.QueryBatcher;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.Versions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class GenerateFunctionMetadataCommand extends AbstractCommand {

    @Autowired
    private HubConfig hubConfig;
    @Autowired
    private Versions versions;
    private Throwable caughtException;
    private DatabaseClient modulesClient;

    public GenerateFunctionMetadataCommand() {
        super();
        // This command has to be executed after modules are loaded
        setExecuteSortOrder(SortOrderConstants.LOAD_MODULES + 1);
    }

    public GenerateFunctionMetadataCommand(DatabaseClient modulesClient, Versions versions) {
        this();
        this.modulesClient = modulesClient;
        this.versions = versions;
    }

    @Override
    public void execute(CommandContext context) {
        if (versions != null && versions.isVersionCompatibleWithES()) {
            if (modulesClient == null) {
                if (hubConfig == null) {
                    throw new IllegalStateException("Unable to create a DatabaseClient for the modules database because hubConfig is null");
                }
                modulesClient = hubConfig.newStagingClient(hubConfig.getDbName(DatabaseKind.MODULES));
            }

            DataMovementManager dataMovementManager = modulesClient.newDataMovementManager();

            StructuredQueryBuilder sb = modulesClient.newQueryManager().newStructuredQueryBuilder();

            // This transform needs to be the camelcase prefix instead of the ml: prefix since it is run as part of modules load.
            ServerTransform serverTransform = new ServerTransform("mlGenerateFunctionMetadata");

            ApplyTransformListener transformListener = new ApplyTransformListener()
                .withTransform(serverTransform)
                .withApplyResult(ApplyTransformListener.ApplyResult.IGNORE)
                .onFailure((batch, throwable) -> {
                    logger.error(throwable.getMessage());
                    // throw the first exception
                    if (caughtException == null) {
                        caughtException = throwable;
                    }
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

            if (caughtException != null) {
                throw new RuntimeException(caughtException);
            }
        } else {
            logger.warn("GenerateFunctionMetadataCommand is not supported on this MarkLogic server version ");
        }
    }
}
