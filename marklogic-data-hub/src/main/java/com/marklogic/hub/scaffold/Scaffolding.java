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
package com.marklogic.hub.scaffold;

import com.marklogic.client.io.Format;
import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.flow.SimpleFlow;
import com.marklogic.hub.plugin.PluginFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Scaffolding {

    private String projectDir;
    private Path pluginsDir;
    private Path entitiesDir;
    private ScaffoldingValidator validator;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public Scaffolding(String projectDir) {
        this.projectDir = projectDir;
        this.pluginsDir = Paths.get(this.projectDir, "plugins");
        this.entitiesDir = this.pluginsDir.resolve("entities");
        validator = new ScaffoldingValidator(projectDir);
    }

    public Path getFlowDir(String entityName, String flowName, FlowType flowType) {
        Path entityDir = entitiesDir.resolve(entityName);
        Path typeDir = entityDir.resolve(flowType.toString());
        Path flowDir = typeDir.resolve(flowName);
        return flowDir;
    }

    public void createEntity(String entityName) throws FileNotFoundException {
        Path entityDir = entitiesDir.resolve(entityName);
        entityDir.toFile().mkdirs();

    }

    public void createFlow(String entityName, String flowName,
                           FlowType flowType, PluginFormat pluginFormat, Format dataFormat)
            throws IOException {
        Path flowDir = getFlowDir(entityName, flowName, flowType);

        if (flowType.equals(FlowType.HARMONIZE)) {
            Path collectorDir = flowDir.resolve("collector");
            collectorDir.toFile().mkdirs();
            writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/collector." + pluginFormat,
                    collectorDir.resolve("collector." + pluginFormat));

            Path writerDir = flowDir.resolve("writer");
            writerDir.toFile().mkdirs();
            writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/writer." + pluginFormat,
                    writerDir.resolve("writer." + pluginFormat));
        }

        Path contentDir = flowDir.resolve("content");
        contentDir.toFile().mkdirs();
        writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/content." + pluginFormat,
                contentDir.resolve("content." + pluginFormat));

        Path headerDir = flowDir.resolve("headers");
        headerDir.toFile().mkdirs();
        writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/headers." + pluginFormat,
                headerDir.resolve("headers." + pluginFormat));

        Path triplesDir = flowDir.resolve("triples");
        triplesDir.toFile().mkdirs();
        writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/triples." + pluginFormat,
                triplesDir.resolve("triples." + pluginFormat));

        SimpleFlow flow = new SimpleFlow(entityName, flowName, flowType,
                dataFormat);
        Path flowFile = flowDir.resolve(flowName + ".xml");
        try(PrintWriter out = new PrintWriter(flowFile.toFile())) {
            out.println(flow.serialize(false));
            out.close();
        }
    }

    private void writeFile(String srcFile, Path dstFile) throws IOException {
        logger.info("writing: " + srcFile + " => " + dstFile.toString());
        if (!dstFile.toFile().exists()) {
            InputStream inputStream = Scaffolding.class.getClassLoader()
                    .getResourceAsStream(srcFile);
            Files.copy(inputStream, dstFile);
        }
    }

    public void createRestExtension(String entityName, String extensionName,
            FlowType flowType, PluginFormat pluginFormat) throws IOException, ScaffoldingValidationException {
        logger.info(extensionName);

        if(!validator.isUniqueRestServiceExtension(extensionName)) {
            throw new ScaffoldingValidationException("A rest service extension with the same name as " + extensionName + " already exists.");
        }
        String scaffoldRestServicesPath = "scaffolding/rest/services/";
        String fileContent = getFileContent(scaffoldRestServicesPath + pluginFormat + "/template." + pluginFormat, extensionName);
        File dstFile = createEmptyRestExtensionFile(entityName, extensionName, flowType, pluginFormat);
        writeToFile(fileContent, dstFile);
        writeMetadataForFile(dstFile, scaffoldRestServicesPath + "metadata/template.xml", extensionName);
    }

    public void createRestTransform(String entityName, String transformName,
            FlowType flowType, PluginFormat pluginFormat) throws IOException, ScaffoldingValidationException {
        logger.info(transformName);
        if(!validator.isUniqueRestTransform(transformName)) {
            throw new ScaffoldingValidationException("A rest transform with the same name as " + transformName + " already exists.");
        }
        String scaffoldRestTransformsPath = "scaffolding/rest/transforms/";
        String fileContent = getFileContent(scaffoldRestTransformsPath + pluginFormat + "/template." + pluginFormat, transformName);
        File dstFile = createEmptyRestTransformFile(entityName, transformName, flowType, pluginFormat);
        writeToFile(fileContent, dstFile);
        writeMetadataForFile(dstFile, scaffoldRestTransformsPath + "metadata/template.xml", transformName);
    }

    private void writeToFile(String fileContent, File dstFile)
            throws IOException {
        FileWriter fw = new FileWriter(dstFile);
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(fileContent);
        bw.close();
    }

    private File createEmptyRestExtensionFile(String entityName, String extensionName,
            FlowType flowType, PluginFormat pluginFormat) throws IOException {
        Path restDir = getRestDirectory(entityName, flowType);
        return createEmptyFile(restDir, "services", extensionName + "." + pluginFormat);
    }

    private File createEmptyRestTransformFile(String entityName, String transformName,
            FlowType flowType, PluginFormat pluginFormat) throws IOException {
        Path restDir = getRestDirectory(entityName, flowType);
        return createEmptyFile(restDir, "transforms", transformName + "." + pluginFormat);
    }

    private File createEmptyFile(Path directory, String subDirectoryName, String fileName) throws IOException {
        Path fileDirectory = directory;
        if(subDirectoryName != null) {
            fileDirectory = directory.resolve(subDirectoryName);
        }
        fileDirectory.toFile().mkdirs();
        File file = fileDirectory.resolve(fileName).toFile();
        file.createNewFile();
        return file;
    }

    public Path getEntityDir(String entityName) {
        return entitiesDir.resolve(entityName);
    }

    private Path getRestDirectory(String entityName, FlowType flowType) {
        return getFlowDir(entityName, "REST", flowType);
    }

    private void writeMetadataForFile(File file, String metadataTemplatePath, String metadataName) throws IOException {
        String fileContent = getFileContent(metadataTemplatePath, metadataName);
        File metadataFile = createEmptyMetadataForFile(file, metadataName);
        writeToFile(fileContent, metadataFile);
    }

    private File createEmptyMetadataForFile(File file, String metadataName) throws IOException {
        File metadataDir = new File(file.getParentFile(), "metadata");
        metadataDir.mkdir();
        File metadataFile = new File(metadataDir, metadataName + ".xml");
        metadataFile.createNewFile();
        return metadataFile;
    }

    private String getFileContent(String srcFile, String placeholder) throws IOException {
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
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw e;
        } finally {
            if(inputStream != null) {
                inputStream.close();
            }
            if(rdr != null) {
                rdr.close();
            }
        }
        return output.toString();
    }

    public static String getAbsolutePath(String first, String... more) {
        StringBuilder absolutePath = new StringBuilder(first);
        for (String path : more) {
            absolutePath.append(File.separator);
            absolutePath.append(path);
        }
        return absolutePath.toString();
    }
}
