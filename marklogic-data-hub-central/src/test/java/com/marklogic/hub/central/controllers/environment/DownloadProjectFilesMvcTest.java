package com.marklogic.hub.central.controllers.environment;

import com.marklogic.hub.central.AbstractMvcTest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

public class DownloadProjectFilesMvcTest extends AbstractMvcTest {

    private final static String HUB_CENTRAL_FILES_PATH = "/api/environment/downloadHubCentralFiles";
    private final static String PROJECT_FILES_PATH = "/api/environment/downloadProjectFiles";

    @AfterEach
    void afterEach() {
        deleteProtectedPaths();
    }

    @Test
    void permittedUser() throws Exception {
        installReferenceModelProject();

        loginAsTestUserWithRoles("hub-central-downloader");

        mockMvc.perform(get(HUB_CENTRAL_FILES_PATH).session(mockHttpSession))
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(MediaType.APPLICATION_OCTET_STREAM_VALUE, response.getContentType());
                assertEquals("attachment; filename=datahub-hub-central-files.zip", response.getHeader("Content-Disposition"));

                // We trust the zip to be constructed correctly based on DownloadConfigurationFilesTest, so just
                // doing a quick sanity check here
                List<String> entryNames = new ArrayList<>();
                try (ZipInputStream zipStream = new ZipInputStream(new ByteArrayInputStream(response.getContentAsByteArray()))) {
                    ZipEntry entry;
                    while ((entry = zipStream.getNextEntry()) != null) {
                        entryNames.add(entry.getName());
                        zipStream.closeEntry();
                    }
                }
                assertTrue(entryNames.contains("entities/Order.entity.json"));
                assertTrue(entryNames.contains("entities/Customer.entity.json"));
            });
        mockMvc.perform(get(PROJECT_FILES_PATH).session(mockHttpSession))
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(MediaType.APPLICATION_OCTET_STREAM_VALUE, response.getContentType());
                assertEquals("attachment; filename=datahub-project-files.zip", response.getHeader("Content-Disposition"));

                List<String> entryNames = new ArrayList<>();
                try (ZipInputStream zipStream = new ZipInputStream(new ByteArrayInputStream(response.getContentAsByteArray()))) {
                    ZipEntry entry;
                    while ((entry = zipStream.getNextEntry()) != null) {
                        entryNames.add(entry.getName());
                        zipStream.closeEntry();
                    }
                }
                assertTrue(entryNames.contains("entities/Order.entity.json"));
                assertTrue(entryNames.contains("entities/Customer.entity.json"));

                assertTrue(entryNames.contains("build.gradle"));
                assertTrue(entryNames.contains("src/main/hub-internal-config/security/roles/data-hub-developer.json"));
            });
    }

    @Test
    void forbiddenUser() throws Exception {
        loginAsTestUserWithRoles("hub-central-user");
        verifyRequestIsForbidden(get(HUB_CENTRAL_FILES_PATH));
        verifyRequestIsForbidden(get(PROJECT_FILES_PATH));
    }
}
