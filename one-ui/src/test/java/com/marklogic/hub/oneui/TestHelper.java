package com.marklogic.hub.oneui;

import com.marklogic.hub.oneui.auth.MarkLogicAuthenticationManager;
import com.marklogic.hub.oneui.models.EnvironmentInfo;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("classpath:application-test.properties")
public class TestHelper {
    @Autowired
    MarkLogicAuthenticationManager markLogicAuthenticationManager;

    @Value("${test.mlHost:localhost}")
    public String mlHost;

    @Value("${test.dataHubDeveloperUsername:data-hub-developer-user}")
    public String dataHubDeveloperUsername;
    @Value("${test.dataHubDeveloperPassword:data-hub-developer-user}")
    public String dataHubDeveloperPassword;

    @Autowired
    private HubConfigSession hubConfig;

    public void authenticateSession() {
       EnvironmentInfo environmentInfo = new EnvironmentInfo(mlHost, "DIGEST", 8000,"DIGEST", 8002,"DIGEST", 8010, "DIGEST", 8011);
       hubConfig.setCredentials(environmentInfo, dataHubDeveloperUsername, dataHubDeveloperPassword);
    }
}
