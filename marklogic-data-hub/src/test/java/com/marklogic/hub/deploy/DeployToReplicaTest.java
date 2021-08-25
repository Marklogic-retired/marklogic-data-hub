package com.marklogic.hub.deploy;

import com.marklogic.appdeployer.CmaConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.alert.DeployAlertActionsCommand;
import com.marklogic.appdeployer.command.alert.DeployAlertRulesCommand;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.appdeployer.command.clusters.ModifyLocalClusterCommand;
import com.marklogic.appdeployer.command.cma.DeployConfigurationsCommand;
import com.marklogic.appdeployer.command.cpf.DeployCpfConfigsCommand;
import com.marklogic.appdeployer.command.cpf.DeployDefaultPipelinesCommand;
import com.marklogic.appdeployer.command.cpf.DeployDomainsCommand;
import com.marklogic.appdeployer.command.cpf.DeployPipelinesCommand;
import com.marklogic.appdeployer.command.data.LoadDataCommand;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.flexrep.DeployConfigsCommand;
import com.marklogic.appdeployer.command.flexrep.DeployFlexrepCommand;
import com.marklogic.appdeployer.command.flexrep.DeployTargetsCommand;
import com.marklogic.appdeployer.command.forests.ConfigureForestReplicasCommand;
import com.marklogic.appdeployer.command.forests.DeployCustomForestsCommand;
import com.marklogic.appdeployer.command.groups.DeployGroupsCommand;
import com.marklogic.appdeployer.command.hosts.AssignHostsToGroupsCommand;
import com.marklogic.appdeployer.command.mimetypes.DeployMimetypesCommand;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.appdeployer.command.plugins.InstallPluginsCommand;
import com.marklogic.appdeployer.command.rebalancer.DeployPartitionQueriesCommand;
import com.marklogic.appdeployer.command.rebalancer.DeployPartitionsCommand;
import com.marklogic.appdeployer.command.schemas.LoadSchemasCommand;
import com.marklogic.appdeployer.command.security.*;
import com.marklogic.appdeployer.command.tasks.DeployScheduledTasksCommand;
import com.marklogic.appdeployer.command.taskservers.UpdateTaskServerCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalAxesCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalCollectionsCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalCollectionsLSQTCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.appdeployer.command.viewschemas.DeployViewSchemasCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.dhs.DhsDeployer;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

public class DeployToReplicaTest extends AbstractHubCoreTest {

    String initialHost;

    @BeforeEach
    void beforeEach() {
        assumeTrue(isVersionCompatibleWith520Roles());
        runAsAdmin();

        initialHost = getHubConfig().getHost();
        logger.info("Saving initialHost: " + initialHost);
        logger.info("Initial AppConfig host: " + getHubConfig().getAppConfig().getHost());
        logger.info("Initial ManageClient host: " + getHubConfig().getManageClient().getManageConfig().getHost());

        installProjectInFolder("test-projects/simple-custom-step");

        // Run a flow to generate a doc in jobs database
        runSuccessfulFlow(new FlowInputs("simpleCustomStepFlow"));
    }

    @AfterEach
    void afterEach() {
        assumeTrue(isVersionCompatibleWith520Roles());

        // Setting this back to the original value; this test is failing when the suite runs against multiple hosts,
        // as host is getting set back to "localhost"
        getHubConfig().setHost(initialHost);

        // Deploying will remove the test-specific database settings, so gotta restore them
        applyDatabasePropertiesForTests(getHubConfig());
    }

    @Test
    void deployToReplicaOnPremise() {
        assumeTrue(isVersionCompatibleWith520Roles());

        verifyCommandListForDeployingToReplicaOnPremise();

        final Map<String, Long> initialLatestTimestamps = getLatestDocumentTimestampForEachDatabase();

        // This is failing intermittently with the following error:
        // I/O error on POST request for "http://localhost:8002/manage/v3": Connect to localhost:8002 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused
        // This occurs at the beginning of the deployment when a check is made to see if /manage/v3 exists
        // The problem is 1 of 2 things - either "localhost" is wrong, or it's correct but ML is restarting somehow
        // So trying to prevent either of those from being a problem here
        HubConfigImpl hubConfig = getHubConfig();
        hubConfig.setHost(initialHost);
        hubConfig.getAdminManager().waitForRestart();

        logger.info("HubConfig host: " + hubConfig.getHost());
        logger.info("AppConfig host: " + hubConfig.getAppConfig().getHost());
        logger.info("ManageClient host: " + hubConfig.getManageClient().getManageConfig().getHost());

        // For on-premise, it's reasonable to deploy as an admin user

        // Disabling CMA usage to see if we avoid mysterious error where "host" is "localhost", regardless of what
        // initialHost is above
        hubConfig.getAppConfig().setCmaConfig(new CmaConfig(false));

        DataHubImpl dataHub = new DataHubImpl(hubConfig);
        logger.info("HubConfig host: " + hubConfig.getHost());
        logger.info("AppConfig host: " + hubConfig.getAppConfig().getHost());
        logger.info("ManageClient host: " + hubConfig.getManageClient().getManageConfig().getHost());

        List<Command> commands = dataHub.buildCommandsForDeployingToReplica();
        logger.info("HubConfig host: " + hubConfig.getHost());
        logger.info("AppConfig host: " + hubConfig.getAppConfig().getHost());
        logger.info("ManageClient host: " + hubConfig.getManageClient().getManageConfig().getHost());

        new SimpleAppDeployer(commands).deploy(hubConfig.getAppConfig());

        verifyLatestTimestampsAreUnchanged(initialLatestTimestamps);
    }

    @Test
    void deployToReplicaInDHS() {
        assumeTrue(isVersionCompatibleWith520Roles());

        final Map<String, Long> initialLatestTimestamps = getLatestDocumentTimestampForEachDatabase();

        runAsTestUserWithRoles("data-hub-developer", "data-hub-security-admin");
        new DhsDeployer().deployToReplica(getHubConfig());

        verifyLatestTimestampsAreUnchanged(initialLatestTimestamps);
    }

    private void verifyLatestTimestampsAreUnchanged(Map<String, Long> initialLatestTimestamps) {
        runAsAdmin();
        final Map<String, Long> postDeployLatestTimestamps = getLatestDocumentTimestampForEachDatabase();

        initialLatestTimestamps.keySet().forEach(dbName -> {
            assertEquals(initialLatestTimestamps.get(dbName), postDeployLatestTimestamps.get(dbName),
                "Expected the latest document timestamp to be the same as it was pre-deployment for database: " + dbName +
                    "; this confirms that the deployment process did not create/modify any documents");
        });
    }

    /**
     * By getting the latest document timestamp for a particular database, we can verify that after deploying, no
     * document was created/modified (deletion isn't a concern because none of the deployment commands delete anything,
     * they just add/modify stuff).
     *
     * @return
     */
    private Map<String, Long> getLatestDocumentTimestampForEachDatabase() {
        DatabaseClient client = getHubClient().getFinalClient();
        Map<String, Long> timestamps = new HashMap<>();
        for (DatabaseKind dbKind : DatabaseKind.values()) {
            final String dbName = getHubConfig().getDbName(dbKind);
            String script = format("xdmp.invokeFunction(function() { let timestamp = 0;\n" +
                "for (var uri of cts.uris()) {\n" +
                "  let ts = xdmp.documentTimestamp(uri);\n" +
                "  if (ts > timestamp) { timestamp = ts; }\n" +
                "}\n" +
                "return timestamp}, {database: xdmp.database('%s')})", dbName);
            timestamps.put(dbName, Long.parseLong(client.newServerEval().javascript(script).evalAs(String.class)));
        }
        return timestamps;
    }

    /**
     * This is not guaranteed to be a complete list, as commands may be added in the future and not checked here. So the
     * intent is to do a sanity check of what's included and what's not included.
     */
    private void verifyCommandListForDeployingToReplicaOnPremise() {
        List<Command> commands = new DataHubImpl(getHubConfig()).buildCommandsForDeployingToReplica();
        List<Class> commandClasses = commands.stream().map(command -> command.getClass()).collect(Collectors.toList());
        Stream.of(
            DeployGroupsCommand.class,
            DeployConfigurationsCommand.class,
            DeployCustomForestsCommand.class,
            CreateGranularPrivilegesCommand.class,
            DeployRolesCommand.class,
            DeployUsersCommand.class,
            DeployAmpsCommand.class,
            DeployCertificateTemplatesCommand.class,
            DeployCertificateAuthoritiesCommand.class,
            InsertCertificateHostsTemplateCommand.class,
            DeployExternalSecurityCommand.class,
            DeployPrivilegesCommand.class,
            DeployPrivilegeRolesCommand.class,
            DeployProtectedCollectionsCommand.class,
            DeployProtectedPathsCommand.class,
            DeployQueryRolesetsCommand.class,
            DeployOtherServersCommand.class,
            DeployOtherDatabasesCommand.class,
            DeployDatabaseFieldCommand.class,
            AssignHostsToGroupsCommand.class,
            ModifyLocalClusterCommand.class,
            DeployPartitionsCommand.class,
            DeployPartitionQueriesCommand.class,
            InstallPluginsCommand.class,
            ConfigureForestReplicasCommand.class,
            DeployMimetypesCommand.class,
            DeployScheduledTasksCommand.class,
            UpdateTaskServerCommand.class
        ).forEach(classType -> assertTrue(commandClasses.contains(classType), "Did not find expected class type: " + classType));

        Stream.of(
            LoadDataCommand.class,
            LoadModulesCommand.class,
            LoadHubModulesCommand.class,
            LoadUserModulesCommand.class,
            LoadUserArtifactsCommand.class,
            LoadHubArtifactsCommand.class,
            GenerateFunctionMetadataCommand.class,
            FinishHubDeploymentCommand.class,
            DeployHubTriggersCommand.class,
            DeployTriggersCommand.class,
            LoadSchemasCommand.class,
            DeployAlertActionsCommand.class,
            DeployAlertActionsCommand.class,
            DeployAlertRulesCommand.class,
            DeployCpfConfigsCommand.class,
            DeployDomainsCommand.class,
            DeployPipelinesCommand.class,
            DeployDefaultPipelinesCommand.class,
            DeployConfigsCommand.class,
            DeployTargetsCommand.class,
            DeployFlexrepCommand.class,
            DeployTemporalAxesCommand.class,
            DeployTemporalCollectionsCommand.class,
            DeployTemporalCollectionsLSQTCommand.class,
            DeployViewSchemasCommand.class
        ).forEach(classType -> assertFalse(commandClasses.contains(classType), "Found unexpected class type; it should not " +
            "be included because it writes data to a database: " + classType));
    }
}
