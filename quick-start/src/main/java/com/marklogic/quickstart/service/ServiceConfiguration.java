package com.marklogic.quickstart.service;

import com.marklogic.hub.EntityManager;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.entity.Entity;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
public class ServiceConfiguration {

    public static EnvironmentConfig envConfig() {
        SecurityContext context = SecurityContextHolder.getContext();
        ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken) context.getAuthentication();
        return authenticationToken.getEnvironmentConfig();
    }

    @Bean
    public FlowManager flowManager() {
        return FlowManager.create(envConfig().getMlSettings());
    };

}
