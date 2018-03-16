package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.scaffold.impl.ScaffoldingImpl;
import com.marklogic.hub.util.FileUtil;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;

public class GenerateHubTDETemplateCommandTest extends HubTestBase  {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();
    private static final String RESOURCES_DIR = "scaffolding-test/generate-tde-template/";

    GenerateHubTDETemplateCommand GenerateHubTDETemplateCommand;

    @Before
    public void setup() {
        GenerateHubTDETemplateCommand = new GenerateHubTDETemplateCommand(getHubConfig());
        deleteProjectDir();
    }


    @Before
    public void clearDirs() {
        deleteProjectDir();
        createProjectDir();
    }

    @AfterClass
    public static void teardown() throws IOException {
        deleteProjectDir();
    }

    private void installEntity(String entityName) {
        ScaffoldingImpl scaffolding = new ScaffoldingImpl(projectDir.toString(), finalClient);
        Path entityDir = scaffolding.getEntityDir(entityName);
        entityDir.toFile().mkdirs();
        assertTrue(entityDir.toFile().exists());
        FileUtil.copy(getResourceStream(RESOURCES_DIR + entityName + ".entity.json"), entityDir.resolve(entityName + ".entity.json").toFile());
    }

    @Test
    public void testFindEntityFilesNoEntityFiles()  {
        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();
        assertEquals("Expected to find no entity files",0,entityFiles.size());
    }

    @Test
    public void testFindEntityFilesOneEntityFiles()  {
        installEntity("myfirst");
        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();
        assertEquals("Expected to find one entity file",1,entityFiles.size());
    }

    @Test
    public void testFindEntityFilesTwoEntityFiles()  {
        installEntity("myfirst");
        installEntity("mysecond");
        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();
        assertEquals("Expected to find two entity files",2,entityFiles.size());
    }

    @Test
    public void testCreateEntityNameFileMapWithNoEntityFiles()  {
        Map<String,File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(null);
        assertEquals("Expected to find no entity files",0,entityNameFileMap.size());

        entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(new ArrayList<>());
        assertEquals("Expected to find no entity files",0,entityNameFileMap.size());
    }

    @Test
    public void testCreateEntityNameFileMapWithTwoEntityFiles()  {
        installEntity("myfirst");
        installEntity("mysecond");
        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();

        Map<String,File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(entityFiles);
        assertTrue("Does not contain myfirst entity",entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity",entityNameFileMap.containsKey("mysecond"));

        //assertEquals("Expected to find no entity files",2,entityNameFileMap.size());
    }

    @Test
    public void testFilterSingleEntityWithTwoEntityFiles() {
        installEntity("myfirst");
        installEntity("mysecond");
        GenerateHubTDETemplateCommand.setEntityNames("myfirst");

        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();

        Map<String,File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(entityFiles);
        assertTrue("Does not contain myfirst entity",entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity",entityNameFileMap.containsKey("mysecond"));

        GenerateHubTDETemplateCommand.filterEntities(entityNameFileMap);
        assertTrue("Does not contain myfirst entity",entityNameFileMap.containsKey("myfirst"));
        assertFalse("Does contain mysecond entity",entityNameFileMap.containsKey("mysecond"));
    }

    @Test
    public void testFilterTwoEntityWithTwoEntityFiles()  {
        installEntity("myfirst");
        installEntity("mysecond");
        GenerateHubTDETemplateCommand.setEntityNames("myfirst,mysecond");

        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();

        Map<String,File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(entityFiles);
        assertTrue("Does not contain myfirst entity",entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity",entityNameFileMap.containsKey("mysecond"));

        GenerateHubTDETemplateCommand.filterEntities(entityNameFileMap);
        assertTrue("Does not contain myfirst entity",entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity",entityNameFileMap.containsKey("mysecond"));
    }

    @Test
    public void testFilterIncorrectEntities()  {
        installEntity("myfirst");
        installEntity("mysecond");
        GenerateHubTDETemplateCommand.setEntityNames("XCXZ,ZXCXZC");

        List<File> entityFiles = GenerateHubTDETemplateCommand.findEntityFiles();

        Map<String,File> entityNameFileMap = GenerateHubTDETemplateCommand.createEntityNameFileMap(entityFiles);
        assertTrue("Does not contain myfirst entity",entityNameFileMap.containsKey("myfirst"));
        assertTrue("Does not contain mysecond entity",entityNameFileMap.containsKey("mysecond"));

        GenerateHubTDETemplateCommand.filterEntities(entityNameFileMap);
        assertFalse("Does contain myfirst entity",entityNameFileMap.containsKey("myfirst"));
        assertFalse("Does contain mysecond entity",entityNameFileMap.containsKey("mysecond"));
    }

    @Test
    public void testExtactEntityNameFromFilename()  {
        assertEquals("Could not extract entity ABC", "ABC",GenerateHubTDETemplateCommand.extactEntityNameFromFilename("ABC.entity.json").get());
    }
}
