/*
 * Copyright (c) 2020 MarkLogic Corporation
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.StepDefinition.StepDefinitionType;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Component
public class ScaffoldingImpl extends LoggingObject implements Scaffolding {

    @Autowired
    HubConfig hubConfig;

    Versions versions;

    public ScaffoldingImpl() {}

    public ScaffoldingImpl(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
    }

    public static String getAbsolutePath(String first, String... more) {
        StringBuilder absolutePath = new StringBuilder(first);
        for (String path : more) {
            absolutePath.append(File.separator);
            absolutePath.append(path);
        }
        return absolutePath.toString();
    }

    /**
     * Create a step file  based on the given stepName, stepType, entityType (for non ingestion steps),
     *  and stepDefName.
     *
     * @param stepName
     * @param stepType
     * @param stepDefName
     * @param entityType
     * @return a Pair with a File representing the created file, and a String representing an optional message that,
     * if not null, should likely be presented to the caller
     */
    public Pair<File, String> createStepFile(String stepName, String stepType, String stepDefName, String entityType) {
        StepDefinitionManager stepDefinitionManager = new StepDefinitionManagerImpl(hubConfig);
        StepDefinitionType stepDefType = StepDefinitionType.getStepDefinitionType(stepType);
        Assert.notNull(stepDefType, "Unrecognized step type: " + stepType);

        StepDefinition stepDefinition = null;
        JsonNode step;
        StringBuilder messageBuilder = new StringBuilder();
        File stepFile = hubConfig.getHubProject().getStepFile(stepDefType, stepName);
        if (stepFile.exists()) {
            throw new IllegalArgumentException("Cannot create step; a step file already exists at: " + stepFile.getAbsolutePath() + ". Please choose a different name for your step.");
        }
        stepFile.getParentFile().mkdirs();

        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode stepPayLoad = objectMapper.createObjectNode();
        stepPayLoad.put("name", stepName);
        stepPayLoad.put("description", "");
        stepPayLoad.put("stepDefinitionType", stepType);
        if(stepDefName != null) {
            stepPayLoad.put("stepDefinitionName", stepDefName);
        }
        else {
            if(StepDefinitionType.CUSTOM.equals(stepDefType)){
                stepDefName = stepName;
                stepPayLoad.put("stepDefinitionName", stepDefName);
            }
        }

        if ("ingestion".equalsIgnoreCase(stepType)) {
            stepPayLoad.put("sourceFormat", "json");
            stepPayLoad.put("targetFormat", "json");
        }
        else {
            stepPayLoad.put("selectedSource", "query");
            if("custom".equalsIgnoreCase(stepType) || "mapping".equalsIgnoreCase(stepType)){
                stepPayLoad.put("sourceQuery", "cts.collectionQuery('changeme')");
                if(entityType != null){
                    stepPayLoad.put("entityType", entityType);
                }
            }
        }

        if (stepDefName != null && stepDefinitionManager.getStepDefinition(stepDefName, StepDefinitionType.getStepDefinitionType(stepType)) == null) {
            stepDefinition = StepDefinition.create(stepDefName, StepDefinitionType.getStepDefinitionType(stepType));
            createCustomModule(stepDefName, stepType);
            stepDefinition.setModulePath("/custom-modules/" + stepType.toLowerCase() + "/" + stepDefName + "/main.sjs");
            stepDefinitionManager.saveStepDefinition(stepDefinition);
            messageBuilder.append(String.format("Created step definition '%s' of type '%s'.\n", stepName, stepType));
            messageBuilder.append("The module file for the step definition is available at "
                + "/custom-modules/" + stepType.toLowerCase() + "/" + stepDefName + "/main.sjs" + ". \n");
            messageBuilder.append("It is recommended to run './gradlew -i mlWatch' so that as you modify the module, it will be automatically loaded into your application's modules database.\n");
        }
        messageBuilder.append("Created step '" + stepName + "' of type '" + stepType + "' with default properties. The step has been deployed to staging and final databases.");
        DatabaseClient stagingClient = hubConfig.newHubClient().getStagingClient();
        try {
            if(stepDefinition != null) {
                ArtifactService artifactService = ArtifactService.on(stagingClient);
                artifactService.setArtifact("stepDefinition", stepDefName, objectMapper.valueToTree(stepDefinition));
            }
        } catch (Exception e) {
            throw new RuntimeException("Unable to write step definition to database; cause: " + e.getMessage(), e);
        }

        try {
            StepService stepService = StepService.on(stagingClient);
            //We don't update step using this command, hence 'overwrite' is set to false
            step = stepService.saveStep(stepType, stepPayLoad, false);
        } catch (Exception e) {
            throw new RuntimeException("Unable to write step to database; cause: " + e.getMessage(), e);
        }

        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(stepFile, step);
            return Pair.of(stepFile, messageBuilder.toString());
        } catch (IOException e) {
            throw new RuntimeException("Unable to write step to file: " + stepFile.getAbsolutePath() + "; cause: " + e.getMessage(), e);
        }
    }

    @Override public Path getLegacyFlowDir(String entityName, String flowName, FlowType flowType) {
        Path entityDir = hubConfig.getHubProject().getEntityDir(entityName);
        Path typeDir = entityDir.resolve(flowType.toString());
        Path flowDir = typeDir.resolve(flowName);
        return flowDir;
    }

    @Override public void createEntity(String entityName) {
        Path entityDir = hubConfig.getHubProject().getHubEntitiesDir();

        File entityFile = entityDir.resolve(entityName + ".entity.json").toFile();
        if (entityFile.exists()) {
            throw new DataHubProjectException("Entity with that name already exists.");
        }

        File entityDirFile = entityDir.toFile();
        if(!entityDirFile.exists()){
            entityDirFile.mkdirs();
        }
        String fileContents = getFileContent("scaffolding/Entity.json", entityName);
        writeToFile(fileContents, entityFile);
    }

    @Override public void createLegacyMappingDir(String mappingName) {
        Path mappingDir = hubConfig.getHubProject().getLegacyMappingDir(mappingName);
        mappingDir.toFile().mkdirs();
    }

    @Override public void createMappingDir(String mappingName) {
        Path mappingDir = hubConfig.getHubProject().getMappingDir(mappingName);
        mappingDir.toFile().mkdirs();
    }

    @Override
    public void createCustomModule(String stepName, String stepType) {
        createCustomModule(stepName, stepType, "sjs");
    }

    @Override
    public void createCustomModule(String stepName, String stepType, String format) {
        Path customModuleDir = hubConfig.getHubProject().getCustomModuleDir(stepName, stepType.toLowerCase());
        customModuleDir.toFile().mkdirs();

        if (customModuleDir.toFile().exists()) {
            String moduleScaffoldingSrcFile;
            File moduleFile;
            File libFile;
            String libScaffoldingSrcFile = null;
            if("sjs".equalsIgnoreCase(format)) {
                moduleScaffoldingSrcFile = "scaffolding/custom-module/sjs/main-" + stepType.toLowerCase() + ".sjs";
            }
            else if("xqy".equalsIgnoreCase(format)) {
                moduleScaffoldingSrcFile = "scaffolding/custom-module/xqy/main-" + stepType.toLowerCase() + ".sjs";
                libScaffoldingSrcFile = "scaffolding/custom-module/xqy/lib-" + stepType.toLowerCase() + ".xqy";
            }
            else {
                throw new RuntimeException("Invalid code format. The allowed formats are 'xqy' or 'sjs'");
            }
            moduleFile = customModuleDir.resolve("main.sjs").toFile();
            InputStream inputStream = ScaffoldingImpl.class.getClassLoader().getResourceAsStream(moduleScaffoldingSrcFile);
            try {
                FileUtils.copyInputStreamToFile(inputStream, moduleFile);
                libFile = customModuleDir.resolve("lib.xqy").toFile();
                if(libScaffoldingSrcFile != null) {
                    InputStream libInputStream = ScaffoldingImpl.class.getClassLoader().getResourceAsStream(libScaffoldingSrcFile);
                    FileUtils.copyInputStreamToFile(libInputStream, libFile);
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    @Override
    public File createDefaultFlow(String flowName) {
        Path flowsDir = hubConfig.getHubProject().getFlowsDir();
        flowsDir.toFile().mkdirs();
        File flowFile = flowsDir.resolve(flowName + ".flow.json").toFile();

        if (flowsDir.toFile().exists()) {
            Map<String, String> customTokens = new HashMap<>();
            customTokens.put("%%mlStagingDbName%%", hubConfig.getDbName(DatabaseKind.STAGING));
            customTokens.put("%%mlFinalDbName%%", hubConfig.getDbName(DatabaseKind.FINAL));
            customTokens.put("%%mlFlowName%%", flowName);

            try {
                String fileContents = buildFlowFromDefaultFlow(customTokens);
                try (FileWriter writer = new FileWriter(flowFile)) {
                    writer.write(fileContents);
                }
            }
            catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return flowFile;
    }

    protected String buildFlowFromDefaultFlow(Map<String, String> customTokens) throws IOException {
        String flowSrcFile = "scaffolding/defaultFlow.flow.json";
        String fileContents = null;
        try (InputStream inputStream = ScaffoldingImpl.class.getClassLoader().getResourceAsStream(flowSrcFile)) {
            assert inputStream != null;
            fileContents = IOUtils.toString(inputStream);
            for (String key : customTokens.keySet()) {
                String value = customTokens.get(key);
                if (value != null) {
                    fileContents = fileContents.replace(key, value);
                }
            }
        }
        return fileContents;
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

    @Override public void updateLegacyEntity(String entityName) {
        Path oldEntityDir = hubConfig.getHubProject().getEntityDir(entityName);
        Path newEntityDir = hubConfig.getHubProject().getHubEntitiesDir();
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

        if(!new ScaffoldingValidator(hubConfig.getHubProject()).isUniqueRestServiceExtension(extensionName)) {
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
        if(!new ScaffoldingValidator(hubConfig.getHubProject()).isUniqueRestTransform(transformName)) {
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
        private static final String NAME = "mlScaffoldContent";

        private RequestParameters params = new RequestParameters();

        public ContentPlugin(DatabaseClient client) {
            super();
            client.init(NAME, this);
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

    private Versions getVersions() {
        if (this.versions == null) {
            this.versions = new Versions(this.hubConfig);
        }
        return this.versions;
    }
}
