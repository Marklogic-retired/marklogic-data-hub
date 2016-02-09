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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Scaffolding {

    public static void createDomain(String domainName, File userlandPath) {
        File domainDir = new File(userlandPath, domainName);
        domainDir.mkdirs();
    }

    public static void createFlow(String name, File domainPath) throws IOException {
        File flowDir = new File(domainPath, name);

        File collectorDir = new File(flowDir, "collector");
        collectorDir.mkdirs();
        writeFile("scaffolding/collector.xqy", Paths.get(collectorDir.getPath(), "collector.xqy"));

        File contentDir = new File(flowDir, "content");
        contentDir.mkdirs();
        writeFile("scaffolding/content.xqy", Paths.get(contentDir.getPath(), "content.xqy"));

        File headerDir = new File(flowDir, "header");
        headerDir.mkdirs();
        writeFile("scaffolding/header.xqy", Paths.get(contentDir.getPath(), "header.xqy"));

        File triplesDir = new File(flowDir, "triples");
        triplesDir.mkdirs();
        writeFile("scaffolding/triples.xqy", Paths.get(contentDir.getPath(), "triples.xqy"));
    }

    private static void writeFile(String srcFile, Path dstFile) throws IOException {
        InputStream inputStream = Scaffolding.class.getClassLoader().getResourceAsStream(srcFile);
        Files.copy(inputStream, dstFile);
    }
}
