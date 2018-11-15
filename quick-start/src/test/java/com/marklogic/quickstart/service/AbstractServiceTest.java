package com.marklogic.quickstart.service;

import com.marklogic.hub.HubTestBase;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.annotation.PostConstruct;


public class AbstractServiceTest extends HubTestBase {

    @Autowired
    protected EnvironmentConfig envConfig;

    protected void setupEnv() {
        createProjectDir();
        envConfig.setMlSettings(adminHubConfig);
        envConfig.checkIfInstalled();
        setEnvConfig(envConfig);
    }

    protected void setEnvConfig(EnvironmentConfig envConfig) {

        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        authenticationToken.setEnvironmentConfig(envConfig);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }



}
