package com.marklogic.hub;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.plugin.PluginFormat;
import com.marklogic.hub.scaffold.Scaffolding;
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

    Path projectPath = Paths.get("./test-ye-project").toAbsolutePath();
    private File projectDir = projectPath.toFile();
    private File pluginDir = projectPath.resolve("plugins").toFile();

    @BeforeClass
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
    }

    @After
    public void teardown() throws IOException {
        FileUtils.deleteDirectory(projectDir);
    }

    @Test
    public void createEntity() throws FileNotFoundException {
        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        scaffolding.createEntity("my-fun-test");
        assertTrue(projectDir.exists());

        Path entityDir = scaffolding.getEntityDir("my-fun-test");
        assertTrue(entityDir.toFile().exists());
        assertEquals(
                Paths.get(pluginDir.toString(), "entities", "my-fun-test"),
                entityDir);

        Path flowDir = scaffolding.getFlowDir("my-fun-test", "blah", FlowType.INPUT);
        assertEquals(Paths.get(pluginDir.toString(), "entities", "my-fun-test", "input", "blah"),
                flowDir);
        assertFalse(flowDir.toFile().exists());
    }

    @Test
    public void createXqyInputFlow() throws IOException, SAXException {
        createInputFlow(PluginFormat.XQUERY, Format.XML);
    }

    @Test
    public void createXqyHarmonizeFlow() throws IOException, SAXException {
        createHarmonizeFlow(PluginFormat.XQUERY, Format.XML);
    }

    @Test
    public void createSjsInputFlow() throws IOException, SAXException {
        createInputFlow(PluginFormat.JAVASCRIPT, Format.JSON);
    }

    @Test
    public void createSjsHarmonizeFlow() throws IOException, SAXException {
        createHarmonizeFlow(PluginFormat.JAVASCRIPT, Format.JSON);
    }

    private void createInputFlow(PluginFormat pluginFormat, Format dataFormat) throws IOException, SAXException {
        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        scaffolding.createEntity("my-fun-test");
        assertTrue(projectDir.exists());

        Path entityDir = scaffolding.getEntityDir("my-fun-test");
        assertTrue(entityDir.toFile().exists());
        assertEquals(Paths.get(pluginDir.toString(), "entities", "my-fun-test"), entityDir);

        scaffolding.createFlow("my-fun-test", "test-input", FlowType.INPUT, pluginFormat, dataFormat);
        Path flowDir = scaffolding.getFlowDir("my-fun-test", "test-input", FlowType.INPUT);
        assertEquals(Paths.get(pluginDir.toString(), "entities", "my-fun-test", "input", "test-input"), flowDir);
        assertTrue(flowDir.toFile().exists());

        Path flowDescriptor = flowDir.resolve("test-input.xml");
        assertTrue(flowDescriptor.toFile().exists());
        String flowXML ="<flow xmlns=\"http://marklogic.com/data-hub\"><complexity>simple</complexity><data-format>" + dataFormat.getDefaultMimetype() + "</data-format><plugins></plugins></flow>";
        FileInputStream fs = new FileInputStream(flowDescriptor.toFile());
        assertXMLEqual(flowXML, IOUtils.toString(fs));
        fs.close();

        Path collectorDir = flowDir.resolve("collector");
        assertFalse(collectorDir.toFile().exists());

        Path contentDir = flowDir.resolve("content");
        Path defaultContent = contentDir.resolve("content." + pluginFormat.toString());
        assertTrue(contentDir.toFile().exists());
        assertTrue(defaultContent.toFile().exists());

        Path headersDir = flowDir.resolve("headers");
        Path defaultHeaders= headersDir.resolve("headers." + pluginFormat.toString());
        assertTrue(headersDir.toFile().exists());
        assertTrue(defaultHeaders.toFile().exists());

        Path triplesDir = flowDir.resolve("triples");
        Path triplesContent = triplesDir.resolve("triples." + pluginFormat.toString());
        assertTrue(triplesDir.toFile().exists());
        assertTrue(triplesContent.toFile().exists());
    }

    private void createHarmonizeFlow(PluginFormat pluginFormat, Format dataFormat) throws IOException, SAXException {
        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        scaffolding.createEntity("my-fun-test");
        assertTrue(projectDir.exists());

        Path entityDir = scaffolding.getEntityDir("my-fun-test");
        assertTrue(entityDir.toFile().exists());
        assertEquals(Paths.get(pluginDir.toString(), "entities", "my-fun-test"), entityDir);

        scaffolding.createFlow("my-fun-test", "test-harmonize", FlowType.HARMONIZE, pluginFormat, dataFormat);
        Path flowDir = scaffolding.getFlowDir("my-fun-test", "test-harmonize", FlowType.HARMONIZE);
        assertEquals(Paths.get(pluginDir.toString(), "entities", "my-fun-test", "harmonize", "test-harmonize"), flowDir);
        assertTrue(flowDir.toFile().exists());

        Path flowDescriptor = flowDir.resolve("test-harmonize.xml");
        assertTrue(flowDescriptor.toFile().exists());
        String flowXML ="<flow xmlns=\"http://marklogic.com/data-hub\"><complexity>simple</complexity><data-format>" + dataFormat.getDefaultMimetype() + "</data-format><plugins></plugins></flow>";
        FileInputStream fs = new FileInputStream(flowDescriptor.toFile());
        assertXMLEqual(flowXML, IOUtils.toString(fs));
        fs.close();

        Path collectorDir = flowDir.resolve("collector");
        Path defaultCollector = collectorDir.resolve("collector." + pluginFormat.toString());
        assertTrue(collectorDir.toFile().exists());
        assertTrue(defaultCollector.toFile().exists());

        Path contentDir = flowDir.resolve("content");
        Path defaultContent = contentDir.resolve("content." + pluginFormat.toString());
        assertTrue(contentDir.toFile().exists());
        assertTrue(defaultContent.toFile().exists());

        Path headersDir = flowDir.resolve("headers");
        Path defaultHeaders = headersDir.resolve("headers." + pluginFormat.toString());
        assertTrue(headersDir.toFile().exists());
        assertTrue(defaultHeaders.toFile().exists());

        Path triplesDir = flowDir.resolve("triples");
        Path triplesContent = triplesDir.resolve("triples." + pluginFormat.toString());
        assertTrue(triplesDir.toFile().exists());
        assertTrue(triplesContent.toFile().exists());
    }

    @Test
    public void createXqyRestExtension() throws IOException {
        String entityName = "my-fun-test";
        String extensionName = "myExtension";
        FlowType flowType = FlowType.HARMONIZE;
        PluginFormat pluginFormat = PluginFormat.XQUERY;
        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        try {
            scaffolding.createRestExtension(entityName, extensionName, flowType, pluginFormat);
        } catch (ScaffoldingValidationException e) {
            Assert.fail(e.getMessage());
        }
        Path restDir = Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), "REST").toAbsolutePath().normalize();
        assertTrue(restDir.toFile().exists());
        Path restServicesDir = restDir.resolve("services");
        assertTrue(restServicesDir.toFile().exists());
        Path restExtensionFile = restServicesDir.resolve(extensionName + "." + pluginFormat);
        assertTrue(restExtensionFile.toFile().exists());
        Path restExtensionMetadataDir = restServicesDir.resolve("metadata");
        assertTrue(restExtensionMetadataDir.toFile().exists());
        Path restExtensionMetadataFile = restExtensionMetadataDir.resolve(extensionName + ".xml");
        assertTrue(restExtensionMetadataFile.toFile().exists());
    }

    @Test
    public void createSjsRestExtension() throws IOException {
        String entityName = "my-fun-test";
        String extensionName = "myExtension";
        FlowType flowType = FlowType.INPUT;
        PluginFormat pluginFormat = PluginFormat.JAVASCRIPT;
        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        try {
            scaffolding.createRestExtension(entityName, extensionName, flowType, pluginFormat);
        } catch (ScaffoldingValidationException e) {
            Assert.fail(e.getMessage());
        }
        Path restDir = Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), "REST").toAbsolutePath().normalize();
        assertTrue(restDir.toFile().exists());
        Path restServicesDir = restDir.resolve("services");
        assertTrue(restServicesDir.toFile().exists());
        Path restExtensionFile = restServicesDir.resolve(extensionName + "." + pluginFormat);
        assertTrue(restExtensionFile.toFile().exists());
        Path restExtensionMetadataDir = restServicesDir.resolve("metadata");
        assertTrue(restExtensionMetadataDir.toFile().exists());
        Path restExtensionMetadataFile = restExtensionMetadataDir.resolve(extensionName + ".xml");
        assertTrue(restExtensionMetadataFile.toFile().exists());
    }

    @Test
    public void createXqyRestTransform() throws IOException {
        String entityName = "my-fun-test";
        String transformName = "myTransform";
        FlowType flowType = FlowType.HARMONIZE;
        PluginFormat pluginFormat = PluginFormat.XQUERY;
        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        try {
            scaffolding.createRestTransform(entityName, transformName, flowType, pluginFormat);
        } catch (ScaffoldingValidationException e) {
            Assert.fail(e.getMessage());
        }
        Path restDir = Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), "REST").toAbsolutePath().normalize();
        assertTrue(restDir.toFile().exists());
        Path restTransformDir = restDir.resolve("transforms");
        assertTrue(restTransformDir.toFile().exists());
        Path restTransformFile = restTransformDir.resolve(transformName + "." + pluginFormat);
        assertTrue(restTransformFile.toFile().exists());
    }

    @Test
    public void createSjsRestTransform() throws IOException {
        String entityName = "my-fun-test";
        String transformName = "myTransform";
        FlowType flowType = FlowType.HARMONIZE;
        PluginFormat pluginFormat = PluginFormat.JAVASCRIPT;
        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        try {
            scaffolding.createRestTransform(entityName, transformName, flowType, pluginFormat);
        } catch (ScaffoldingValidationException e) {
            Assert.fail(e.getMessage());
        }
        Path restDir = Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), "REST").toAbsolutePath().normalize();
        assertTrue(restDir.toFile().exists());
        Path restTransformDir = restDir.resolve("transforms");
        assertTrue(restTransformDir.toFile().exists());
        Path restTransformFile = restTransformDir.resolve(transformName + "." + pluginFormat);
        assertTrue(restTransformFile.toFile().exists());
    }
}
