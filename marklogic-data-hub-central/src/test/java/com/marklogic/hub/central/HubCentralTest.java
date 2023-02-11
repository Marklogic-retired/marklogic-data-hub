package com.marklogic.hub.central;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.test.TestObject;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.util.PropertySource;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.env.MockEnvironment;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class HubCentralTest extends TestObject {

    HubCentral hubCentral;
    MockEnvironment mockEnvironment;

    @Test
    void testNewDefaultHubConfig() throws IOException {
        setupEnvironment("application.properties");
        verifyDefaultPropertiesForSslAndAuthentication();
        newDefaultHubConfig();
    }

    @Test
    void testNewHubConfigForDhsOnAWS() throws IOException {
        setupEnvironment("application-aws.properties");
        verifyPropertiesForSslAndAuthenticationOnDhs();
        newHubConfigForDhs();
    }

    @Test
    void newHubConfigWithCustomProperties() throws IOException {
        setupEnvironment("application-dummy.properties");
        String uri = "/data-hub/5/datahubConfig.json";

        // Writing the datahub config into the modules database
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.getCollections().addAll("marklogic-data-hub-config");
        addDefaultPermissions(metadata);
        DatabaseClient client = DatabaseClientFactory.newClient("localhost", 8010, "data-hub-MODULES",
            new DatabaseClientFactory.DigestAuthContext("test-admin-for-data-hub-tests", "password"));
        client.newDocumentManager().write(uri, metadata, new BytesHandle(readStringFromClasspath("/custom-config/datahubConfig.json").getBytes(StandardCharsets.UTF_8)).withFormat(Format.JSON));

        HubConfigImpl hubConfig = hubCentral.newHubConfig("test-data-hub-developer", "password");
        assertEquals(hubConfig.getUsername(), "test-data-hub-developer");
        assertEquals("any-user-name", mockEnvironment.getProperty("mlUsername"));

        assertEquals(hubConfig.getStagingDbName(), "staging");
        assertEquals(hubConfig.getStagingPort(), 8020);
        assertEquals(hubConfig.getStagingAuthMethod(), "basic");
        assertEquals(hubConfig.getHttpName(DatabaseKind.STAGING), "staging-app-server");

        assertEquals(hubConfig.getFinalDbName(), "final");
        assertEquals(hubConfig.getFinalPort(), 8021);
        assertEquals(hubConfig.getFinalAuthMethod(), "basic");
        assertEquals(hubConfig.getHttpName(DatabaseKind.FINAL), "final-app-server");

        assertEquals(hubConfig.getJobDbName(), "jobs");
        assertEquals(hubConfig.getJobPort(), 8023);
        assertEquals(hubConfig.getJobAuthMethod(), "basic");
        assertEquals(hubConfig.getHttpName(DatabaseKind.JOB), "job-app-server");

        assertEquals(hubConfig.getModulesDbName(), "modules");
        assertEquals(hubConfig.getStagingTriggersDbName(), "staging-TRIGGERS");
        assertEquals(hubConfig.getStagingSchemasDbName(), "staging-SCHEMAS");
        assertEquals(hubConfig.getFinalTriggersDbName(), "final-TRIGGERS");
        assertEquals(hubConfig.getFinalSchemasDbName(), "final-SCHEMAS");

        // Current Authentication method is basic as returned from hubConfig.json file
        assertEquals(hubConfig.getStagingAuthMethod(), "basic");
        // Setting the environment property and creating hubconfig object. The hubconfig object is expected to have
        // mlStagingAuth to be digest
        mockEnvironment.setProperty("mlStagingAuth", "digest");
        mockEnvironment.setProperty("mlStagingPort", "8030");
        mockEnvironment.setProperty("mlFinalPort", "8031");
        hubConfig = hubCentral.newHubConfig("test-data-hub-developer", "password");
        assertEquals("digest", hubConfig.getAuthMethod(DatabaseKind.STAGING));
        assertEquals(8030, hubConfig.getStagingPort());
        assertEquals(8031, hubConfig.getFinalPort());

        client.newDocumentManager().delete(uri);
    }

    void newDefaultHubConfig() {
        Properties customProps = new Properties();
        customProps.setProperty("mlHost", "somehost");
        mockEnvironment.getPropertySources().addFirst(new PropertiesPropertySource("custom", customProps));

        HubConfigImpl hubConfig = hubCentral.newHubConfig("anyone", "anyword");

        assertEquals("somehost", hubConfig.getAppConfig().getHost());
        assertEquals((Integer) 8000, hubConfig.getAppConfig().getAppServicesPort());
        assertEquals("anyone", hubConfig.getAppConfig().getAppServicesUsername(),
                "The Versions class used appConfig.getAppServicesDatabaseClient to get the ML version");
        assertEquals("anyword", hubConfig.getAppConfig().getAppServicesPassword());
        assertEquals(SecurityContextType.DIGEST, hubConfig.getAppConfig().getAppServicesSecurityContextType());
        assertNull(hubConfig.getAppConfig().getAppServicesSslContext());

        assertEquals("somehost", hubConfig.getHost());
        assertEquals("anyone", hubConfig.getMlUsername());
        assertEquals("anyword", hubConfig.getMlPassword());

        assertEquals("digest", hubConfig.getAuthMethod(DatabaseKind.STAGING));
        assertEquals("digest", hubConfig.getAuthMethod(DatabaseKind.FINAL));
        assertEquals("digest", hubConfig.getAuthMethod(DatabaseKind.JOB));

        assertNull(hubConfig.getSslContext(DatabaseKind.STAGING));
        assertNull(hubConfig.getSslContext(DatabaseKind.FINAL));
        assertNull(hubConfig.getSslContext(DatabaseKind.JOB));

        assertFalse(hubConfig.getIsHostLoadBalancer());
        assertFalse(hubConfig.getIsProvisionedEnvironment());

        ManageConfig manageConfig = hubConfig.getManageConfig();
        assertEquals("anyone", manageConfig.getUsername());
        assertEquals("anyone", manageConfig.getSecurityUsername());
        assertEquals("somehost", manageConfig.getHost());
        assertEquals("anyword", manageConfig.getPassword());
        assertEquals("anyword", manageConfig.getSecurityPassword());
        assertFalse(manageConfig.isConfigureSimpleSsl());
        assertEquals("http", manageConfig.getScheme());
    }

    void newHubConfigForDhs() {
        Properties customProps = new Properties();
        customProps.setProperty("mlHost", "somehost");
        mockEnvironment.getPropertySources().addFirst(new PropertiesPropertySource("custom", customProps));

        HubConfigImpl hubConfig = hubCentral.newHubConfig("anyone", "anyword");

        assertEquals("somehost", hubConfig.getAppConfig().getHost());
        assertEquals((Integer) 8010, hubConfig.getAppConfig().getAppServicesPort(),
                "8010 is needed by DHS, as 8000 is locked down; this should be defined in application.properties");
        assertEquals("anyone", hubConfig.getAppConfig().getAppServicesUsername(),
                "The Versions class used appConfig.getAppServicesDatabaseClient to get the ML version");
        assertEquals("anyword", hubConfig.getAppConfig().getAppServicesPassword());
        assertEquals(SecurityContextType.BASIC, hubConfig.getAppConfig().getAppServicesSecurityContextType());
        assertNotNull(hubConfig.getAppConfig().getAppServicesSslContext());

        assertEquals("somehost", hubConfig.getHost());
        assertEquals("anyone", hubConfig.getMlUsername());
        assertEquals("anyword", hubConfig.getMlPassword());

        assertEquals("basic", hubConfig.getAuthMethod(DatabaseKind.STAGING));
        assertEquals("basic", hubConfig.getAuthMethod(DatabaseKind.FINAL));
        assertEquals("basic", hubConfig.getAuthMethod(DatabaseKind.JOB));

        assertNotNull(hubConfig.getSslContext(DatabaseKind.STAGING));
        assertNotNull(hubConfig.getSslContext(DatabaseKind.FINAL));
        assertNotNull(hubConfig.getSslContext(DatabaseKind.JOB));

        assertTrue(hubConfig.getIsHostLoadBalancer());
        assertTrue(hubConfig.getIsProvisionedEnvironment());

        ManageConfig manageConfig = hubConfig.getManageConfig();
        assertEquals("anyone", manageConfig.getUsername());
        assertEquals("anyone", manageConfig.getSecurityUsername());
        assertEquals("somehost", manageConfig.getHost());
        assertEquals("anyword", manageConfig.getPassword());
        assertEquals("anyword", manageConfig.getSecurityPassword());
        assertTrue(manageConfig.isConfigureSimpleSsl());
        assertEquals("https", manageConfig.getScheme());
    }

    void verifyDefaultPropertiesForSslAndAuthentication() {
        PropertySource props = hubCentral.buildPropertySource("anyone", "anyword");
        assertEquals("anyone", props.getProperty("mlUsername"));
        assertEquals("anyword", props.getProperty("mlPassword"));
        assertEquals("localhost", props.getProperty("mlHost"),
                "For convenience while doing local development, mlHost still defaults to localhost");
        assertNull(props.getProperty("hubDhs"));
        assertNull(props.getProperty("hubSsl"));
    }

    void verifyPropertiesForSslAndAuthenticationOnDhs() {
        PropertySource props = hubCentral.buildPropertySource("anyone", "anyword");
        assertEquals("anyone", props.getProperty("mlUsername"));
        assertEquals("anyword", props.getProperty("mlPassword"));
        assertEquals("true", props.getProperty("hubDhs"));
    }

    private void setupEnvironment(String propertyFileName) throws IOException {
        Properties defaultProps = new Properties();
        defaultProps.load(new ClassPathResource(propertyFileName).getInputStream());
        mockEnvironment = new MockEnvironment();
        mockEnvironment.getPropertySources().addFirst(new PropertiesPropertySource("default", defaultProps));

        hubCentral = new HubCentral();
        hubCentral.environment = mockEnvironment;
    }
}
