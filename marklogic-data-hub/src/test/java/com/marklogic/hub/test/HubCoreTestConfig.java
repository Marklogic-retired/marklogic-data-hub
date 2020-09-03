package com.marklogic.hub.test;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import org.apache.commons.io.IOUtils;
import org.springframework.aop.framework.ProxyFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Test configuration for DHF core tests.
 */
@Configuration
@ComponentScan(basePackages = {
    "com.marklogic.hub.impl", "com.marklogic.hub.legacy.impl", "com.marklogic.hub.deploy.commands",
    "com.marklogic.hub.job.impl", "com.marklogic.hub.flow.impl", "com.marklogic.hub.step", "com.marklogic.hub.util"
})
public class HubCoreTestConfig extends LoggingObject {

    /**
     * Supports running tests in parallel. The expectation is that a test can use this interceptor to claim a HubConfig
     * when a test starts, and then release it when the test ends. HubConfigImpl objects are managed by a
     * commons-pool2 object pool.
     *
     * @return
     */
    @Bean
    HubConfigInterceptor hubConfigInterceptor() {
        return new HubConfigInterceptor(new HubConfigObjectFactory(loadGradleProperties()));
    }

    /**
     * Stand-in for an actual HubConfig instance. Delegates calls on a HubConfigImpl to the HubConfigImpl that is
     * claimed by the HubConfigInterceptor, which a test should do at the start of each test method.
     *
     * @return
     */
    @Bean
    HubConfig hubConfigImplProxy() {
        ProxyFactory proxyFactory = new ProxyFactory(new HubConfigImpl());
        proxyFactory.setProxyTargetClass(true);
        proxyFactory.addAdvice(hubConfigInterceptor());
        return (HubConfigImpl) proxyFactory.getProxy();
    }

    private Properties loadGradleProperties() {
        Properties properties = new Properties();
        loadPropertiesFile("gradle.properties", properties, true);
        loadPropertiesFile("gradle-local.properties", properties, false);
        return properties;
    }

    private void loadPropertiesFile(String filename, Properties properties, boolean throwErrorIfNotFound) {
        File file = new File("marklogic-data-hub", filename);
        if (!file.exists()) {
            file = new File(".", filename);
        }
        InputStream is = null;
        try {
            Properties p = new Properties();
            is = new FileInputStream(file);
            logger.info("Loading properties from: " + file.getAbsolutePath());
            p.load(is);
            properties.putAll(p);
        } catch (IOException ex) {
            if (throwErrorIfNotFound) {
                throw new RuntimeException("Could not read from Gradle properties file: " + file + "; cause: " + ex.getMessage(), ex);
            } else {
                logger.debug("Could not read from Gradle properties file: " + file + "; cause: " + ex.getMessage());
            }
        } finally {
            IOUtils.closeQuietly(is);
        }
    }
}
