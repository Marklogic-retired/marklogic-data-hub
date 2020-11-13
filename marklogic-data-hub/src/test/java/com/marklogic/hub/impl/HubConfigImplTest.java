package com.marklogic.hub.impl;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.junit.jupiter.api.Test;
import org.springframework.util.StringUtils;

import java.io.File;
import java.util.Properties;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class HubConfigImplTest {

    /**
     * Verifies that mlUsername/mlPassword will be correctly applied as the username/password for each connection
     * configuration in HubConfig.
     */
    @Test
    void applyUsernameAndPasswordToAllConfigs() {
        HubConfigImpl config = new HubConfigImpl();
        assertTrue(StringUtils.isEmpty(config.getMlUsername()));
        assertTrue(StringUtils.isEmpty(config.getMlPassword()));
        assertNull(config.getManageConfig());
        assertNull(config.getManageClient());
        assertNull(config.getAdminConfig());
        assertNull(config.getAdminManager());
        assertNull(config.getAppConfig());

        Properties props = new Properties();
        props.setProperty("mlUsername", "someone");
        props.setProperty("mlPassword", "someword");
        config.applyProperties(new SimplePropertySource(props));

        assertEquals("someone", config.getMlUsername());
        assertEquals("someword", config.getMlPassword());
        assertEquals("someone", config.getManageConfig().getUsername());
        assertEquals("someword", config.getManageConfig().getPassword());
        assertEquals("someone", config.getAdminConfig().getUsername());
        assertEquals("someword", config.getAdminConfig().getPassword());
        assertEquals("someone", config.getAppConfig().getAppServicesUsername());
        assertEquals("someword", config.getAppConfig().getAppServicesPassword());
        assertEquals("someone", config.getAppConfig().getRestAdminUsername());
        assertEquals("someword", config.getAppConfig().getRestAdminPassword());
    }

    @Test
    void withDefaultValues() {
        HubConfigImpl config = new HubConfigImpl();
        assertEquals("localhost", config.getHost());
        assertTrue(StringUtils.isEmpty(config.getMlUsername()));
        assertTrue(StringUtils.isEmpty(config.getMlPassword()));
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

    @Test
    void hubSslIsTrue() {
        verifySslIsntUsed(HubConfigImpl.withProperties(new Properties()));

        Properties props = new Properties();
        props.setProperty("hubSsl", "true");
        verifySslIsUsed(HubConfigImpl.withProperties(props));
    }

    @Test
    void hubSslIsTrueViaLoadConfigurationFromProperties() {
        HubConfigImpl config = new HubConfigImpl();
        config.loadConfigurationFromProperties(null, false);
        verifySslIsntUsed(config);

        Properties props = new Properties();
        props.setProperty("hubSsl", "true");
        config = new HubConfigImpl();
        config.loadConfigurationFromProperties(props, false);
        verifySslIsUsed(config);
    }

    @Test
    void hubDhsIsTrue() {
        verifyDhsConfigIsntSet(HubConfigImpl.withProperties(new Properties()));

        Properties props = new Properties();
        props.setProperty("hubDhs", "true");
        verifyDhsConfigIsSet(HubConfigImpl.withProperties(props));
    }

    @Test
    void hubDhsIsTrueViaLoadConfigurationFromProperties() {
        HubConfigImpl config = new HubConfigImpl();
        config.loadConfigurationFromProperties(null, false);
        verifyDhsConfigIsntSet(config);

        Properties props = new Properties();
        props.setProperty("hubDhs", "true");
        config = new HubConfigImpl();
        config.loadConfigurationFromProperties(props, false);
        verifyDhsConfigIsSet(config);
    }

    /**
     * Verifies that when mlHost is processed when refreshing a HubConfigImpl, the underlying AppConfig object is
     * updated as well.
     */
    @Test
    void hostOnAppConfigShouldBeUpdated() {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject(new File(new File("build"), "HubConfigImplTest").getAbsolutePath());

        HubConfigImpl config = new HubConfigImpl(project);
        Properties userProperties = new Properties();
        userProperties.setProperty("mlHost", "somehost");

        config.loadConfigurationFromProperties(userProperties, false);
        assertEquals("somehost", config.getHost());
        assertEquals("somehost", config.getAppConfig().getHost());
        assertTrue(new File(config.getAppConfig().getSchemaPaths().get(0)).isAbsolute(),
            "LoadSchemasCommand requires that the schemas path be absolute; path: " + config.getAppConfig().getSchemaPaths());
    }

    @Test
    void connectionTypeIsGatewayInProvisionedEnvironment(){
        HubConfigImpl hubConfig = new HubConfigImpl("localhost", "admin", "admin");
        assertNull(hubConfig.getAppConfig().getRestConnectionType());
        hubConfig.setIsProvisionedEnvironment(true);
        hubConfig.applyProperties(new Properties());
        assertEquals(DatabaseClient.ConnectionType.GATEWAY, hubConfig.getAppConfig().getRestConnectionType());
        assertEquals(DatabaseClient.ConnectionType.GATEWAY, hubConfig.getAppConfig().getAppServicesConnectionType());
    }

    private void verifyDefaultValues(HubConfigImpl config) {
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

    private void verifySslIsntUsed(HubConfigImpl config) {
        Stream.of(DatabaseKind.FINAL, DatabaseKind.STAGING, DatabaseKind.JOB).forEach(db -> {
            assertNull(config.getSslHostnameVerifier(db));
            assertNull(config.getSslContext(db));
            assertNull(config.getTrustManager(db));
        });

        assertEquals("http", config.getManageClient().getManageConfig().getScheme());
        assertFalse(config.getManageClient().getManageConfig().isConfigureSimpleSsl());

        assertNull(config.getAppConfig().getRestSslContext());
        assertNull(config.getAppConfig().getRestSslHostnameVerifier());
        assertNull(config.getAppConfig().getAppServicesSslContext());
        assertNull(config.getAppConfig().getAppServicesSslHostnameVerifier());
    }

    private void verifySslIsUsed(HubConfig config) {
        Stream.of(DatabaseKind.FINAL, DatabaseKind.STAGING, DatabaseKind.JOB).forEach(db -> {
            assertNotNull(config.getSslHostnameVerifier(db));
            assertNotNull(config.getSslContext(db));
            assertNotNull(config.getTrustManager(db));
        });

        assertEquals("https", config.getManageClient().getManageConfig().getScheme());
        assertTrue(config.getManageClient().getManageConfig().isConfigureSimpleSsl());

        assertNotNull(config.getAppConfig().getRestSslContext());
        assertNotNull(config.getAppConfig().getRestSslHostnameVerifier());
        assertNotNull(config.getAppConfig().getAppServicesSslContext());
        assertNotNull(config.getAppConfig().getAppServicesSslHostnameVerifier());
    }

    private void verifyDhsConfigIsSet(HubConfigImpl config) {
        assertTrue(config.getIsProvisionedEnvironment());
        assertTrue(config.getIsHostLoadBalancer());
        assertEquals(8010, config.getAppConfig().getAppServicesPort());
        assertEquals(SecurityContextType.BASIC, config.getAppConfig().getAppServicesSecurityContextType());
        assertEquals("basic", config.getAuthMethod(DatabaseKind.FINAL));
        assertEquals("basic", config.getAuthMethod(DatabaseKind.STAGING));
        assertEquals("basic", config.getAuthMethod(DatabaseKind.JOB));
    }

    private void verifyDhsConfigIsntSet(HubConfigImpl config) {
        assertFalse(config.getIsProvisionedEnvironment());
        assertFalse(config.getIsHostLoadBalancer());
        assertEquals(8000, config.getAppConfig().getAppServicesPort());
        assertEquals(SecurityContextType.DIGEST, config.getAppConfig().getAppServicesSecurityContextType());
        assertEquals("digest", config.getAuthMethod(DatabaseKind.FINAL));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.STAGING));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.JOB));
    }

    @Test
    void registerLowerCasedPropertyConsumers() {
        HubConfigImpl config = new HubConfigImpl();
        config.registerLowerCasedPropertyConsumers();

        Properties props = new Properties();
        props.setProperty("mlhost", "lower-host");
        props.setProperty("mlusername", "lower-user");
        props.setProperty("mlpassword", "lower-password");
        config.applyProperties(new SimplePropertySource(props));

        assertEquals("lower-host", config.getHost());
        assertEquals("lower-user", config.getMlUsername());
        assertEquals("lower-password", config.getMlPassword());
    }
}
