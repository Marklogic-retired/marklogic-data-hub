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
package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.util.FileUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;

public class GenerateHubTDETemplateCommandTest extends AbstractHubCoreTest {

    private static final String RESOURCES_DIR = "scaffolding-test/generate-tde-template/";

    GenerateHubTDETemplateCommand GenerateHubTDETemplateCommand;

    @BeforeEach
    public void setup() {
        GenerateHubTDETemplateCommand = new GenerateHubTDETemplateCommand(getHubConfig());
    }


    private void installEntity(String entityName) {
        Path entityDir = getHubProject().getHubEntitiesDir();
        if (!entityDir.toFile().exists()) {
            entityDir.toFile().mkdirs();
        }
        assertTrue(entityDir.toFile().exists());
        FileUtil.copy(getResourceStream(RESOURCES_DIR + entityName + ".entity.json"), entityDir.resolve(entityName + ".entity.json").toFile());
    }

    @Test
    public void testFindEntityFilesNoEntityFiles() {
        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();
        assertEquals("Expected to find no entity files", 0, entityFiles.size());
    }

    @Test
    public void testFindEntityFilesOneEntityFiles() {
        installEntity("myfirst");
        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();
        assertEquals("Expected to find one entity file", 1, entityFiles.size());
    }

    @Test
    public void testFindEntityFilesTwoEntityFiles() {
        installEntity("myfirst");
        installEntity("mysecond");
        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();
        assertEquals("Expected to find two entity files", 2, entityFiles.size());
    }

    @Test
    public void testCreateEntityNameFileMapWithNoEntityFiles() {
        Map<String, File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(null);
        assertEquals("Expected to find no entity files", 0, entityNameFileMap.size());

        entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(new ArrayList<>());
        assertEquals("Expected to find no entity files", 0, entityNameFileMap.size());
    }

    @Test
    public void testCreateEntityNameFileMapWithTwoEntityFiles() {
        installEntity("myfirst");
        installEntity("mysecond");
        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();

        Map<String, File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(entityFiles);
        assertTrue("Does not contain myfirst entity", entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity", entityNameFileMap.containsKey("mysecond"));

        //assertEquals("Expected to find no entity files",2,entityNameFileMap.size());
    }

    @Test
    public void testFilterSingleEntityWithTwoEntityFiles() {
        installEntity("myfirst");
        installEntity("mysecond");
        GenerateHubTDETemplateCommand.setEntityNames("myfirst");

        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();

        Map<String, File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(entityFiles);
        assertTrue("Does not contain myfirst entity", entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity", entityNameFileMap.containsKey("mysecond"));

        GenerateHubTDETemplateCommand.filterEntities(entityNameFileMap);
        assertTrue("Does not contain myfirst entity", entityNameFileMap.containsKey("myfirst"));
        assertFalse("Does contain mysecond entity", entityNameFileMap.containsKey("mysecond"));
    }

    @Test
    public void testFilterTwoEntityWithTwoEntityFiles() {
        installEntity("myfirst");
        installEntity("mysecond");
        GenerateHubTDETemplateCommand.setEntityNames("myfirst,mysecond");

        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();

        Map<String, File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(entityFiles);
        assertTrue("Does not contain myfirst entity", entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity", entityNameFileMap.containsKey("mysecond"));

        GenerateHubTDETemplateCommand.filterEntities(entityNameFileMap);
        assertTrue("Does not contain myfirst entity", entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity", entityNameFileMap.containsKey("mysecond"));
    }

    @Test
    public void testFilterIncorrectEntities() {
        installEntity("myfirst");
        installEntity("mysecond");
        GenerateHubTDETemplateCommand.setEntityNames("XCXZ,ZXCXZC");

        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();

        Map<String, File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(entityFiles);
        assertTrue("Does not contain myfirst entity", entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity", entityNameFileMap.containsKey("mysecond"));

        GenerateHubTDETemplateCommand.filterEntities(entityNameFileMap);
        assertFalse("Does contain myfirst entity", entityNameFileMap.containsKey("myfirst"));
        assertFalse("Does contain mysecond entity", entityNameFileMap.containsKey("mysecond"));
    }

    @Test
    public void testExtractEntityNameFromFilename() {
        assertEquals("Could not extract entity ABC", "ABC", GenerateHubTDETemplateCommand.extractEntityNameFromFilename("ABC.entity.json").get());
    }
}
