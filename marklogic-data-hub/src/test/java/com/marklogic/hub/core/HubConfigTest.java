package com.marklogic.hub.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.junit.jupiter.api.Test;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

public class HubConfigTest extends AbstractHubCoreTest {

    @Test
    public void testAppConfigDefaultProps() {
        HubConfigImpl hubConfig = new HubConfigImpl();
        hubConfig.applyProperties(new Properties());
        AppConfig config = hubConfig.getAppConfig();
        assertEquals(HubConfig.DEFAULT_FINAL_NAME, config.getContentDatabaseName());
        assertEquals(HubConfig.DEFAULT_FINAL_TRIGGERS_DB_NAME, config.getTriggersDatabaseName());
        assertEquals(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, config.getSchemasDatabaseName());
        assertEquals(HubConfig.DEFAULT_MODULES_DB_NAME, config.getModulesDatabaseName());
    }

    @Test
    public void applyFinalConnectionPropsToDefaultRestConnection() {
        HubConfigImpl hubConfig = new HubConfigImpl(getHubProject());
        hubConfig.applyProperties(new Properties());
        AppConfig config = hubConfig.getAppConfig();

        assertEquals((Integer) 8011, config.getRestPort(),
            "The final port should be used as restPort so that any ml-gradle feature that depends on mlRestPost " +
                "ends up talking to the final app server");
        assertNull(config.getRestSslContext(), "Should be null because neither mlSimpleSsl nor mlFinalSimpleSsl were set to true");
        assertNull(config.getRestSslHostnameVerifier(), "Should be null because neither mlSimpleSsl nor mlFinalSimpleSsl were set to true");
        assertNull(config.getRestTrustManager(), "Should be null because neither mlSimpleSsl nor mlFinalSimpleSsl were set to true");

        Properties props = new Properties();
        props.put("mlFinalAuth", "basic");
        props.put("mlFinalPort", "8123");
        props.put("mlFinalCertFile", "/path/to/file");
        props.put("mlFinalCertPassword", "changeme");
        props.put("mlFinalExternalName", "somename");
        props.put("mlFinalSimpleSsl", "true");

        hubConfig.applyDefaultPropertyValues();
        hubConfig.loadConfigurationFromProperties(props, true);

        config = hubConfig.getAppConfig();

        assertEquals(SecurityContextType.BASIC, config.getRestSecurityContextType());
        assertEquals((Integer) 8123, config.getRestPort());
        assertEquals("/path/to/file", config.getRestCertFile());
        assertEquals("changeme", config.getRestCertPassword());
        assertEquals("somename", config.getRestExternalName());
        assertNotNull(config.getRestSslContext(), "Should have been set because mlFinalSimpleSsl=true");
        assertNotNull(config.getRestSslHostnameVerifier(), "Should have been set because mlFinalSimpleSsl=true");
        assertNotNull(config.getRestTrustManager(), "Should have been set because mlFinalSimpleSsl=true");
    }

    @Test
    public void testConfigAppName() {
        HubConfigImpl hubConfig = new HubConfigImpl();
        hubConfig.applyProperties(new Properties());
        // When not set, app name should default to "DHF"
        assertEquals("DHF", hubConfig.getAppConfig().getName());

        String appName = "data-hub";
        Properties props = new Properties();
        props.setProperty("mlAppName", appName);
        hubConfig.applyProperties(new SimplePropertySource(props));
        assertEquals(appName, hubConfig.getAppConfig().getName());
    }


    @Test
    public void testHubInfo() throws Exception {
        HubConfigImpl config = new HubConfigImpl(getHubProject());
        config.applyProperties(new Properties());
        ObjectMapper objmapper = new ObjectMapper();

        JsonNode jsonNode = objmapper.readTree(config.getInfo());
        assertEquals(jsonNode.get("stagingDbName").asText(), config.getDbName(DatabaseKind.STAGING));
        assertEquals(jsonNode.get("stagingHttpName").asText(), config.getHttpName(DatabaseKind.STAGING));
        assertEquals(jsonNode.get("finalForestsPerHost").asInt(), (int) config.getForestsPerHost(DatabaseKind.FINAL));
        assertEquals(jsonNode.get("finalPort").asInt(), (int) config.getPort(DatabaseKind.FINAL));
    }
}
