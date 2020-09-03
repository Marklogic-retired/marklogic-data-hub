package com.marklogic.hub;

import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Spring configuration for accessing DHF components, along with a single HubConfigImpl use. Only appropriate for a
 * context where a single HubConfigImpl makes sense, such as the DHF Gradle plugin and DHF client JAR.
 */
@Configuration
@ComponentScan(basePackages = {"com.marklogic.hub.impl", "com.marklogic.hub.legacy.impl", "com.marklogic.hub.deploy.commands",
    "com.marklogic.hub.job.impl", "com.marklogic.hub.flow.impl", "com.marklogic.hub.step", "com.marklogic.hub.util"})
@EnableAutoConfiguration
public class ApplicationConfig {

    /**
     * HubConfigImpl is no longer a Component. But users of this class expect it to be present in the Spring container,
     * so it's declared as a Bean here. And it's given a new HubProjectImpl, which is als no longer a Component.
     *
     * @return
     */
    @Bean
    HubConfig hubConfig() {
        return new HubConfigImpl(new HubProjectImpl());
    }

    public static void main(String[] args) {
        LoggerFactory.getLogger(ApplicationConfig.class).info("Starting Data Hub Application Context");
        SpringApplication.run(ApplicationConfig.class);
    }

}

