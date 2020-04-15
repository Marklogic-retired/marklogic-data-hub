package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.ArtifactManager;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.central.AbstractHubCentralTest;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

public class EnvironmentControllerTest extends AbstractHubCentralTest {

    @Autowired
    EnvironmentController environmentController;

    @Autowired
    LoadDataController controller;

    @Autowired
    Environment environment;

    @Test
    @Disabled("This will be re-implemented")
    void downloadProject() throws IOException {
        //Creating a load data artifact so it can be verified for download test
//        controller.updateArtifact("validArtifact", newLoadDataConfig());
//
//        ArrayNode resultList = (ArrayNode) controller.getArtifacts().getBody();
//
//        assertEquals(1, resultList.size(), "List of load data artifacts should now be 1");
//
//        Path artifactProjectLocation = new ArtifactManagerImpl(hubConfig).buildArtifactProjectLocation(controller.getArtifactType(), "validArtifact", null, false);
//
//        ObjectNode resultByName = controller.getArtifact("validArtifact").getBody();
//        assertEquals("validArtifact", resultByName.get("name").asText(), "Getting artifact by name should return object with expected properties");
//        assertEquals("xml", resultByName.get("sourceFormat").asText(), "Getting artifact by name should return object with expected properties");
//        assertEquals("json", resultByName.get("targetFormat").asText(), "Getting artifact by name should return object with expected properties");
//        assertTrue(artifactProjectLocation.toFile().exists(), "File should have been created in the project directory");
//
//        ObjectNode enrichedJson = controller.setData("validArtifact", new MockMultipartFile[]{new MockMultipartFile("file", "orig", null, "docTest".getBytes())}).getBody();
//        assertEquals(1, enrichedJson.get("fileCount").asInt(), "File should be added to data set.");
//
//        MockHttpServletResponse response = new MockHttpServletResponse();
//        environmentController.downloadProject(new MockHttpServletRequest(), response);
//        List<String> zipContent = new ArrayList();
//        try (ZipInputStream zipStream = new ZipInputStream(new ByteArrayInputStream(response.getContentAsByteArray()))) {
//            ZipEntry entry = null;
//            while ((entry = zipStream.getNextEntry()) != null) {
//                String entryName = entry.getName();
//                zipContent.add(entryName);
//                zipStream.closeEntry();
//            }
//        }
//
//        assertFalse(zipContent.isEmpty());
//        assertTrue(zipContent.contains("entities" + File.separator));
//        assertTrue(zipContent.contains("flows" + File.separator));
//        assertTrue(zipContent.contains("loadData" + File.separator));
//        assertFalse(zipContent.contains("data-sets" + File.separator));
    }

    @Test
    public void testManageAdminAndSecurityAuthoritiesForArtifacts() {
        runAsEnvironmentManager();
        List<ArtifactTypeInfo> listTypeInfo = ArtifactManager.on(getHubConfig()).getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertTrue(typeInfo.getUserCanRead());
        }
    }

    @Test
    public void testAdminAuthoritiesForArtifacts() {
        runAsAdmin();
        List<ArtifactTypeInfo> listTypeInfo = ArtifactManager.on(getHubConfig()).getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertFalse(typeInfo.getUserCanRead(), "admin would not allow read but write for deployment!");
        }
    }

    @Test
    void testGetProjectInfo() {
        JsonNode resp = environmentController.getProjectInfo();
        assertNotNull(resp);
        assertNotNull(resp.get("dataHubVersion"));
        assertNotNull(resp.get("projectName"));
        assertNotNull(resp.get("marklogicVersion"));
    }

    @Test
    public void getInfo() {
        String expectedTimeout = environment.getProperty("server.servlet.session.timeout");
        String actualTimeout = Objects.requireNonNull(environmentController.getInfo().getBody()).get("session.timeout");
        assertEquals(expectedTimeout, actualTimeout);
    }
}
