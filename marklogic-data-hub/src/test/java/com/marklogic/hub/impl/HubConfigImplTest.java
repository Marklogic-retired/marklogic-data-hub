package com.marklogic.hub.impl;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.env.MockEnvironment;

import java.io.File;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class HubConfigImplTest {

    @Test
    void withDefaultValues() {
        HubConfigImpl config = HubConfigImpl.withDefaultProperties();
        assertEquals("localhost", config.getHost());
        assertNull(config.getMlUsername());
        assertNull(config.getMlPassword());
        verifyDefaultValues(config);
    }

    @Test
    void withHostUsernameAndPasswordPlusDefaultValues() {
        HubConfigImpl config = new HubConfigImpl("somehost", "someuser", "something");
        assertEquals("somehost", config.getHost());
        assertEquals("someuser", config.getMlUsername());
        assertEquals("something", config.getMlPassword());
        verifyDefaultValues(config);
    }

    /**
     * Verifies that when mlHost is processed when refreshing a HubConfigImpl, the underlying AppConfig object is
     * updated as well.
     *
     * @throws Exception
     */
    @Test
    void hostOnAppConfigShouldBeUpdated() throws Exception {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject(HubTestBase.PROJECT_PATH);

        // Construct a mock Environment based on the DHF default properties, but with a custom mlHost value
        Properties props = new Properties();
        props.load(new ClassPathResource("dhf-defaults.properties").getInputStream());
        MockEnvironment env = new MockEnvironment();
        for (Object key : props.keySet()) {
            env.setProperty((String) key, (String) props.get(key));
        }
        env.setProperty("mlHost", "somehost");

        HubConfigImpl config = new HubConfigImpl(project, env);
        config.loadConfigurationFromProperties(new Properties(), false);
        assertEquals("somehost", config.getHost());
        assertEquals("somehost", config.getAppConfig().getHost());
        assertTrue(new File(config.getAppConfig().getSchemaPaths().get(0)).isAbsolute(),
            "LoadSchemasCommand requires that the schemas path be absolute ");

    }

    private void verifyDefaultValues(HubConfigImpl config) {
        assertEquals("2.0.0", config.getDHFVersion());
        assertFalse(config.getIsHostLoadBalancer());

        assertEquals("data-hub-STAGING", config.getHttpName(DatabaseKind.STAGING));
        assertEquals(8010, config.getPort(DatabaseKind.STAGING));
        assertEquals("data-hub-STAGING", config.getDbName(DatabaseKind.STAGING));
        assertEquals(3, config.getForestsPerHost(DatabaseKind.STAGING));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.STAGING));
        assertFalse(config.getSimpleSsl(DatabaseKind.STAGING));

        assertEquals("data-hub-FINAL", config.getHttpName(DatabaseKind.FINAL));
        assertEquals(8011, config.getPort(DatabaseKind.FINAL));
        assertEquals("data-hub-FINAL", config.getDbName(DatabaseKind.FINAL));
        assertEquals(3, config.getForestsPerHost(DatabaseKind.FINAL));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.FINAL));
        assertFalse(config.getSimpleSsl(DatabaseKind.FINAL));

        assertEquals("data-hub-JOBS", config.getHttpName(DatabaseKind.JOB));
        assertEquals(8013, config.getPort(DatabaseKind.JOB));
        assertEquals("data-hub-JOBS", config.getDbName(DatabaseKind.JOB));
        assertEquals(4, config.getForestsPerHost(DatabaseKind.JOB));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.JOB));
        assertFalse(config.getSimpleSsl(DatabaseKind.JOB));

        assertEquals("data-hub-MODULES", config.getDbName(DatabaseKind.MODULES));
        assertEquals(1, config.getForestsPerHost(DatabaseKind.MODULES));

        assertEquals("data-hub-staging-TRIGGERS", config.getDbName(DatabaseKind.STAGING_TRIGGERS));
        assertEquals(1, config.getForestsPerHost(DatabaseKind.STAGING_TRIGGERS));
        assertEquals("data-hub-staging-SCHEMAS", config.getDbName(DatabaseKind.STAGING_SCHEMAS));
        assertEquals(1, config.getForestsPerHost(DatabaseKind.STAGING_SCHEMAS));

        assertEquals("data-hub-final-TRIGGERS", config.getDbName(DatabaseKind.FINAL_TRIGGERS));
        assertEquals(1, config.getForestsPerHost(DatabaseKind.FINAL_TRIGGERS));
        assertEquals("data-hub-final-SCHEMAS", config.getDbName(DatabaseKind.FINAL_SCHEMAS));
        assertEquals(1, config.getForestsPerHost(DatabaseKind.FINAL_SCHEMAS));

        assertEquals("forests", config.getCustomForestPath());

        assertEquals("flow-operator-role", config.getFlowOperatorRoleName());
        assertEquals("flow-operator", config.getFlowOperatorUserName());
        assertEquals("flow-developer-role", config.getFlowDeveloperRoleName());
        assertEquals("flow-developer", config.getFlowDeveloperUserName());

        assertEquals("default", config.getHubLogLevel());

        assertEquals("data-hub-module-reader,read,data-hub-module-reader,execute,data-hub-module-writer,update,rest-extension-user,execute", config.getModulePermissions());
        assertEquals("data-hub-entity-model-reader,read,data-hub-entity-model-writer,update", config.getEntityModelPermissions());
        assertEquals("data-hub-mapping-reader,read,data-hub-mapping-writer,update", config.getMappingPermissions());
        assertEquals("data-hub-flow-reader,read,data-hub-flow-writer,update", config.getFlowPermissions());
        assertEquals("data-hub-step-definition-reader,read,data-hub-step-definition-writer,update", config.getStepDefinitionPermissions());
        assertEquals("data-hub-job-reader,read,data-hub-job-internal,update", config.getJobPermissions());

        assertFalse(config.getIsProvisionedEnvironment());
    }
}
