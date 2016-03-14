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

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

import java.io.IOException;

import javax.xml.parsers.ParserConfigurationException;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.xml.sax.SAXException;

import com.marklogic.client.modulesloader.impl.PropertiesModuleManager;

public class DataHubTest extends HubTestBase {
    @Rule
    public final ExpectedException exception = ExpectedException.none();


    @BeforeClass
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
    }

    @Test
    public void testValidateServer() throws ServerValidationException {
        DataHub dh = new DataHub(host, stagingPort, finalPort, user, password);
        dh.validateServer();
    }

    @Test
    public void testValidateInvalidServer() throws ServerValidationException {
        DataHub dh = new DataHub("blah", user, password);

        exception.expect(ServerValidationException.class);
        dh.validateServer();
    }

    @Test
    public void testInstallUserModules() throws IOException, ParserConfigurationException, SAXException {
        DataHub dh = new DataHub(host, stagingPort, finalPort, user, password);
        if (dh.isInstalled()) {
            dh.uninstall();
        }
        if (false == dh.isInstalled()) {
            dh.install();
        }
        String path = DataHubTest.class.getClassLoader().getResource("data-hub-test").getPath();

        PropertiesModuleManager modulesManager = new PropertiesModuleManager();
        modulesManager.deletePropertiesFile();

        dh.installUserModules(path);

        assertEquals(
                getResource("data-hub-test/entities/test-entity/conformance/final/collector/collector.xqy"),
                getModulesFile("/entities/test-entity/conformance/final/collector/collector.xqy"));
        assertEquals(
                getResource("data-hub-test/entities/test-entity/conformance/final/content/content.xqy"),
                getModulesFile("/entities/test-entity/conformance/final/content/content.xqy"));
        assertEquals(
                getResource("data-hub-test/entities/test-entity/conformance/final/headers/headers.xqy"),
                getModulesFile("/entities/test-entity/conformance/final/headers/headers.xqy"));
        assertEquals(
                getResource("data-hub-test/entities/test-entity/conformance/final/triples/triples.xqy"),
                getModulesFile("/entities/test-entity/conformance/final/triples/triples.xqy"));

        assertXMLEqual(
                getXmlFromResource("data-hub-test/entities/test-entity/conformance/final/final.xml"),
                getModulesDocument("/entities/test-entity/conformance/final/final.xml"));


        assertEquals(
                getResource("data-hub-test/entities/test-entity/input/hl7/content/content.xqy"),
                getModulesFile("/entities/test-entity/input/hl7/content/content.xqy"));
        assertEquals(
                getResource("data-hub-test/entities/test-entity/input/hl7/headers/headers.xqy"),
                getModulesFile("/entities/test-entity/input/hl7/headers/headers.xqy"));
        assertEquals(
                getResource("data-hub-test/entities/test-entity/input/hl7/triples/triples.xqy"),
                getModulesFile("/entities/test-entity/input/hl7/triples/triples.xqy"));
        assertXMLEqual(
                getXmlFromResource("data-hub-test/entities/test-entity/input/hl7/hl7.xml"),
                getModulesDocument("/entities/test-entity/input/hl7/hl7.xml"));

        assertXMLEqual(
                getXmlFromResource("data-hub-test/entities/test-entity/input/REST/options/doctors.xml"),
                getModulesDocument("/Default/data-hub-STAGING/rest-api/options/doctors.xml"));

        assertXMLEqual(
                getXmlFromResource("data-hub-test/entities/test-entity/conformance/REST/options/patients.xml"),
                getModulesDocument("/Default/data-hub-FINAL/rest-api/options/patients.xml"));


        assertXMLEqual(
                getXmlFromResource("data-hub-helpers/test-conf-metadata.xml"),
                getModulesDocument("/marklogic.rest.transform/test-conf-transform/assets/metadata.xml"));
        assertEquals(
                getResource("data-hub-test/entities/test-entity/conformance/REST/transforms/test-conf-transform.xqy"),
                getModulesFile("/marklogic.rest.transform/test-conf-transform/assets/transform.xqy"));

        assertXMLEqual(
                getXmlFromResource("data-hub-helpers/test-input-metadata.xml"),
                getModulesDocument("/marklogic.rest.transform/test-input-transform/assets/metadata.xml"));
        assertEquals(
                getResource("data-hub-test/entities/test-entity/input/REST/transforms/test-input-transform.xqy"),
                getModulesFile("/marklogic.rest.transform/test-input-transform/assets/transform.xqy"));

        dh.uninstall();
        assertFalse(dh.isInstalled());

    }
}
