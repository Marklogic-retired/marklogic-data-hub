package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.Test;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertThrows;

public class CheckSecurityConfigurationTest  extends AbstractHubCoreTest {
    private static final Properties invalidDeveloper;
    private static final Properties invalidOperator;

    private static final Properties reset;

    static {
        invalidDeveloper = new Properties();
        invalidDeveloper.put("mlFlowDeveloperRole", "data-hub-developer");
        invalidOperator = new Properties();
        invalidOperator.put("mlFlowOperatorRole", "data-hub-operator");
        reset = new Properties();
        reset.put("mlFlowDeveloper", "");
        reset.put("mlFlowOperator", "");
    }
    /**
     * The CheckSecurityConfiguration should result in errors if gradle properties collide with Data Hub roles.
     */
    @Test
    void verifyFriendlyErrors() {
        //test developer setting
        HubConfig invalidDeveloperConfig = HubConfigImpl.withProperties(invalidDeveloper);
        assertThrows(RuntimeException.class, () -> whenCheckSecurityConfigurationIsExecuted(invalidDeveloperConfig));

        // test operator setting
        HubConfig invalidOperatorConfig = HubConfigImpl.withProperties(invalidOperator);
        assertThrows(RuntimeException.class, () -> whenCheckSecurityConfigurationIsExecuted(invalidOperatorConfig));
    }

    private void whenCheckSecurityConfigurationIsExecuted(HubConfig hubConfig) {
        new CheckSecurityConfiguration(hubConfig).execute(newCommandContext());
    }
}
