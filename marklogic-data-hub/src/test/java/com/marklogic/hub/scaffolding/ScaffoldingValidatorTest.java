/*
 * Copyright 2012-2019 MarkLogic Corporation
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

package com.marklogic.hub.scaffolding;

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.impl.ScaffoldingValidator;
import com.marklogic.hub.impl.ScaffoldingImpl;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class ScaffoldingValidatorTest extends HubTestBase {

   private static final String projectPath = PROJECT_PATH;
   private static final String TEST_ENTITY_NAME = "test-entity";

   @Autowired
   private Scaffolding scaffolding;

   @Autowired
   private ScaffoldingValidator validator;

   @BeforeAll
   public static void setupClass() throws IOException {
       XMLUnit.setIgnoreWhitespace(true);
   }

   @BeforeEach
   public void setup() throws IOException {
       deleteProjectDir();
       createPlugins(TEST_ENTITY_NAME, FlowType.INPUT, CodeFormat.XQUERY);
       createPlugins(TEST_ENTITY_NAME, FlowType.HARMONIZE, CodeFormat.XQUERY);
   }

   @AfterEach
   public void teardownDir() throws IOException {
       FileUtils.deleteDirectory(new File(projectPath));
   }

   private void createPlugins(String entityName, FlowType flowType, CodeFormat codeFormat) throws IOException {

       String flowName = entityName + flowType + "-flow";
       String flowTypePath = ScaffoldingImpl.getAbsolutePath(projectPath, "plugins", "entities", entityName, flowType.toString());
       String flowPath = ScaffoldingImpl.getAbsolutePath(flowTypePath, flowName);

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
       String parentDirectory = ScaffoldingImpl.getAbsolutePath(flowPath, pluginType);
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
       assertTrue(isUnique, "The rest service extension "+ restServiceExtensionName + " is not yet existing so it should be unique.");
       try {
           scaffolding.createRestExtension(TEST_ENTITY_NAME, restServiceExtensionName, FlowType.HARMONIZE, CodeFormat.XQUERY);
       } catch (ScaffoldingValidationException e) {
           fail(e.getMessage());
       }
       isUnique = validator.isUniqueRestServiceExtension(restServiceExtensionName);
       assertFalse(isUnique, "At this point, the rest service extension "+ restServiceExtensionName + " is already existing so it should not be unique.");
   }

   @Test
   public void testIsUniqueRestTransform() throws IOException {
       String restTransformName = "test-rest-transform";
       boolean isUnique = validator.isUniqueRestTransform(restTransformName);
       assertTrue(isUnique, "The rest transform "+ restTransformName + " is not yet existing so it should be unique.");
       try {
           scaffolding.createRestTransform(TEST_ENTITY_NAME, restTransformName, FlowType.HARMONIZE, CodeFormat.XQUERY);
       } catch (ScaffoldingValidationException e) {
           fail(e.getMessage());
       }
       isUnique = validator.isUniqueRestTransform(restTransformName);
       assertFalse(isUnique, "At this point, the rest service extension "+ restTransformName + " is already existing so it should not be unique.");
   }
}
