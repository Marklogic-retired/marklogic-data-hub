package org.example;

import com.marklogic.junit5.dhf.DataHubTestConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**    
 * 
 * Configuration when wanting to run the test against the TEST environment
 * 
 */
@Configuration
@PropertySource(value = {"file:gradle.properties", "file:gradle-test.properties"}, ignoreResourceNotFound = true)
public class TestEnvDataHubTestConfig extends DataHubTestConfig {
}
