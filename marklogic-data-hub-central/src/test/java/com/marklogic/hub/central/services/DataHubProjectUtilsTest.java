package com.marklogic.hub.central.services;

import com.marklogic.hub.curation.controllers.EnvironmentControllerTest;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class DataHubProjectUtilsTest {

    @Test
    public void testExtractZipFileWithoutArchiveFolder() throws Exception {
        File file = new File(EnvironmentControllerTest.class.getClassLoader().getResource("dhfWithoutArchiveFolder.zip").getFile());
        FileInputStream input = new FileInputStream(file);

        InputStream bis = DataHubProjectUtils.toByteArrayInputStream(input);
        assertTrue(bis instanceof ByteArrayInputStream);

        Object ret = DataHubProjectUtils.getArchiveFolderOfZipFile("", bis);
        assertTrue(ret == null);
    }

    @Test
    public void testExtractZipFileWithArchiveFolder() throws Exception {
        File file = new File(EnvironmentControllerTest.class.getClassLoader().getResource("dhfWithArchiveFolder.zip").getFile());
        FileInputStream input = new FileInputStream(file);

        InputStream bis = DataHubProjectUtils.toByteArrayInputStream(input);
        assertTrue(bis instanceof ByteArrayInputStream);

        Object ret = DataHubProjectUtils.getArchiveFolderOfZipFile("", bis);
        assertTrue(ret instanceof String);
        assertTrue(ret.equals("dhf"));
    }

    @Test
    public void testWrongInputStream() throws Exception {
        File file = new File(EnvironmentControllerTest.class.getClassLoader().getResource("dhfWithoutArchiveFolder.zip").getFile());
        FileInputStream input = new FileInputStream(file);

        assertThrows(RuntimeException.class, () -> {
            DataHubProjectUtils.getArchiveFolderOfZipFile("", input);
            fail("Should have thrown exception because the input stream is not ByteArrayInputStream.");
        });
    }
}
