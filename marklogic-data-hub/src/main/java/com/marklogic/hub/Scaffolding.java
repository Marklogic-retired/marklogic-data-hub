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

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.client.io.Format;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.flow.SimpleFlow;

public class Scaffolding {

    static final private Logger LOGGER = LoggerFactory.getLogger(Scaffolding.class);

    public static File getEntityDir(File userlandDir, String entityName) {
        File entitiesDir = new File(userlandDir, "entities");
        File entityDir = new File(entitiesDir, entityName);
        return entityDir;
    }

    public static File getFlowDir(File userlandDir, String entityName,
            String flowName, FlowType flowType) {
        File entityDir = getEntityDir(userlandDir, entityName);
        File typeDir = new File(entityDir, flowType.toString());
        File flowDir = new File(typeDir, flowName);
        return flowDir;
    }

    public static void createEntity(String entityName, File userlandPath) {
        File entityDir = getEntityDir(userlandPath, entityName);
        entityDir.mkdirs();
    }

    public static void createFlow(String entityName, String flowName,
            FlowType flowType, PluginFormat pluginFormat, Format dataFormat,
            File userlandDir)
            throws IOException {
        File flowDir = getFlowDir(userlandDir, entityName, flowName, flowType);

        if (flowType.equals(FlowType.HARMONIZE)) {
            File collectorDir = new File(flowDir, "collector");
            collectorDir.mkdirs();
            writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/collector." + pluginFormat,
                    Paths.get(collectorDir.getPath(), "collector." + pluginFormat));

            File writerDir = new File(flowDir, "writer");
            writerDir.mkdirs();
            writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/writer." + pluginFormat,
                    Paths.get(writerDir.getPath(), "writer." + pluginFormat));
        }

        File contentDir = new File(flowDir, "content");
        contentDir.mkdirs();
        writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/content." + pluginFormat,
                Paths.get(contentDir.getPath(), "content." + pluginFormat));

        File headerDir = new File(flowDir, "headers");
        headerDir.mkdirs();
        writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/headers." + pluginFormat,
                Paths.get(headerDir.getPath(), "headers." + pluginFormat));

        File triplesDir = new File(flowDir, "triples");
        triplesDir.mkdirs();
        writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/triples." + pluginFormat,
                Paths.get(triplesDir.getPath(), "triples." + pluginFormat));

        SimpleFlow flow = new SimpleFlow(entityName, flowName, flowType,
                dataFormat);
        File flowFile = new File(flowDir, flowName + ".xml");
        try(PrintWriter out = new PrintWriter(flowFile)) {
            out.println(flow.serialize(false));
            out.close();
        }
    }

    private static void writeFile(String srcFile, Path dstFile)
            throws IOException {
        LOGGER.info(srcFile);
        InputStream inputStream = Scaffolding.class.getClassLoader()
                .getResourceAsStream(srcFile);
        Files.copy(inputStream, dstFile);
    }

    public static void createRestExtension(String entityName, String extensionName,
            FlowType flowType, PluginFormat pluginFormat, File userlandDir) throws IOException, ScaffoldingValidationException {
        LOGGER.info(extensionName);
        if(!ScaffoldingValidator.isUniqueRestServiceExtension(userlandDir, extensionName)) {
            throw new ScaffoldingValidationException("A rest service extension with the same name as " + extensionName + " already exists.");
        }
        String scaffoldRestServicesPath = "scaffolding/rest/services/";
        String fileContent = getFileContent(scaffoldRestServicesPath + pluginFormat + "/template." + pluginFormat, extensionName);
        File dstFile = createEmptyRestExtensionFile(entityName, extensionName, flowType, pluginFormat, userlandDir);
        writeToFile(fileContent, dstFile);
        writeMetadataForFile(dstFile, scaffoldRestServicesPath + "metadata/template.xml", extensionName);
    }

    public static void createRestTransform(String entityName, String transformName,
            FlowType flowType, PluginFormat pluginFormat, File userlandDir) throws IOException, ScaffoldingValidationException {
        LOGGER.info(transformName);
        if(!ScaffoldingValidator.isUniqueRestTransform(userlandDir, transformName)) {
            throw new ScaffoldingValidationException("A rest transform with the same name as " + transformName + " already exists.");
        }
        String scaffoldRestTransformsPath = "scaffolding/rest/transforms/";
        String fileContent = getFileContent(scaffoldRestTransformsPath + pluginFormat + "/template." + pluginFormat, transformName);
        File dstFile = createEmptyRestTransformFile(entityName, transformName, flowType, pluginFormat, userlandDir);
        writeToFile(fileContent, dstFile);
        writeMetadataForFile(dstFile, scaffoldRestTransformsPath + "metadata/template.xml", transformName);
    }

    private static void writeToFile(String fileContent, File dstFile)
            throws IOException {
        LOGGER.info(fileContent);
        LOGGER.info(dstFile.getAbsolutePath());
        FileWriter fw = new FileWriter(dstFile);
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(fileContent);
        bw.close();
    }

    private static File createEmptyRestExtensionFile(String entityName, String extensionName,
            FlowType flowType, PluginFormat pluginFormat, File userlandDir) throws IOException {
        File restDir = getRestDirectory(userlandDir, entityName, flowType);
        return createEmptyFile(restDir, "services", extensionName + "." + pluginFormat);
    }

    private static File createEmptyRestTransformFile(String entityName, String transformName,
            FlowType flowType, PluginFormat pluginFormat, File userlandDir) throws IOException {
        File restDir = getRestDirectory(userlandDir, entityName, flowType);
        return createEmptyFile(restDir, "transforms", transformName + "." + pluginFormat);
    }

    private static File createEmptyFile(File directory, String subDirectoryName, String fileName) throws IOException {
        File fileDirectory = directory;
        if(subDirectoryName!=null) {
            fileDirectory = new File(directory, subDirectoryName);
        }
        fileDirectory.mkdirs();
        File file = new File(fileDirectory, fileName);
        file.createNewFile();
        return file;
    }

    private static File getRestDirectory(File userlandDir, String entityName,
            FlowType flowType) {
        return getFlowDir(userlandDir, entityName,
                "REST", flowType);
    }

    private static void writeMetadataForFile(File file, String metadataTemplatePath, String metadataName) throws IOException {
        String fileContent = getFileContent(metadataTemplatePath, metadataName);
        File metadataFile = createEmptyMetadataForFile(file, metadataName);
        writeToFile(fileContent, metadataFile);
    }

    private static File createEmptyMetadataForFile(File file, String metadataName) throws IOException {
        File metadataDir = new File(file.getParentFile(), "metadata");
        metadataDir.mkdir();
        File metadataFile = new File(metadataDir, metadataName + ".xml");
        metadataFile.createNewFile();
        return metadataFile;
    }

    private static String getFileContent(String srcFile, String placeholder) throws IOException {
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
            LOGGER.error(e.getMessage(), e);
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
