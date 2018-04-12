package com.marklogic.quickstart.service;

import com.marklogic.hub.EntityManager;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfigBuilder;
import com.marklogic.hub.entity.Entity;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.apache.commons.io.FileUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ServiceConfiguration extends EnvironmentAware {

    @Bean
    @Scope("prototype")
    public FlowManager flowManager() {
        if (envConfig() == null) {
            return null;
        } else {
            return FlowManager.create(envConfig().getMlSettings());
        }
    };

}
