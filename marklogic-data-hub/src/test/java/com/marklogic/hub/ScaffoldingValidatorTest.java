package com.marklogic.hub;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import com.marklogic.hub.flow.FlowType;

public class ScaffoldingValidatorTest extends HubTestBase {

   private static final String projectPath = "./test-project";
   private static final String TEST_ENTITY_NAME = "test-entity";
   private Scaffolding scaffolding = new Scaffolding(projectPath);
   private ScaffoldingValidator validator = new ScaffoldingValidator(projectPath);

   @BeforeClass
   public static void setupClass() throws IOException {
       XMLUnit.setIgnoreWhitespace(true);
   }

   @Before
   public void setup() throws IOException {
       PluginFormat pluginFormat = PluginFormat.XQUERY;
       createPlugins(TEST_ENTITY_NAME, FlowType.INPUT, pluginFormat);
       createPlugins(TEST_ENTITY_NAME, FlowType.HARMONIZE, pluginFormat);
   }

   @After
   public void teardown() throws IOException {
       FileUtils.deleteDirectory(new File(projectPath));
   }

   private void createPlugins(String entityName, FlowType flowType, PluginFormat pluginFormat) throws IOException {

       String flowName = entityName + flowType + "-flow";
       String flowTypePath = Scaffolding.getAbsolutePath(projectPath, "entities", entityName, flowType.toString());
       String flowPath = Scaffolding.getAbsolutePath(flowTypePath, flowName);

       List<Plugin> plugins = new ArrayList<>();
       if (flowType.equals(FlowType.HARMONIZE)) {
           plugins.add(createPluginObj(flowPath, "collector", flowType, pluginFormat));
       }
       plugins.add(createPluginObj(flowPath, "content", flowType, pluginFormat));
       plugins.add(createPluginObj(flowPath, "headers", flowType, pluginFormat));
       plugins.add(createPluginObj(flowPath, "triples", flowType, pluginFormat));

       for (Plugin plugin : plugins) {
           createFile(plugin.getParentDirectory(), plugin.getFilename(), plugin.getTemplateFilePath());
       }
   }

   private Plugin createPluginObj(String flowPath, String pluginType, FlowType flowType, PluginFormat pluginFormat) {
       String parentDirectory = Scaffolding.getAbsolutePath(flowPath, pluginType);
       String filename = pluginType + "." + pluginFormat;
       String templateFilePath = "scaffolding/" + flowType + "/" + pluginFormat + "/" + pluginType + "." + pluginFormat;
       return new Plugin(parentDirectory, filename, templateFilePath);
   }

   private class Plugin {

       private String parentDirectory;
       private String filename;
       private String templateFilePath;

       public Plugin(String parentDirectory, String filename, String templateFilePath) {
           this.parentDirectory = parentDirectory;
           this.filename = filename;
           this.templateFilePath = templateFilePath;
       }

       public String getParentDirectory() {
           return parentDirectory;
       }

       public String getFilename() {
           return filename;
       }

       public String getTemplateFilePath() {
           return templateFilePath;
       }
   }

   private static void createFile(String parentDirectory, String filename, String templateFilePath) throws IOException {
       File parentDirectoryFile = new File(parentDirectory);
       parentDirectoryFile.mkdirs();
       writeFile(templateFilePath, Paths.get(parentDirectoryFile.getPath(), filename));
   }

   private static void writeFile(String srcFile, Path dstFile)
           throws IOException {
       InputStream inputStream = Scaffolding.class.getClassLoader()
               .getResourceAsStream(srcFile);
       Files.copy(inputStream, dstFile);
   }

   @Test
   public void testIsUniqueRestServiceExtension() throws IOException {
       String restServiceExtensionName = "test-rest-service";
       boolean isUnique = validator.isUniqueRestServiceExtension(restServiceExtensionName);
       assertTrue("The rest service extension "+ restServiceExtensionName + " is not yet existing so it should be unique.", isUnique);
       try {
           scaffolding.createRestExtension(TEST_ENTITY_NAME, restServiceExtensionName, FlowType.HARMONIZE, PluginFormat.XQUERY);
       } catch (ScaffoldingValidationException e) {
           Assert.fail(e.getMessage());
       }
       isUnique = validator.isUniqueRestServiceExtension(restServiceExtensionName);
       assertFalse("At this point, the rest service extension "+ restServiceExtensionName + " is already existing so it should not be unique.", isUnique);
   }

   @Test
   public void testIsUniqueRestTransform() throws IOException {
       String restTransformName = "test-rest-transform";
       boolean isUnique = validator.isUniqueRestTransform(restTransformName);
       assertTrue("The rest transform "+ restTransformName + " is not yet existing so it should be unique.", isUnique);
       try {
           scaffolding.createRestTransform(TEST_ENTITY_NAME, restTransformName, FlowType.HARMONIZE, PluginFormat.XQUERY);
       } catch (ScaffoldingValidationException e) {
           Assert.fail(e.getMessage());
       }
       isUnique = validator.isUniqueRestTransform(restTransformName);
       assertFalse("At this point, the rest service extension "+ restTransformName + " is already existing so it should not be unique.", isUnique);
   }
}
