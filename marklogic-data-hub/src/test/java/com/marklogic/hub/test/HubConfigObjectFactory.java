package com.marklogic.hub.test;

import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.pool2.BasePooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicInteger;

public class HubConfigObjectFactory extends BasePooledObjectFactory<HubConfigImpl> {

    private Properties gradleProperties;
    private String[] hosts;
    private AtomicInteger hostCounter;
    private Logger logger = LoggerFactory.getLogger(getClass());

    public HubConfigObjectFactory(Properties gradleProperties) {
        this.gradleProperties = gradleProperties;
        this.hostCounter = new AtomicInteger(0);

        String hostsSysProp = System.getProperty("hubTestHosts");
        if (StringUtils.isNotEmpty(hostsSysProp)) {
            logger.info("Using hubTestHosts to set hosts: " + hostsSysProp);
            this.hosts = hostsSysProp.split(",");
        } else {
            this.hosts = gradleProperties.getProperty("mlHost").split(",");
        }

        logger.info("Will create HubConfigImpl instances for hosts: " + Arrays.asList(this.hosts));
    }

    /**
     * So this guy needs all the properties that were read in, which can happen in the Spring config class.
     * He then makes a new Properties object, copies the original props in, and then modifies mlHost based on the
     * host counter. Then he creates a HubConfigImpl for the pool. Then he makes a folder based on hostCounter and
     * assigns a HubProject to it. Now we've got a working HCI.
     *
     * @return
     * @throws Exception
     */
    @Override
    public HubConfigImpl create() {
        final int hostIndex = hostCounter.getAndIncrement();

        File projectDir = Paths.get("build").resolve("junit-project" + (hostIndex + 1)).toFile();
        if (projectDir.exists()) {
            try {
                FileUtils.forceDelete(projectDir);
            } catch (IOException e) {
                logger.warn("Unable to delete test project directory: " + e.getMessage());
            }
        }
        projectDir.mkdirs();

        logger.info("Creating new HubConfigImpl instance for host: " + hosts[hostIndex] + "; project directory: " + projectDir);

        HubProjectImpl hubProject = new HubProjectImpl();
        hubProject.createProject(projectDir.getAbsolutePath());

        Properties hostSpecificProperties = new Properties();
        hostSpecificProperties.putAll(gradleProperties);
        hostSpecificProperties.setProperty("mlHost", hosts[hostIndex]);

        HubConfigImpl config = new HubConfigImpl(hubProject);
        config.applyProperties(new SimplePropertySource(hostSpecificProperties));

        config.initHubProject();

        return config;
    }

    @Override
    public PooledObject<HubConfigImpl> wrap(HubConfigImpl obj) {
        return new DefaultPooledObject<>(obj);
    }

    public int getHostCount() {
        return hosts.length;
    }
}
