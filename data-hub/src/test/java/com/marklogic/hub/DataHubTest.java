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

import static org.junit.Assert.assertTrue;

import java.util.Properties;

import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

public class DataHubTest extends HubTestBase {
    private static String host;
    private static String user;
    private static String password;

    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @BeforeClass
    public static void setup() {
        Properties properties = getProperties();
        host = properties.getProperty("mlHost");
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");
    }

    @Test
    public void testIsInstalled() {
        DataHub dh = new DataHub(host, user, password);
        assertTrue(dh.isInstalled());
    }

    @Test
    public void testInstall() {
        DataHub dh = new DataHub(host, user, password);
        dh.install();
    }

    @Test
    public void testValidateServer() throws ServerValidationException {
        DataHub dh = new DataHub(host, user, password);
        dh.validateServer();
    }

    @Test
    public void testValidateInvalidServer() throws ServerValidationException {
        DataHub dh = new DataHub("blah", user, password);

        exception.expect(ServerValidationException.class);
        dh.validateServer();
    }
}
