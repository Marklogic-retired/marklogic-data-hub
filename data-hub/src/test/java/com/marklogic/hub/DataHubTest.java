package com.marklogic.hub;

import static org.junit.Assert.assertTrue;

import java.util.Properties;

import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

public class DataHubTest extends HubTestBase {
    private static String host;
    private static int restPort;
    private static String user;
    private static String password;

    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @BeforeClass
    public static void setup() {
        Properties properties = getProperties();
        host = properties.getProperty("mlHost");
        restPort = Integer.parseInt(properties.getProperty("mlRestPort"));
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");
    }

    @Test
    public void testIsInstalled() {
        DataHub dh = new DataHub(host, restPort, user, password);
        assertTrue(dh.isInstalled());
    }

    @Test
    public void testInstall() {
        DataHub dh = new DataHub(host, restPort, user, password);
        dh.install();
    }

    @Test
    public void testValidateServer() throws ServerValidationException {
        DataHub dh = new DataHub(host, restPort, user, password);
        dh.validateServer();
    }

    @Test
    public void testValidateInvalidServer() throws ServerValidationException {
        DataHub dh = new DataHub("blah", user, password);

        exception.expect(ServerValidationException.class);
        dh.validateServer();
    }
}
