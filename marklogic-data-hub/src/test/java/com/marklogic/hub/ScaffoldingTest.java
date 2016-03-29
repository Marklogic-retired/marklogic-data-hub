package com.marklogic.hub;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.After;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.xml.sax.SAXException;

import com.marklogic.client.io.Format;
import com.marklogic.hub.flow.FlowType;

public class ScaffoldingTest extends HubTestBase {

    private String pluginPath = "./test-ye-plugins";
    private File pluginsDir = new File(pluginPath);

    @BeforeClass
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
    }

    @After
    public void teardown() throws IOException {
        FileUtils.deleteDirectory(pluginsDir);
    }

    @Test
    public void createEntity() {
        assertFalse(pluginsDir.exists());

        Scaffolding.createEntity("my-fun-test", pluginsDir);
        assertTrue(pluginsDir.exists());

        File entityDir = Scaffolding.getEntityDir(pluginsDir, "my-fun-test");
        assertTrue(entityDir.exists());
        assertEquals(
                new File(pluginPath + "/entities/my-fun-test").toPath(),
                entityDir.toPath());

        File flowDir = Scaffolding.getFlowDir(pluginsDir, "my-fun-test", "blah", FlowType.INPUT);
        assertEquals(new File(
                pluginPath + "/entities/my-fun-test/input/blah").toPath(),
                flowDir.toPath());
        assertFalse(flowDir.exists());
    }

    @Test
    public void createXqyInputFlow() throws IOException, SAXException {
        createInputFlow(PluginFormat.XQUERY, Format.XML);
    }

    @Test
    public void createXqyConformanceFlow() throws IOException, SAXException {
        createConformanceFlow(PluginFormat.XQUERY, Format.XML);
    }

    @Test
    public void createSjsInputFlow() throws IOException, SAXException {
        createInputFlow(PluginFormat.JAVASCRIPT, Format.JSON);
    }

    @Test
    public void createSjsConformanceFlow() throws IOException, SAXException {
        createConformanceFlow(PluginFormat.JAVASCRIPT, Format.JSON);
    }

    private void createInputFlow(PluginFormat pluginFormat, Format dataFormat) throws IOException, SAXException {
        assertFalse(pluginsDir.exists());

        Scaffolding.createEntity("my-fun-test", pluginsDir);
        assertTrue(pluginsDir.exists());

        File entityDir = Scaffolding.getEntityDir(pluginsDir, "my-fun-test");
        assertTrue(entityDir.exists());
        assertEquals(new File(pluginPath + "/entities/my-fun-test").toPath(), entityDir.toPath());

        Scaffolding.createFlow("my-fun-test", "test-input", FlowType.INPUT, pluginFormat, dataFormat, pluginsDir);
        File flowDir = Scaffolding.getFlowDir(pluginsDir, "my-fun-test", "test-input", FlowType.INPUT);
        assertEquals(new File(pluginPath + "/entities/my-fun-test/input/test-input").toPath(), flowDir.toPath());
        assertTrue(flowDir.exists());

        File flowDescriptor = new File(flowDir, "test-input.xml");
        assertTrue(flowDescriptor.exists());
        String flowXML ="<flow xmlns=\"http://marklogic.com/data-hub\"><name>test-input</name><entity>my-fun-test</entity><type>input</type><complexity>simple</complexity><data-format>" + dataFormat.getDefaultMimetype() + "</data-format><plugins></plugins></flow>";
        assertXMLEqual(flowXML, IOUtils.toString(new FileInputStream(flowDescriptor)));

        File collectorDir = new File(flowDir, "collector");
        assertFalse(collectorDir.exists());

        File contentDir = new File(flowDir, "content");
        File defaultContent = new File(contentDir, "content." + pluginFormat.toString());
        assertTrue(contentDir.exists());
        assertTrue(defaultContent.exists());

        File headersDir = new File(flowDir, "headers");
        File defaultHeaders= new File(headersDir, "headers." + pluginFormat.toString());
        assertTrue(headersDir.exists());
        assertTrue(defaultHeaders.exists());

        File triplesDir = new File(flowDir, "triples");
        File triplesContent = new File(triplesDir, "triples." + pluginFormat.toString());
        assertTrue(triplesDir.exists());
        assertTrue(triplesContent.exists());
    }

    private void createConformanceFlow(PluginFormat pluginFormat, Format dataFormat) throws IOException, SAXException {
        assertFalse(pluginsDir.exists());

        Scaffolding.createEntity("my-fun-test", pluginsDir);
        assertTrue(pluginsDir.exists());

        File entityDir = Scaffolding.getEntityDir(pluginsDir, "my-fun-test");
        assertTrue(entityDir.exists());
        assertEquals(new File(pluginPath + "/entities/my-fun-test").toPath(), entityDir.toPath());

        Scaffolding.createFlow("my-fun-test", "test-conformance", FlowType.CONFORMANCE, pluginFormat, dataFormat, pluginsDir);
        File flowDir = Scaffolding.getFlowDir(pluginsDir, "my-fun-test", "test-conformance", FlowType.CONFORMANCE);
        assertEquals(new File(pluginPath + "/entities/my-fun-test/conformance/test-conformance").toPath(), flowDir.toPath());
        assertTrue(flowDir.exists());

        File flowDescriptor = new File(flowDir, "test-conformance.xml");
        assertTrue(flowDescriptor.exists());
        String flowXML ="<flow xmlns=\"http://marklogic.com/data-hub\"><name>test-conformance</name><entity>my-fun-test</entity><type>conformance</type><complexity>simple</complexity><data-format>" + dataFormat.getDefaultMimetype() + "</data-format><plugins></plugins></flow>";
        assertXMLEqual(flowXML, IOUtils.toString(new FileInputStream(flowDescriptor)));

        File collectorDir = new File(flowDir, "collector");
        File defaultCollector = new File(collectorDir, "collector." + pluginFormat.toString());
        assertTrue(collectorDir.exists());
        assertTrue(defaultCollector.exists());

        File contentDir = new File(flowDir, "content");
        File defaultContent = new File(contentDir, "content." + pluginFormat.toString());
        assertTrue(contentDir.exists());
        assertTrue(defaultContent.exists());

        File headersDir = new File(flowDir, "headers");
        File defaultHeaders= new File(headersDir, "headers." + pluginFormat.toString());
        assertTrue(headersDir.exists());
        assertTrue(defaultHeaders.exists());

        File triplesDir = new File(flowDir, "triples");
        File triplesContent = new File(triplesDir, "triples." + pluginFormat.toString());
        assertTrue(triplesDir.exists());
        assertTrue(triplesContent.exists());
    }
    
    @Test
    public void createXqyRestExtension() throws IOException {
        String entityName = "my-fun-test";
        String extensionName = "myExtension";
        FlowType flowType = FlowType.CONFORMANCE;
        PluginFormat pluginFormat = PluginFormat.XQUERY;
        try {
            Scaffolding.createRestExtension(entityName, extensionName, flowType, pluginFormat, pluginsDir);
        } catch (ScaffoldingValidationException e) {
            Assert.fail(e.getMessage());
        }
        File restDir = new File(pluginsDir.getAbsolutePath() + "/entities/"+ entityName + "/"+ flowType.name() +"/REST");
        assertTrue(restDir.exists());
        File restServicesDir = new File(restDir, "services");
        assertTrue(restServicesDir.exists());
        File restExtensionFile = new File(restServicesDir, extensionName + "." + pluginFormat);
        assertTrue(restExtensionFile.exists());
        File restExtensionMetadataDir = new File(restServicesDir, "metadata");
        assertTrue(restExtensionMetadataDir.exists());
        File restExtensionMetadataFile = new File(restExtensionMetadataDir, extensionName + ".xml");
        assertTrue(restExtensionMetadataFile.exists());
    }
    
    @Test
    public void createSjsRestExtension() throws IOException {
        String entityName = "my-fun-test";
        String extensionName = "myExtension";
        FlowType flowType = FlowType.INPUT;
        PluginFormat pluginFormat = PluginFormat.JAVASCRIPT;
        try {
            Scaffolding.createRestExtension(entityName, extensionName, flowType, pluginFormat, pluginsDir);
        } catch (ScaffoldingValidationException e) {
            Assert.fail(e.getMessage());
        }
        File restDir = new File(pluginsDir.getAbsolutePath() + "/entities/"+ entityName + "/"+ flowType.name() +"/REST");
        assertTrue(restDir.exists());
        File restServicesDir = new File(restDir, "services");
        assertTrue(restServicesDir.exists());
        File restExtensionFile = new File(restServicesDir, extensionName + "." + pluginFormat);
        assertTrue(restExtensionFile.exists());
        File restExtensionMetadataDir = new File(restServicesDir, "metadata");
        assertTrue(restExtensionMetadataDir.exists());
        File restExtensionMetadataFile = new File(restExtensionMetadataDir, extensionName + ".xml");
        assertTrue(restExtensionMetadataFile.exists());
    }
    
    @Test
    public void createXqyRestTransform() throws IOException {
        String entityName = "my-fun-test";
        String transformName = "myTransform";
        FlowType flowType = FlowType.CONFORMANCE;
        PluginFormat pluginFormat = PluginFormat.XQUERY;
        try {
            Scaffolding.createRestTransform(entityName, transformName, flowType, pluginFormat, pluginsDir);
        } catch (ScaffoldingValidationException e) {
            Assert.fail(e.getMessage());
        }
        File restDir = new File(pluginsDir.getAbsolutePath() + "/entities/"+ entityName + "/"+ flowType.name() +"/REST");
        assertTrue(restDir.exists());
        File restTransformDir = new File(restDir, "transforms");
        assertTrue(restTransformDir.exists());
        File restTransformFile = new File(restTransformDir, transformName + "." + pluginFormat);
        assertTrue(restTransformFile.exists());
    }
    
    @Test
    public void createSjsRestTransform() throws IOException {
        String entityName = "my-fun-test";
        String transformName = "myTransform";
        FlowType flowType = FlowType.CONFORMANCE;
        PluginFormat pluginFormat = PluginFormat.JAVASCRIPT;
        try {
            Scaffolding.createRestTransform(entityName, transformName, flowType, pluginFormat, pluginsDir);
        } catch (ScaffoldingValidationException e) {
            Assert.fail(e.getMessage());
        }
        File restDir = new File(pluginsDir.getAbsolutePath() + "/entities/"+ entityName + "/"+ flowType.name() +"/REST");
        assertTrue(restDir.exists());
        File restTransformDir = new File(restDir, "transforms");
        assertTrue(restTransformDir.exists());
        File restTransformFile = new File(restTransformDir, transformName + "." + pluginFormat);
        assertTrue(restTransformFile.exists());
    }
}
