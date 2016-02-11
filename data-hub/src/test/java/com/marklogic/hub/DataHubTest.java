/*
 * Copyright 2012-2016 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
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
    public void testInstall() throws IOException {
        DataHub dh = new DataHub(host, restPort, user, password);
        if (dh.isInstalled()) {
            // uninstall first
            dh.uninstall();
        }

        assertFalse(dh.isInstalled());
        dh.install();
        assertTrue(dh.isInstalled());
    }

    @Test
    public void testUnInstall() throws IOException {
        DataHub dh = new DataHub(host, restPort, user, password);
        if (false == dh.isInstalled()) {
            // uninstall first
            dh.install();
        }
        assertTrue(dh.isInstalled());
        dh.uninstall();
        assertFalse(dh.isInstalled());
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
