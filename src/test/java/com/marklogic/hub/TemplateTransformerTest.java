package com.marklogic.hub;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;

import java.io.IOException;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.xml.sax.SAXException;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.runners.TransformerRunner;

public class TemplateTransformerTest extends HubTestBase {
    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");

        // install document to transform
        installDoc("/test-dir/test1.xml", meta, getResource("template-transformer-test/employee-1.xml"));

        // install template
        installModule("/templates/template-1.xml", getResource("template-transformer-test/template-1.xml"));

        // install a flow
        installModule("/flows/flow-with-collection.xml", getResource("template-transformer-test/flow-with-collection.xml"));
    }

    @AfterClass
    public static void cleanup() {
        docMgr.delete("/test-dir/test1.xml");
        uninstallModule("/templates/template-1.xml");
        uninstallModule("/flows/flow-with-collection.xml");
    }

    @Test
    public void testRunTransformer() throws SAXException, IOException {
        TemplateOptions options = new TemplateOptions();
        options.setTemplate("template-1.xml");
        options.addNameSpace(new Namespace("e", "http://company.com/employee"));

        TransformerRunner t = new TransformerRunner(client, "template.xqy");
        String output = t.run("/test-dir/test1.xml", options);
        assertXMLEqual(getResource("template-transformer-test/final-doc.xml"), output);
    }

//    @Test
//    public void testRunTransformerFromFlow() throws SAXException, IOException {
//        TransformerRunner t = new TransformerRunner(client);
//        String output = t.runWithFlow("flow-with-collection", "/test-dir/test1.xml");
//        assertXMLEqual(getResource("template-transformer-test/final-doc.xml"), output);
//    }
}
