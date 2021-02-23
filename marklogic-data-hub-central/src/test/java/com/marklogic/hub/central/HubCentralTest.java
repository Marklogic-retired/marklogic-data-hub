package com.marklogic.hub.central;

import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.util.PropertySource;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.env.MockEnvironment;

import java.io.IOException;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

public class HubCentralTest {

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
    void testNewHubConfigForDhsOnAzure() throws IOException {
        setupEnvironment("application-azure.properties");
        verifyPropertiesForSslAndAuthenticationOnDhs();
        newHubConfigForDhs();
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
