package com.marklogic.hub.core;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
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

    private void deleteProp(String key) {
        try {
            File gradleProperties = new File(projectPath, "gradle.properties");
            Properties props = new Properties();
            FileInputStream fis = new FileInputStream(gradleProperties);
            props.load(fis);
            fis.close();
            props.remove(key);
            FileOutputStream fos = new FileOutputStream(gradleProperties);
            props.store(fos, "");
            fos.close();
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }
    private void writeProp(String key, String value) {
        try {
            File gradleProperties = new File(projectPath, "gradle.properties");
            Properties props = new Properties();
            FileInputStream fis = new FileInputStream(gradleProperties);
            props.load(fis);
            fis.close();
            props.put(key, value);
            FileOutputStream fos = new FileOutputStream(gradleProperties);
            props.store(fos, "");
            fos.close();
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    public void testLoadBalancerProps() {
        deleteProp("mlLoadBalancerHosts");
        assertNull(getHubConfig().getLoadBalancerHosts());

        writeProp("mlLoadBalancerHosts", "");
        assertNull(getHubConfig().getLoadBalancerHosts());

        writeProp("mlLoadBalancerHosts", "host1,host2");
        HubConfig config = getHubConfig();
        assertEquals(2, config.getLoadBalancerHosts().length);
        assertEquals("host1", config.getLoadBalancerHosts()[0]);
        assertEquals("host2", config.getLoadBalancerHosts()[1]);

        writeProp("mlLoadBalancerHosts", "host1");
        config = getHubConfig();
        assertEquals(1, config.getLoadBalancerHosts().length);
        assertEquals("host1", config.getLoadBalancerHosts()[0]);
    }

}
