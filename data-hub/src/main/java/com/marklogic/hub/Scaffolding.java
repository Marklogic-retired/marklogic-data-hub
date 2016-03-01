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

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.client.io.Format;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.flow.SimpleFlow;

public class Scaffolding {

    static final private Logger LOGGER = LoggerFactory.getLogger(Scaffolding.class);

    public static File getDomainDir(File userlandDir, String domainName) {
        File domainsDir = new File(userlandDir, "domains");
        File domainDir = new File(domainsDir, domainName);
        return domainDir;
    }

    public static File getFlowDir(File userlandDir, String domainName, String flowName, FlowType flowType) {
        File domainDir = getDomainDir(userlandDir, domainName);
        File typeDir = new File(domainDir, flowType.toString());
        File flowDir = new File(typeDir, flowName);
        return flowDir;
    }

    public static void createDomain(String domainName, File userlandPath) {
        File domainDir = getDomainDir(userlandPath, domainName);
        domainDir.mkdirs();
    }

    public static void createFlow(String domainName, String flowName, FlowType flowType, PluginFormat pluginFormat, Format dataFormat, File userlandDir)
            throws IOException {
        File flowDir = getFlowDir(userlandDir, domainName, flowName, flowType);

        if (flowType.equals(FlowType.CONFORMANCE)) {
            File collectorDir = new File(flowDir, "collector");
            collectorDir.mkdirs();
            writeFile("scaffolding/" + flowType + "/" + pluginFormat + "/collector." + pluginFormat,
                    Paths.get(collectorDir.getPath(), "collector." + pluginFormat));
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

        SimpleFlow flow = new SimpleFlow(domainName, flowName, flowType, dataFormat);
        flow.serialize();
        File flowFile = new File(flowDir, flowName + ".xml");
        try(PrintWriter out = new PrintWriter(flowFile)) {
            out.println(flow.serialize());
        }
    }

    private static void writeFile(String srcFile, Path dstFile)
            throws IOException {
        LOGGER.info(srcFile);
        InputStream inputStream = Scaffolding.class.getClassLoader()
                .getResourceAsStream(srcFile);
        Files.copy(inputStream, dstFile);
    }
}
