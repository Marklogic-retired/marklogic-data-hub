package com.marklogic.hub.central;

import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.util.PropertySource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.env.MockEnvironment;

import java.util.Properties;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class HubCentralTest {

    HubCentral hubCentral;
    MockEnvironment mockEnvironment;

    @BeforeEach
    void beforeEach() throws Exception {
        Properties defaultProps = new Properties();
        defaultProps.load(new ClassPathResource("application.properties").getInputStream());
        mockEnvironment = new MockEnvironment();
        mockEnvironment.getPropertySources().addFirst(new PropertiesPropertySource("default", defaultProps));

        hubCentral = new HubCentral();
        hubCentral.environment = mockEnvironment;
    }

    @Test
    void verifyDefaultPropertiesForSslAndAuthentication() {
        PropertySource props = hubCentral.buildPropertySource("anyone", "anyword");
        assertEquals("anyone", props.getProperty("mlUsername"));
        assertEquals("anyword", props.getProperty("mlPassword"));
        assertEquals("localhost", props.getProperty("mlHost"),
            "For convenience while doing local development, mlHost still defaults to localhost");
        assertEquals("anyone", props.getProperty("mlAppServicesUsername"));
        assertEquals("anyword", props.getProperty("mlAppServicesPassword"));
        assertEquals("true", props.getProperty("mlIsHostLoadBalancer"));
        assertEquals("true", props.getProperty("mlIsProvisionedEnvironment"));
        assertEquals("https", props.getProperty("mlManageScheme"));
        assertEquals("true", props.getProperty("mlManageSimpleSsl"));
        assertEquals("8010", props.getProperty("mlAppServicesPort"));

        Stream.of("mlAppServicesAuthentication", "mlFinalAuth", "mlStagingAuth", "mlJobAuth").forEach(name -> {
            assertEquals("basic", props.getProperty(name));
        });
        Stream.of("mlAppServicesSimpleSsl", "mlFinalSimpleSsl", "mlStagingSimpleSsl", "mlJobSimpleSsl").forEach(name -> {
            assertEquals("true", props.getProperty(name));
        });
    }

    /**
     * This is essentially tested via every HC test as well, which is using local defaults.
     */
    @Test
    void verifyLocalDefaults() {
        hubCentral.useLocalDefaults = true;
        PropertySource props = hubCentral.buildPropertySource("anyone", "anyword");
        assertEquals("anyone", props.getProperty("mlUsername"));
        assertEquals("anyword", props.getProperty("mlPassword"));
        assertEquals("localhost", props.getProperty("mlHost"));
        assertEquals("anyone", props.getProperty("mlAppServicesUsername"));
        assertEquals("anyword", props.getProperty("mlAppServicesPassword"));
        assertEquals("false", props.getProperty("mlIsHostLoadBalancer"));
        assertEquals("false", props.getProperty("mlIsProvisionedEnvironment"));
        assertEquals("http", props.getProperty("mlManageScheme"));
        assertEquals("false", props.getProperty("mlManageSimpleSsl"));
        assertEquals("8000", props.getProperty("mlAppServicesPort"));

        Stream.of("mlAppServicesAuthentication", "mlFinalAuth", "mlStagingAuth", "mlJobAuth").forEach(name -> {
            assertEquals("digest", props.getProperty(name));
        });
        Stream.of("mlAppServicesSimpleSsl", "mlFinalSimpleSsl", "mlStagingSimpleSsl", "mlJobSimpleSsl").forEach(name -> {
            assertEquals("false", props.getProperty(name));
        });
    }

    @Test
    void newHubConfig() {
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
}
