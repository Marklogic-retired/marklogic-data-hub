package com.marklogic.hub.config;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubConfigBuilder;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.HubConfigBuilderImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
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

    @Bean
    DataHub getDataHub()
    {
        return new DataHubImpl();
    }

    @Bean
    HubConfigBuilder getHubConfigBuilder()
    {
        return new HubConfigBuilderImpl();
    }

    @Bean
    HubProject getHubProject()
    {
        return new HubProjectImpl();
    }
}
