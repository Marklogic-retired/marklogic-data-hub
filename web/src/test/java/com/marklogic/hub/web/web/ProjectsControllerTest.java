/*
 * Copyright (c) 2020 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.hub.web.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.web.AbstractWebTest;
import com.marklogic.hub.web.model.HubSettings;
import com.marklogic.hub.web.model.Project;
import com.marklogic.hub.web.model.ProjectInfo;
import com.marklogic.hub.web.service.ProjectManagerService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.rules.TemporaryFolder;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ProjectsControllerTest extends AbstractWebTest {

    @Autowired
    ProjectsController pc;

    @Autowired
    ProjectManagerService pms;

    private TemporaryFolder temporaryFolder;

    private String projectPath;

    @BeforeEach
    public void setup() throws IOException {
        pms.reset();
        temporaryFolder = new TemporaryFolder();
        temporaryFolder.create();
        projectPath = temporaryFolder.newFolder("my-project").toString();
        getHubProject().createProject(projectPath);
    }

    @AfterEach
    public void teardownDir() {
        temporaryFolder.delete();
    }

    @Test
    @SuppressWarnings("unchecked")
    public void getProjects() {
        assertEquals(0, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());
        assertEquals(false, pc.getProjects().keySet().contains("lastProject"));

        pc.addProject(projectPath);
        assertEquals(1, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());
        assertEquals(null, pc.getProjects().get("lastProject"));
    }

    @Test
    @SuppressWarnings("unchecked")
    public void addProject() {
        assertEquals(0, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());

        Project project = pc.addProject(projectPath);
        assertEquals(projectPath, project.path);
        assertEquals(1, project.id);
        assertEquals(false, getHubProject().isInitialized());
    }

    @Test
    @SuppressWarnings("unchecked")
    public void getProject() {
        assertEquals(0, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());
        assertEquals(false, pc.getProjects().keySet().contains("lastProject"));

        pc.addProject(projectPath);

        Project project = pc.getProject(1);
        assertEquals(projectPath, project.path);
        assertEquals(1, project.id);
        assertEquals(false, getHubProject().isInitialized());
    }

    @Test
    @SuppressWarnings("unchecked")
    public void removeProject() {
        assertEquals(0, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());

        pc.addProject(projectPath);
        assertEquals(1, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());

        pc.removeProject(1);
        assertEquals(0, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());

    }

    @Test
    @SuppressWarnings("unchecked")
    public void initializeProject() {
        try {
            // Need to use the "real" HubConfigImpl, as the initializeProject method isn't happy with the
            // CGLIB-enhanced HubConfigImpl that's used for testing
            HubConfigImpl proxiedHubConfig = hubConfigInterceptor.getProxiedHubConfig(Thread.currentThread().getName());

            pc.setHubConfig(proxiedHubConfig);
            assertEquals(0, ((Collection<ProjectInfo>) pc.getProjects().get("projects")).size());

            pc.addProject(projectPath);
            assertEquals(1, ((Collection<ProjectInfo>) pc.getProjects().get("projects")).size());

            ObjectMapper objectMapper = new ObjectMapper();
            pc.initializeProject(1, objectMapper.valueToTree(proxiedHubConfig));

            assertTrue(proxiedHubConfig.getHubProject().isInitialized());
        } finally {
            pc.setHubConfig(getHubConfig());
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    public void getDefaults() {
        assertEquals(0, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());

        pc.addProject(projectPath);
        assertEquals(1, ((Collection<ProjectInfo>)pc.getProjects().get("projects")).size());

        HubSettings hubSettings = pc.getDefaults(1);
        assertEquals(projectPath, hubSettings.getProjectDir());
    }

}
