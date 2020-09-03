package com.marklogic.hub.web;

import com.marklogic.hub.test.HubCoreTestConfig;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.web.WebAppConfiguration;

@Configuration
@WebAppConfiguration
@EnableAutoConfiguration
@Import(value = {HubCoreTestConfig.class, WebSocketConfig.class})
// Import will bring beans over declared in a Config, but it won't bring ComponentScans over, so gotta declare it here
@ComponentScan(basePackages = {
    "com.marklogic.hub.impl", "com.marklogic.hub.legacy.impl", "com.marklogic.hub.deploy.commands",
    "com.marklogic.hub.job.impl", "com.marklogic.hub.flow.impl", "com.marklogic.hub.step", "com.marklogic.hub.util",
    "com.marklogic.hub.web.auth", "com.marklogic.hub.web.model", "com.marklogic.hub.web.service", "com.marklogic.hub.web.web"
}//, excludeFilters = {@ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*HubConfigImpl")}
)
public class WebTestConfig {

}
