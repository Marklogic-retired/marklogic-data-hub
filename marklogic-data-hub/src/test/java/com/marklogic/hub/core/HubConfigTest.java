package com.marklogic.hub.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

public class HubConfigTest extends AbstractHubCoreTest {

    @AfterEach
    public void cleanup() {
        resetProperties();
    }

    @Test
    public void testAppConfigDefaultProps() {
        AppConfig config = adminHubConfig.getAppConfig();
        assertEquals(HubConfig.DEFAULT_FINAL_NAME, config.getContentDatabaseName());
        assertEquals(HubConfig.DEFAULT_FINAL_TRIGGERS_DB_NAME, config.getTriggersDatabaseName());
        assertEquals(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, config.getSchemasDatabaseName());
        assertEquals(HubConfig.DEFAULT_MODULES_DB_NAME, config.getModulesDatabaseName());
    }

    @Test
    public void applyFinalConnectionPropsToDefaultRestConnection() {
        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());

        AppConfig config = adminHubConfig.getAppConfig();

        assertEquals((Integer) 8011, config.getRestPort(),
            "The final port should be used as restPort so that any ml-gradle feature that depends on mlRestPost " +
                "ends up talking to the final app server");
        if (!(isCertAuth() || isSslRun())) {
            assertNull(config.getRestSslContext(), "Should be null because neither mlSimpleSsl nor mlFinalSimpleSsl were set to true");
            assertNull(config.getRestSslHostnameVerifier(), "Should be null because neither mlSimpleSsl nor mlFinalSimpleSsl were set to true");
            assertNull(config.getRestTrustManager(), "Should be null because neither mlSimpleSsl nor mlFinalSimpleSsl were set to true");
        }
        //get the old values
        String port = adminHubConfig.getPort(DatabaseKind.FINAL).toString();
        String authMethod = adminHubConfig.getAuthMethod(DatabaseKind.FINAL);
        String certFile = adminHubConfig.getCertFile(DatabaseKind.FINAL);
        String certPassword = adminHubConfig.getCertPassword(DatabaseKind.FINAL);
        String extName = adminHubConfig.getExternalName(DatabaseKind.FINAL);
        Boolean sslMethod = adminHubConfig.getSimpleSsl(DatabaseKind.FINAL);

        Properties props = new Properties();
        props.put("mlFinalAuth", "basic");
        props.put("mlFinalPort", "8123");
        props.put("mlFinalCertFile", "/path/to/file");
        props.put("mlFinalCertPassword", "changeme");
        props.put("mlFinalExternalName", "somename");
        props.put("mlFinalSimpleSsl", "true");

        resetProperties();
        adminHubConfig.loadConfigurationFromProperties(props, true);

        config = adminHubConfig.getAppConfig();

        assertEquals(SecurityContextType.BASIC, config.getRestSecurityContextType());
        assertEquals((Integer) 8123, config.getRestPort());
        assertEquals("/path/to/file", config.getRestCertFile());
        assertEquals("changeme", config.getRestCertPassword());
        assertEquals("somename", config.getRestExternalName());
        assertNotNull(config.getRestSslContext(), "Should have been set because mlFinalSimpleSsl=true");
        assertNotNull(config.getRestSslHostnameVerifier(), "Should have been set because mlFinalSimpleSsl=true");
        assertNotNull(config.getRestTrustManager(), "Should have been set because mlFinalSimpleSsl=true");

        props = new Properties();
        //reset them
        props.put("mlFinalAuth", authMethod);
        props.put("mlFinalPort", port);

        //these values not set by dhf-default, so checking for null
        if (certFile != null)
            props.put("mlFinalCertFile", certFile);
        if (certPassword != null)
            props.put("mlFinalCertPassword", certPassword);
        if (extName != null)
            props.put("mlFinalExternalName", extName);
        props.put("mlFinalSimpleSsl", sslMethod);
        //if sslContext is set , it is assumed that it is a secure connection, hence unsetting them
        if (!sslMethod) {
            adminHubConfig.setSslContext(DatabaseKind.FINAL, null);
            adminHubConfig.setSslHostnameVerifier(DatabaseKind.FINAL, null);
            adminHubConfig.setTrustManager(DatabaseKind.FINAL, null);
        }


    }

    @Test
    public void testConfigAppName() {
        // When not set, app name should default to "DHF"
        assertEquals("DHF", adminHubConfig.getAppConfig().getName());

        String appName = "data-hub";
        Properties props = new Properties();
        props.setProperty("mlAppName", appName);
        adminHubConfig.applyProperties(new SimplePropertySource(props));
        assertEquals(appName, adminHubConfig.getAppConfig().getName());
    }


    @Test
    public void testHubInfo() {

        HubConfig config = adminHubConfig;
        ObjectMapper objmapper = new ObjectMapper();

        try {

            JsonNode jsonNode = objmapper.readTree(config.getInfo());

            assertEquals(jsonNode.get("stagingDbName").asText(), config.getDbName(DatabaseKind.STAGING));

            assertEquals(jsonNode.get("stagingHttpName").asText(), config.getHttpName(DatabaseKind.STAGING));

            assertEquals(jsonNode.get("finalForestsPerHost").asInt(), (int) config.getForestsPerHost(DatabaseKind.FINAL));

            assertEquals(jsonNode.get("finalPort").asInt(), (int) config.getPort(DatabaseKind.FINAL));

        } catch (Exception e) {
            throw new DataHubConfigurationException("Your datahub configuration could not serialize");
        }
    }
}
