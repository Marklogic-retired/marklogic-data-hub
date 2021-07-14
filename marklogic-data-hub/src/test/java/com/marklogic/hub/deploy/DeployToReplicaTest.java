package com.marklogic.hub.deploy;

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
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.dhs.DhsDeployer;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.impl.DataHubImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class DeployToReplicaTest extends AbstractHubCoreTest {

    @BeforeEach
    void beforeEach() {
        installReferenceModelProject();

        // Run a flow to generate a doc in jobs database
        runSuccessfulFlow(new FlowInputs("echoFlow"));
    }

    @AfterEach
    void afterEach() {
        // Deploying will remove the test-specific database settings, so gotta restore them
        applyDatabasePropertiesForTests(getHubConfig());
    }

    @Test
    void deployToReplicaOnPremise() {
        verifyCommandListForDeployingToReplicaOnPremise();

        runAsAdmin();
        final Map<String, Long> initialLatestTimestamps = getLatestDocumentTimestampForEachDatabase();

        // For on-premise, it's reasonable to deploy as an admin user
        new DataHubImpl(getHubConfig()).deployToReplicaClusterOnPremise();

        verifyLatestTimestampsAreUnchanged(initialLatestTimestamps);
    }

    @Test
    void deployToReplicaInDHS() {
        runAsAdmin();
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
