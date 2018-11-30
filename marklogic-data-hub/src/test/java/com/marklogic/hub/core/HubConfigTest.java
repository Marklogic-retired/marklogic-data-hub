package com.marklogic.hub.core;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.error.DataHubConfigurationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

//import org.apache.htrace.fasterxml.jackson.databind.ObjectMapper;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class HubConfigTest extends HubTestBase {


    @BeforeEach
    public void setup() {
        deleteProjectDir();
        createProjectDir();
        dataHub.initProject();
    }

    @Test
    public void applyFinalConnectionPropsToDefaultRestConnection() {
        AppConfig config = adminHubConfig.getAppConfig();

        assertEquals(new Integer(8011), config.getRestPort(),
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
        adminHubConfig.refreshProject(props, false);

        config = adminHubConfig.getAppConfig();
        assertEquals(SecurityContextType.BASIC, config.getRestSecurityContextType());
        assertEquals(new Integer(8123), config.getRestPort());
        assertEquals("/path/to/file", config.getRestCertFile());
        assertEquals("changeme", config.getRestCertPassword());
        assertEquals("somename", config.getRestExternalName());
        assertNotNull(config.getRestSslContext(), "Should have been set because mlFinalSimpleSsl=true");
        assertNotNull(config.getRestSslHostnameVerifier(), "Should have been set because mlFinalSimpleSsl=true");
        assertNotNull(config.getRestTrustManager(), "Should have been set because mlFinalSimpleSsl=true");
    }

    @Test
    public void testLoadBalancerProps() {
        deleteProp("mlLoadBalancerHosts");
        adminHubConfig.refreshProject();
        assertNull(getHubFlowRunnerConfig().getLoadBalancerHost());

        writeProp("mlIsHostLoadBalancer", "true");
        adminHubConfig.refreshProject();
        assertTrue(getHubFlowRunnerConfig().getIsHostLoadBalancer());

        writeProp("mlLoadBalancerHosts", getHubFlowRunnerConfig().getHost());
        adminHubConfig.refreshProject();
        assertEquals(getHubFlowRunnerConfig().getHost(), getHubFlowRunnerConfig().getLoadBalancerHost());

        try {
            writeProp("mlLoadBalancerHosts", "host1");
            adminHubConfig.refreshProject();
        }
        catch (DataHubConfigurationException e){
            assertEquals( "\"mlLoadBalancerHosts\" must be the same as \"mlHost\"", e.getMessage());
        }

        deleteProp("mlLoadBalancerHosts");
        deleteProp("mlIsHostLoadBalancer");
        adminHubConfig.refreshProject();
        assertFalse(getHubFlowRunnerConfig().getIsHostLoadBalancer());
    }


    @Test
    public void testHubInfo() {

        HubConfig config = getHubFlowRunnerConfig();
        ObjectMapper objmapper = new ObjectMapper();

        try {

            JsonNode jsonNode = objmapper.readTree(config.getInfo());

            assertEquals(jsonNode.get("stagingDbName").asText(), config.getDbName(DatabaseKind.STAGING));

            assertEquals(jsonNode.get("stagingHttpName").asText(), config.getHttpName(DatabaseKind.STAGING));

            assertEquals(jsonNode.get("finalForestsPerHost").asInt(), (int) config.getForestsPerHost(DatabaseKind.FINAL));

            assertEquals(jsonNode.get("finalPort").asInt(), (int) config.getPort(DatabaseKind.FINAL));

        }
        catch (Exception e)
        {
            throw new DataHubConfigurationException("Your datahub configuration could not serialize");
        }
    }


}
