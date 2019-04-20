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
package com.marklogic.hub.impl;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Component
public class ScaffoldingImpl implements Scaffolding {

    @Autowired
    private HubProject project;

    @Autowired
    HubConfig hubConfig;

    @Autowired
    private ScaffoldingValidator validator;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public static String getAbsolutePath(String first, String... more) {
        StringBuilder absolutePath = new StringBuilder(first);
        for (String path : more) {
            absolutePath.append(File.separator);
            absolutePath.append(path);
        }
        return absolutePath.toString();
    }

    @Override public Path getLegacyFlowDir(String entityName, String flowName, FlowType flowType) {
        Path entityDir = project.getEntityDir(entityName);
        Path typeDir = entityDir.resolve(flowType.toString());
        Path flowDir = typeDir.resolve(flowName);
        return flowDir;
    }

    @Override public void createEntity(String entityName) {
        Path entityDir = project.getHubEntitiesDir();
        File entityDirFile = entityDir.toFile();
        if(!entityDirFile.exists()){
            entityDirFile.mkdirs();
        }
        String fileContents = getFileContent("scaffolding/Entity.json", entityName);
        writeToFile(fileContents, entityDir.resolve(entityName + ".entity.json").toFile());
    }

    @Override public void createLegacyMappingDir(String mappingName) {
        Path mappingDir = project.getLegacyMappingDir(mappingName);
        mappingDir.toFile().mkdirs();
    }

    @Override public void createMappingDir(String mappingName) {
        Path mappingDir = project.getMappingDir(mappingName);
        mappingDir.toFile().mkdirs();
    }

    @Override
    public void createCustomModule(String stepName, String stepType) {
        Path customModuleDir = project.getCustomModuleDir(stepName, stepType.toLowerCase());
        customModuleDir.toFile().mkdirs();

        if (customModuleDir.toFile().exists()) {
            String moduleScaffoldingSrcFile = "scaffolding/custom-module/main.sjs";
            InputStream inputStream = ScaffoldingImpl.class.getClassLoader().getResourceAsStream(moduleScaffoldingSrcFile);
            File moduleFile = customModuleDir.resolve("main.sjs").toFile();

            try {
                FileUtils.copyInputStreamToFile(inputStream, moduleFile);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    @Override
    public void createDefaultFlow(String flowName) {
        Path flowsDir = project.getFlowsDir();
        flowsDir.toFile().mkdirs();
        File flowFile = flowsDir.resolve(flowName + ".flow.json").toFile();

        Map<String, String> customTokens = new HashMap<>();
        customTokens.put("%%mlStagingDbName%%", hubConfig.getDbName(DatabaseKind.STAGING));
        customTokens.put("%%mlFinalDbName%%", hubConfig.getDbName(DatabaseKind.FINAL));
        customTokens.put("%%mlFlowName%%", flowName);

        if (flowsDir.toFile().exists()) {
            String flowSrcFile = "scaffolding/defaultFlow.flow.json";
            InputStream inputStream = ScaffoldingImpl.class.getClassLoader().getResourceAsStream(flowSrcFile);
            try {
                String fileContents = IOUtils.toString(inputStream);
                for (String key : customTokens.keySet()) {

                    String value = customTokens.get(key);
                    if (value != null) {
                        fileContents = fileContents.replace(key, value);
                    }
                }
                FileWriter writer = new FileWriter(flowFile);
                writer.write(fileContents);
                writer.close();
            }
            catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    @Override public void createLegacyFlow(String entityName, String flowName,
                                           FlowType flowType, CodeFormat codeFormat,
                                           DataFormat dataFormat) {
        createLegacyFlow(entityName, flowName, flowType, codeFormat, dataFormat, true);
    }

    @Override public void createLegacyFlow(String entityName, String flowName,
                                           FlowType flowType, CodeFormat codeFormat,
                                           DataFormat dataFormat, boolean useEsModel) {
        createLegacyFlow(entityName, flowName, flowType, codeFormat, dataFormat, useEsModel, null);
    }

    @Override public void createLegacyFlow(String entityName, String flowName,
                                           FlowType flowType, CodeFormat codeFormat,
                                           DataFormat dataFormat, boolean useEsModel, String mappingNameWithVersion) {
        try {
            Path flowDir = getLegacyFlowDir(entityName, flowName, flowType);
            flowDir.toFile().mkdirs();

            if (useEsModel) {
                ContentPlugin cp = new ContentPlugin(hubConfig.newStagingClient());
                String content = cp.getContents(entityName, codeFormat, flowType, mappingNameWithVersion);
                writeBuffer(content, flowDir.resolve("content." + codeFormat));
            } else {
                writeFile("scaffolding/" + flowType + "/" + codeFormat + "/content." + codeFormat,
                    flowDir.resolve("content." + codeFormat));
            }

            if (flowType.equals(FlowType.HARMONIZE)) {
                writeFile("scaffolding/" + flowType + "/" + codeFormat + "/collector." + codeFormat,
                    flowDir.resolve("collector." + codeFormat));

                writeFile("scaffolding/" + flowType + "/" + codeFormat + "/writer." + codeFormat,
                    flowDir.resolve("writer." + codeFormat));
            }

            writeFile("scaffolding/" + flowType + "/" + codeFormat + "/headers." + codeFormat,
                flowDir.resolve("headers." + codeFormat));

            writeFile("scaffolding/" + flowType + "/" + codeFormat + "/triples." + codeFormat,
                flowDir.resolve("triples." + codeFormat));


            writeFile("scaffolding/" + flowType + "/" + codeFormat + "/main." + codeFormat,
                flowDir.resolve("main." + codeFormat));

            LegacyFlow flow = LegacyFlowBuilder.newFlow()
                .withEntityName(entityName)
                .withName(flowName)
                .withType(flowType)
                .withCodeFormat(codeFormat)
                .withDataFormat(dataFormat)
                .withMapping(mappingNameWithVersion)
                .build();

            FileWriter fw = new FileWriter(flowDir.resolve(flowName + ".properties").toFile());
            flow.toProperties().store(fw, "");
            fw.close();
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Document readLegacyFlowXml(File file) {
        try {
            FileInputStream is = new FileInputStream(file);
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            return builder.parse(is);
        }
        catch(IOException | ParserConfigurationException | SAXException e) {
            throw new RuntimeException(e);
        }
    }

    @Override public void updateLegacyEntity(String entityName) {
        Path oldEntityDir = project.getEntityDir(entityName);
        Path newEntityDir = project.getHubEntitiesDir();
        String entityFileName = entityName + "entity.json";
        try {
            Files.move(oldEntityDir.resolve(entityFileName), newEntityDir.resolve(entityFileName));
        } catch (IOException e) {
            logger.warn("Unable to move legacy entity '" + entityName + "'", e);
        }
    }

    private void writeFile(String srcFile, Path dstFile) {
        logger.info("writing: " + srcFile + " => " + dstFile.toString());
        if (!dstFile.toFile().exists()) {
            InputStream inputStream = Scaffolding.class.getClassLoader()
                    .getResourceAsStream(srcFile);
            FileUtil.copy(inputStream, dstFile.toFile());
        }
    }

    private void writeBuffer(String buffer, Path dstFile) {
        logger.info("writing: " + dstFile.toString());
        if (!dstFile.toFile().exists()) {
            InputStream inputStream = new ByteArrayInputStream(buffer.getBytes(StandardCharsets.UTF_8));
            FileUtil.copy(inputStream, dstFile.toFile());
        }
    }

    @Override public void createRestExtension(String entityName, String extensionName,
            FlowType flowType, CodeFormat codeFormat) throws ScaffoldingValidationException {
        logger.info(extensionName);

        if(!validator.isUniqueRestServiceExtension(extensionName)) {
            throw new ScaffoldingValidationException("A rest service extension with the same name as " + extensionName + " already exists.");
        }
        String scaffoldRestServicesPath = "scaffolding/rest/services/";
        String fileContent = getFileContent(scaffoldRestServicesPath + codeFormat + "/template." + codeFormat, extensionName);
        File dstFile = createEmptyRestExtensionFile(entityName, extensionName, flowType, codeFormat);
        writeToFile(fileContent, dstFile);
        writeMetadataForFile(dstFile, scaffoldRestServicesPath + "metadata/template.xml", extensionName);
    }

    @Override public void createRestTransform(String entityName, String transformName,
            FlowType flowType, CodeFormat codeFormat) throws ScaffoldingValidationException {
        logger.info(transformName);
        if(!validator.isUniqueRestTransform(transformName)) {
            throw new ScaffoldingValidationException("A rest transform with the same name as " + transformName + " already exists.");
        }
        String scaffoldRestTransformsPath = "scaffolding/rest/transforms/";
        String fileContent = getFileContent(scaffoldRestTransformsPath + codeFormat + "/template." + codeFormat, transformName);
        File dstFile = createEmptyRestTransformFile(entityName, transformName, flowType, codeFormat);
        writeToFile(fileContent, dstFile);
        writeMetadataForFile(dstFile, scaffoldRestTransformsPath + "metadata/template.xml", transformName);
    }

    private void writeToFile(String fileContent, File dstFile) {
        FileWriter fw = null;
        BufferedWriter bw = null;

        try {
            fw = new FileWriter(dstFile);
            bw = new BufferedWriter(fw);
            bw.write(fileContent);
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (bw != null) {
                try {
                    bw.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            if( fw != null) {
                try {
                    fw.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }

    private File createEmptyRestExtensionFile(String entityName, String extensionName,
            FlowType flowType, CodeFormat codeFormat) {
        Path restDir = getRestDirectory(entityName, flowType);
        return createEmptyFile(restDir, "services", extensionName + "." + codeFormat);
    }

    private File createEmptyRestTransformFile(String entityName, String transformName,
            FlowType flowType, CodeFormat codeFormat) {
        Path restDir = getRestDirectory(entityName, flowType);
        return createEmptyFile(restDir, "transforms", transformName + "." + codeFormat);
    }

    private File createEmptyFile(Path directory, String subDirectoryName, String fileName) {
        Path fileDirectory = directory;
        if(subDirectoryName != null) {
            fileDirectory = directory.resolve(subDirectoryName);
        }
        fileDirectory.toFile().mkdirs();
        File file = fileDirectory.resolve(fileName).toFile();
        try {
            file.createNewFile();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return file;
    }


    private Path getRestDirectory(String entityName, FlowType flowType) {
        return getLegacyFlowDir(entityName, "REST", flowType);
    }

    private void writeMetadataForFile(File file, String metadataTemplatePath, String metadataName) {
        String fileContent = getFileContent(metadataTemplatePath, metadataName);
        File metadataFile = createEmptyMetadataForFile(file, metadataName);
        writeToFile(fileContent, metadataFile);
    }

    private File createEmptyMetadataForFile(File file, String metadataName) {
        File metadataDir = new File(file.getParentFile(), "metadata");
        metadataDir.mkdir();
        File metadataFile = new File(metadataDir, metadataName + ".xml");
        try {
            metadataFile.createNewFile();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return metadataFile;
    }

    private String getFileContent(String srcFile, String placeholder) {
        StringBuilder output = new StringBuilder();
        InputStream inputStream = null;
        BufferedReader rdr = null;
        try {
            inputStream = Scaffolding.class.getClassLoader()
                    .getResourceAsStream(srcFile);
            rdr = new BufferedReader(new InputStreamReader(inputStream));
            String bufferedLine = null;
            while ((bufferedLine = rdr.readLine()) != null) {
                if(bufferedLine.contains("placeholder")) {
                    bufferedLine = bufferedLine.replace("placeholder", placeholder);
                }
                output.append(bufferedLine);
                output.append("\n");
            }
            inputStream.close();
            rdr.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return output.toString();
    }

    public class ContentPlugin extends ResourceManager {
        private static final String NAME = "ml:scaffoldContent";

        private RequestParameters params = new RequestParameters();

        public ContentPlugin(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public String getContents(String entityName, CodeFormat codeFormat, FlowType flowType) {
            return getContents(entityName, codeFormat, flowType, null);
        }

        public String getContents(String entityName, CodeFormat codeFormat, FlowType flowType, String mappingName) {
            params.add("entity", entityName);
            params.add("codeFormat", codeFormat.toString());
            params.add("flowType", flowType.toString());
            if(mappingName != null) {
                params.add("mapping", mappingName);
            }
            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || ! resultItr.hasNext()) {
                throw new RuntimeException("Unable to get Content Plugin scaffold");
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new StringHandle()).get().replaceAll("\n", "\r\n");
        }

    }

}
