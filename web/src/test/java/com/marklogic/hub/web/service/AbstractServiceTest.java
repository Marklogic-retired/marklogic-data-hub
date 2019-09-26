package com.marklogic.hub.web.service;

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.web.auth.ConnectionAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.annotation.PostConstruct;


public class AbstractServiceTest extends HubTestBase {

    @PostConstruct
    protected void setupEnv() {
        createProjectDir();
        adminHubConfig.refreshProject();
        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        installHubModules();
    }

}
