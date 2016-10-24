package com.marklogic.quickstart.web;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.Application;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.LoginInfo;
import com.marklogic.quickstart.model.Project;
import com.marklogic.quickstart.service.ProjectManagerService;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import java.io.File;
import java.io.IOException;

import static org.junit.Assert.assertEquals;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
@WebAppConfiguration
public class EntitiesControllerTest {

    private static final String PROJECT_PATH = "ye-old-project";
    @Autowired
    MockHttpServletRequest request;

    @Autowired
    MockHttpSession session;

    @Autowired
    EnvironmentConfig envConfig;

    @Autowired
    ProjectManagerService projectManagerService;

    @Autowired
    EntitiesController ec;

    private Project project;

    @Before
    public void setUp() throws IOException {
        LoginInfo loginInfo = new LoginInfo();
        loginInfo.username = "admin";
        loginInfo.password = "admin";
        envConfig.init(PROJECT_PATH, "local", loginInfo);
        DataHub dh = new DataHub(envConfig.getMlSettings());
        dh.initProject();
        project = projectManagerService.addProject(PROJECT_PATH);
    }

    @After
    public void teardown() throws IOException {
        FileUtils.deleteDirectory(new File(PROJECT_PATH));
    }

    @Test
    public void getInputFlowOptions() throws Exception {
        String path = "/some/project/path";
        envConfig.setInitialized(true);
        envConfig.setProjectDir(path);
        envConfig.setMlSettings(new HubConfig(path));
        String s = ec.getInputFlowOptions(project.id, "local", "test-entity", FlowType.INPUT, "flow-name");
        assertEquals("{ \"input_file_path\": \"/some/project/path\" }", s);
    }

    @Test
    public void getInputFlowOptionsWin() throws Exception {
        String path = "C:\\some\\crazy\\path\\to\\project";

        envConfig.setInitialized(true);
        envConfig.setProjectDir(path);
        envConfig.setMlSettings(new HubConfig(path));
        String s = ec.getInputFlowOptions(project.id, "local", "test-entity", FlowType.INPUT, "flow-name");
        assertEquals("{ \"input_file_path\": \"C:\\\\some\\\\crazy\\\\path\\\\to\\\\project\" }", s);
    }

}
