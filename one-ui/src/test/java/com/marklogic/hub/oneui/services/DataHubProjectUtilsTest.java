package com.marklogic.hub.oneui.services;

import com.marklogic.hub.curation.controllers.EnvironmentControllerTest;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class DataHubProjectUtilsTest {

    @Test
    public void testExtractZipFileWithoutArchiveFolder() throws Exception {
        File file = new File(EnvironmentControllerTest.class.getClassLoader().getResource("dhfWithoutArchiveFolder.zip").getFile());
        FileInputStream input = new FileInputStream(file);

        Method method = DataHubProjectUtils.class.getDeclaredMethod("toByteArrayInputStream", InputStream.class);
        method.setAccessible(true);
        Object bis = method.invoke(null,input);
        assertTrue(bis instanceof ByteArrayInputStream);

        Method method2 = DataHubProjectUtils.class.getDeclaredMethod("getArchiveFolderOfZipFile", String.class, InputStream.class);
        method2.setAccessible(true);
        Object ret = method2.invoke(null,"", bis);
        assertTrue(ret == null);
    }

    @Test
    public void testExtractZipFileWithArchiveFolder() throws Exception {
        File file = new File(EnvironmentControllerTest.class.getClassLoader().getResource("dhfWithArchiveFolder.zip").getFile());
        FileInputStream input = new FileInputStream(file);

        Method method = DataHubProjectUtils.class.getDeclaredMethod("toByteArrayInputStream", InputStream.class);
        method.setAccessible(true);
        Object bis = method.invoke(null, input);
        assertTrue(bis instanceof ByteArrayInputStream);

        Method method2 = DataHubProjectUtils.class.getDeclaredMethod("getArchiveFolderOfZipFile", String.class, InputStream.class);
        method2.setAccessible(true);
        Object ret = method2.invoke(null,"", bis);
        assertTrue(ret instanceof String);
        assertTrue(ret.equals("dhf"));
    }

    @Test
    public void testWrongInputStream() throws Exception {
        File file = new File(EnvironmentControllerTest.class.getClassLoader().getResource("dhfWithoutArchiveFolder.zip").getFile());
        FileInputStream input = new FileInputStream(file);

        Method method = DataHubProjectUtils.class.getDeclaredMethod("getArchiveFolderOfZipFile", String.class, InputStream.class);
        method.setAccessible(true);
        assertThrows(InvocationTargetException.class, () -> {
            method.invoke(null,"", input);
            fail("Should have thrown exception because the input stream is not ByteArrayInputStream.");
        });
    }
}
