package com.marklogic.hub;

import com.marklogic.hub.impl.HubConfigImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource("file:gradle.properties")
public class ApplicationConfig
{
    @Bean
    HubConfig getHubConfig()
    {
        return new HubConfigImpl();
    }
}
