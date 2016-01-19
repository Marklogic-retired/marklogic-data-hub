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

import java.io.IOException;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.xml.sax.SAXException;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.extractors.XpathExtractor;
import com.marklogic.hub.functions.FunctionFactory;
import com.marklogic.hub.runners.FlowRunner;
import com.marklogic.hub.transformers.EnvelopeTransformer;

public class FlowTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");

        // install document to transform
        installDoc("/test-dir/test1.xml", meta, getResource("flow-test/employee-1.xml"));
    }

    @AfterClass
    public static void cleanup() {
        docMgr.delete("/test-dir/test1.xml");
    }

    @Test
    public void runFlow() throws SAXException, IOException {
        FlowRunner runner = new FlowRunner(client);

        XpathExtractor extractor = new XpathExtractor("/e:employee/e:hire_date", "hire-date");
        extractor.addFunction(FunctionFactory.newParseDate("[M01]/[D01]/[Y0001]"));

        EnvelopeOptions options = new EnvelopeOptions();
        options.addExtractor(extractor);

        Transformer transformer = new EnvelopeTransformer();
        transformer.options = options;

        Flow flow = new Flow();
        flow.addNamespace(new Namespace("e", "http://company.com/employee"));
        flow.addTransformer(transformer);

        String doc = runner.runServerTransformers(flow, "/test-dir/test1.xml");
        assertXMLEqual(getResource("flow-test/final-doc.xml"), doc);
    }
}