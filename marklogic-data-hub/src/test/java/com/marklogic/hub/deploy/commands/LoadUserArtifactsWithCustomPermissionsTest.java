package com.marklogic.hub.deploy.commands;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DocumentMetadataHelper;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.stream.Stream;

public class LoadUserArtifactsWithCustomPermissionsTest extends AbstractHubCoreTest {

    @AfterEach
    void restoreDefaultPermissionsForFlowsAndStepDefinitions() {
        getHubConfig().applyDefaultPermissionPropertyValues();
        getHubConfig().setAppConfig(getHubConfig().getAppConfig());
        installHubModules();
    }

    @Test
    void customPermissionsForFlowsAndStepDefinitionsAndEntityModels() {
        HubConfigImpl hubConfig = getHubConfig();
        hubConfig.setFlowPermissions("data-hub-common,read,data-hub-common,update");
        hubConfig.setStepDefinitionPermissions("data-hub-module-reader,read,data-hub-module-writer,update");
        hubConfig.setEntityModelPermissions("data-hub-operator,read,data-hub-operator,update");

        // Must call this to force the modified property values to be added to the AppConfig customTokens map
        // In a Gradle context, this would have already happened when the Gradle properties were processed
        hubConfig.setAppConfig(hubConfig.getAppConfig());
        installHubModules();

        installReferenceModelProject();

        Stream.of(getHubClient().getStagingClient(), getHubClient().getStagingClient()).forEach(client -> {
            DocumentMetadataHelper metadata = getMetadata(client, "/flows/echoFlow.flow.json");
            metadata.assertInCollection("http://marklogic.com/data-hub/flow");
            metadata.assertHasPermission("data-hub-common", DocumentMetadataHandle.Capability.READ);
            metadata.assertHasPermission("data-hub-common", DocumentMetadataHandle.Capability.UPDATE);

            metadata = getMetadata(client, "/step-definitions/custom/echo-step/echo-step.step.json");
            metadata.assertInCollection("http://marklogic.com/data-hub/step-definition");
            metadata.assertHasPermission("data-hub-module-reader", DocumentMetadataHandle.Capability.READ);
            metadata.assertHasPermission("data-hub-module-writer", DocumentMetadataHandle.Capability.UPDATE);

            metadata = getMetadata(client, "/entities/Customer.entity.json");
            metadata.assertInCollection("http://marklogic.com/entity-services/models");
            metadata.assertHasPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ);
            metadata.assertHasPermission("data-hub-operator", DocumentMetadataHandle.Capability.UPDATE);
        });
    }

    /**
     * Verifies that if the tokens are somehow not replaced in the modules that reference them, then the modules will
     * fallback to default values that match the default values in HubConfigImpl.
     */
    @Test
    void simulateTokensNotBeingReplaced() {
        HubConfigImpl hubConfig = getHubConfig();
        hubConfig.setFlowPermissions("%%mlFlowPermissions%%");
        hubConfig.setStepDefinitionPermissions("%%mlStepDefinitionPermissions%%");
        hubConfig.setEntityModelPermissions("%%mlEntityModelPermissions%%");
        hubConfig.setAppConfig(hubConfig.getAppConfig());
        installHubModules();
        installReferenceModelProject();

        Stream.of(getHubClient().getStagingClient(), getHubClient().getStagingClient()).forEach(client -> {
            DocumentMetadataHelper metadata = getMetadata(client, "/flows/echoFlow.flow.json");
            metadata.assertHasPermission("data-hub-flow-reader", DocumentMetadataHandle.Capability.READ);
            metadata.assertHasPermission("data-hub-flow-writer", DocumentMetadataHandle.Capability.UPDATE);

            metadata = getMetadata(client, "/step-definitions/custom/echo-step/echo-step.step.json");
            metadata.assertHasPermission("data-hub-step-definition-reader", DocumentMetadataHandle.Capability.READ);
            metadata.assertHasPermission("data-hub-step-definition-writer", DocumentMetadataHandle.Capability.UPDATE);

            metadata = getMetadata(client, "/entities/Customer.entity.json");
            metadata.assertHasPermission("data-hub-entity-model-reader", DocumentMetadataHandle.Capability.READ);
            metadata.assertHasPermission("data-hub-entity-model-writer", DocumentMetadataHandle.Capability.UPDATE);
        });
    }
}
