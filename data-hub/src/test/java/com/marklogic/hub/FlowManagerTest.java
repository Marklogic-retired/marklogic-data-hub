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

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

import java.io.IOException;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;

import javax.xml.parsers.ParserConfigurationException;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.BeforeClass;
import org.junit.Test;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import com.marklogic.hub.collector.QueryCollector;
import com.marklogic.hub.flow.SimpleFlow;
import com.marklogic.hub.template.ContentTemplate;
import com.marklogic.hub.template.HeaderTemplate;
import com.marklogic.hub.template.RdfTemplate;

public class FlowManagerTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);
    }

    @Test
    public void testSimpleFlowFromXml() throws IOException, ParserConfigurationException, SAXException {
        Document d = getXmlFromResource("flow-manager-test/simple-flow.xml");

        FlowManager fm = new FlowManager();
        SimpleFlow flow = (SimpleFlow)fm.flowFromXml(d);
        assertThat(flow, instanceOf(SimpleFlow.class));
        assertEquals(flow.getName(), "my-test-flow");
        assertNotNull(flow.getCollector());

        assertNotNull(flow.getContentTemplate());
        assertNotNull(flow.getHeaderTemplate());
        assertNotNull(flow.getRdfTemplate());
    }

    @Test
    public void testSimpleFlowToXml() throws IOException, ParserConfigurationException, SAXException {
        SimpleFlow flow = new SimpleFlow("my-test-flow");
        flow.setCollector(new QueryCollector());
        flow.setContentTemplate(new ContentTemplate());
        flow.setHeaderTemplate(new HeaderTemplate());
        flow.setRdfTemplate(new RdfTemplate());
        String expected = getResource("flow-manager-test/simple-flow.xml");
        String actual = flow.serialize();
        System.out.println(actual);
        assertXMLEqual(expected, actual);
//        FlowManager fm = new FlowManager();
//        SimpleFlow flow = (SimpleFlow)fm.flowFromXml(d);
//        assertThat(flow, instanceOf(SimpleFlow.class));
//        assertEquals(flow.getName(), "my-test-flow");
//        assertNotNull(flow.getCollector());
//
//        assertNotNull(flow.getContentTemplate());
//        assertNotNull(flow.getHeaderTemplate());
//        assertNotNull(flow.getRdfTemplate());
    }
}
