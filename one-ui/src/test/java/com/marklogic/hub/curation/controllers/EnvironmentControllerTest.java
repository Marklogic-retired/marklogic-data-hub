package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.impl.ArtifactManagerImpl;
import com.marklogic.hub.oneui.AbstractOneUiTest;
import com.marklogic.hub.oneui.auth.AuthenticationFilter;
import com.marklogic.hub.oneui.controllers.EnvironmentController;
import com.marklogic.hub.oneui.exceptions.ProjectDirectoryException;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class EnvironmentControllerTest extends AbstractOneUiTest {

    @Autowired
    EnvironmentController environmentController;

    @Autowired
    EnvironmentService environmentService;

    @Autowired
    LoadDataController controller;

    @Test
    void downloadProject() throws IOException {
        //Creating a load data artifact so it can be verified for download test
        controller.updateArtifact("validArtifact", newLoadDataConfig());

        ArrayNode resultList = (ArrayNode) controller.getArtifacts().getBody();

        assertEquals(1, resultList.size(), "List of load data artifacts should now be 1");

        Path artifactProjectLocation = new ArtifactManagerImpl(hubConfig).buildArtifactProjectLocation(controller.getArtifactType(), "validArtifact", null,false);

        ObjectNode resultByName = controller.getArtifact("validArtifact").getBody();
        assertEquals("validArtifact", resultByName.get("name").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("xml", resultByName.get("sourceFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("json", resultByName.get("targetFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertTrue(artifactProjectLocation.toFile().exists(), "File should have been created in the project directory");

        ObjectNode enrichedJson = controller.setData("validArtifact", new MockMultipartFile[]{ new MockMultipartFile("file", "orig", null, "docTest".getBytes())}).getBody();
        assertEquals(1, enrichedJson.get("fileCount").asInt(), "File should be added to data set.");

        MockHttpServletResponse response = new MockHttpServletResponse();
        environmentController.downloadProject(new MockHttpServletRequest(), response);
        List<String> zipContent = new ArrayList();
        try (ZipInputStream zipStream = new ZipInputStream(new ByteArrayInputStream(response.getContentAsByteArray()))) {
            ZipEntry entry = null;
            while ((entry = zipStream.getNextEntry()) != null) {
                String entryName = entry.getName();
                zipContent.add(entryName);
                zipStream.closeEntry();
            }
        }

        assertFalse(zipContent.isEmpty());
        assertTrue(zipContent.contains("entities" + File.separator));
        assertTrue(zipContent.contains("flows" + File.separator));
        assertTrue(zipContent.contains("loadData" + File.separator));
        assertFalse(zipContent.contains("data-sets" + File.separator));
    }

    @Test
    void installAttemptWithBadDirectory() {
        try {
            final ObjectNode relativePayload = new ObjectMapper().createObjectNode().put("directory", "relative-path");
            assertThrows(ProjectDirectoryException.class, () -> {
                environmentController.install(relativePayload);
                fail("Should have thrown exception for relative path!");
            });
            // check that the environment service indicates that the install is in a dirty state
            assertTrue(environmentService.isInDirtyState(), "Install should be in a dirty state");
            // check that the AuthenticationFilter shows the Data Hub isn't installed after a failed install attempt
            TestAuthenticationFilter authenticationFilter = new TestAuthenticationFilter(environmentService, hubConfig);
            assertFalse(authenticationFilter.isDataHubInstalled(), "AuthenticationFilter shouldn't indicate the Data Hub is installed");
            final ObjectNode nonExistentPayload = new ObjectMapper().createObjectNode().put("directory", "/non-existent");
            assertThrows(ProjectDirectoryException.class, () -> {
                environmentController.install(nonExistentPayload);
            });
        }
        finally{
            environmentService.setIsInDirtyState(false);
        }
    }

    @Test
    public void testManageAdminAndSecurityAuthoritiesForArtifacts() {
        runAsEnvironmentManager();
        List<ArtifactTypeInfo> listTypeInfo = new ArtifactManagerImpl(hubConfig).getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertTrue(typeInfo.getUserCanRead());
        }
    }

    @Test
    public void testAdminAuthoritiesForArtifacts()  {
        runAsAdmin();
        List<ArtifactTypeInfo> listTypeInfo = new ArtifactManagerImpl(hubConfig).getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertFalse(typeInfo.getUserCanRead(), "admin would not allow read but write for deployment!");
        }
    }

    static class TestAuthenticationFilter extends AuthenticationFilter {
        public TestAuthenticationFilter(EnvironmentService environmentService, HubConfigSession hubConfig) {
            super(environmentService, hubConfig);
        }

        public boolean isDataHubInstalled() {
            return super.isDataHubInstalled();
        }
    }
}
