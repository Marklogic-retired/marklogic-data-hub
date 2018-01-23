package com.marklogic.hub;

import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Properties;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class HubConfigTest extends HubTestBase {

    private static File projectPath = new File(PROJECT_PATH);

    @Before
    public void setup() throws IOException {
        FileUtils.deleteDirectory(projectPath);
        HubConfig config = getHubConfig();
        config.initHubProject();
    }

    @After
    public void teardown() throws IOException {
        FileUtils.deleteDirectory(projectPath);
    }

    private void deleteProp(String key) {
        try {
            File gradleProperties = new File(projectPath, "gradle.properties");
            Properties props = new Properties();
            props.load(new FileInputStream(gradleProperties));
            props.remove(key);
            props.store(new FileOutputStream(gradleProperties), "");
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void writeProp(String key, String value) {
        try {
            File gradleProperties = new File(projectPath, "gradle.properties");
            Properties props = new Properties();
            props.load(new FileInputStream(gradleProperties));
            props.put(key, value);
            props.store(new FileOutputStream(gradleProperties), "");
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void testLoadBalancerProps() {
        deleteProp("mlLoadBalancerHosts");
        assertNull(getHubConfig().loadBalancerHosts);

        writeProp("mlLoadBalancerHosts", "");
        assertNull(getHubConfig().loadBalancerHosts);

        writeProp("mlLoadBalancerHosts", "host1,host2");
        HubConfig config = getHubConfig();
        assertEquals(2, config.loadBalancerHosts.length);
        assertEquals("host1", config.loadBalancerHosts[0]);
        assertEquals("host2", config.loadBalancerHosts[1]);

        writeProp("mlLoadBalancerHosts", "host1");
        config = getHubConfig();
        assertEquals(1, config.loadBalancerHosts.length);
        assertEquals("host1", config.loadBalancerHosts[0]);
    }

}
