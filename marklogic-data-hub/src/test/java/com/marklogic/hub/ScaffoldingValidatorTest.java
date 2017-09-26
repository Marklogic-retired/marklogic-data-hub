package com.marklogic.hub;

import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.scaffold.ScaffoldingValidator;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.*;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class ScaffoldingValidatorTest extends HubTestBase {

   private static final String projectPath = "./test-project";
   private static final String TEST_ENTITY_NAME = "test-entity";
   private Scaffolding scaffolding = new Scaffolding(projectPath, stagingClient);
   private ScaffoldingValidator validator = new ScaffoldingValidator(projectPath);

   @BeforeClass
   public static void setupClass() throws IOException {
       XMLUnit.setIgnoreWhitespace(true);
   }

   @Before
   public void setup() throws IOException {
       FileUtils.deleteDirectory(new File(projectPath));
       createPlugins(TEST_ENTITY_NAME, FlowType.INPUT, CodeFormat.XQUERY);
       createPlugins(TEST_ENTITY_NAME, FlowType.HARMONIZE, CodeFormat.XQUERY);
   }

   @After
   public void teardown() throws IOException {
       FileUtils.deleteDirectory(new File(projectPath));
   }

   private void createPlugins(String entityName, FlowType flowType, CodeFormat codeFormat) throws IOException {

       String flowName = entityName + flowType + "-flow";
       String flowTypePath = Scaffolding.getAbsolutePath(projectPath, "entities", entityName, flowType.toString());
       String flowPath = Scaffolding.getAbsolutePath(flowTypePath, flowName);

       List<Plugin> plugins = new ArrayList<>();
       if (flowType.equals(FlowType.HARMONIZE)) {
           plugins.add(createPluginObj(flowPath, "collector", flowType, codeFormat));
       }
       plugins.add(createPluginObj(flowPath, "content", flowType, codeFormat));
       plugins.add(createPluginObj(flowPath, "headers", flowType, codeFormat));
       plugins.add(createPluginObj(flowPath, "triples", flowType, codeFormat));

       for (Plugin plugin : plugins) {
           createFile(plugin.getParentDirectory(), plugin.getFilename(), plugin.getTemplateFilePath());
       }
   }

   private Plugin createPluginObj(String flowPath, String pluginType, FlowType flowType, CodeFormat codeFormat) {
       String parentDirectory = Scaffolding.getAbsolutePath(flowPath, pluginType);
       String filename = pluginType + "." + codeFormat;
       String templateFilePath = "scaffolding/" + flowType + "/" + codeFormat + "/" + pluginType + "." + codeFormat;
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
       FileUtil.copy(inputStream, dstFile.toFile());
   }

   @Test
   public void testIsUniqueRestServiceExtension() throws IOException {
       String restServiceExtensionName = "test-rest-service";
       boolean isUnique = validator.isUniqueRestServiceExtension(restServiceExtensionName);
       assertTrue("The rest service extension "+ restServiceExtensionName + " is not yet existing so it should be unique.", isUnique);
       try {
           scaffolding.createRestExtension(TEST_ENTITY_NAME, restServiceExtensionName, FlowType.HARMONIZE, CodeFormat.XQUERY);
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
           scaffolding.createRestTransform(TEST_ENTITY_NAME, restTransformName, FlowType.HARMONIZE, CodeFormat.XQUERY);
       } catch (ScaffoldingValidationException e) {
           Assert.fail(e.getMessage());
       }
       isUnique = validator.isUniqueRestTransform(restTransformName);
       assertFalse("At this point, the rest service extension "+ restTransformName + " is already existing so it should not be unique.", isUnique);
   }
}
