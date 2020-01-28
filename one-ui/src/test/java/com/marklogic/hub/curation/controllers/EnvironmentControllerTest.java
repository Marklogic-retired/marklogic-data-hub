package com.marklogic.hub.curation.controllers;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.oneui.Application;
import com.marklogic.hub.oneui.TestHelper;
import com.marklogic.hub.oneui.controllers.EnvironmentController;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {Application.class, ApplicationConfig.class, FlowControllerTest.class})
public class EnvironmentControllerTest {

    @Autowired
    private TestHelper testHelper;

    @Autowired
    private EnvironmentController environmentController;

    @BeforeEach
    void before(){
        testHelper.authenticateSession();
    }

    @Test
    void downloadProject() throws IOException {
        MockHttpServletResponse response = new MockHttpServletResponse();
        environmentController.downloadProject(new MockHttpServletRequest(), response);
        List<String> zipContent = new ArrayList();
        try(ZipInputStream zipStream = new ZipInputStream(new ByteArrayInputStream(response.getContentAsByteArray()))) {
            ZipEntry entry = null;
            while ((entry = zipStream.getNextEntry()) != null) {
                String entryName = entry.getName();
                zipContent.add(entryName);
                zipStream.closeEntry();
            }
        }

        Assertions.assertFalse(zipContent.isEmpty());
        Assertions.assertTrue(zipContent.contains("entities" + File.separator));
        Assertions.assertTrue(zipContent.contains("flows" + File.separator));
    }
}
