package com.marklogic.quickstart.service;

import com.marklogic.hub.HubConfigBuilder;
import com.marklogic.hub.HubTestBase;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.annotation.PostConstruct;
import javax.ws.rs.POST;

@Configuration
public class AbstractServiceTest extends HubTestBase {


    @PostConstruct
    protected void setupEnv() {
        createProjectDir();
        EnvironmentConfig envConfig = new EnvironmentConfig(PROJECT_PATH, null, "admin", "admin");
        envConfig.setMlSettings(HubConfigBuilder.newHubConfigBuilder(PROJECT_PATH).withPropertiesFromEnvironment().build());
        envConfig.checkIfInstalled();
        setEnvConfig(envConfig);
    }

    protected void setEnvConfig(EnvironmentConfig envConfig) {

        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        authenticationToken.setEnvironmentConfig(envConfig);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }



}
