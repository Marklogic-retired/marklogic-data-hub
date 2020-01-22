package com.marklogic.hub.web.service;

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.web.auth.ConnectionAuthenticationToken;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.core.context.SecurityContextHolder;


public class AbstractServiceTest extends HubTestBase implements InitializingBean {

    protected void setupEnv() {
        createProjectDir();
        adminHubConfig.refreshProject();
        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        installHubModules();
    }

    public void afterPropertiesSet() throws Exception {
        super.afterPropertiesSet();
        setupEnv();
    }

}
