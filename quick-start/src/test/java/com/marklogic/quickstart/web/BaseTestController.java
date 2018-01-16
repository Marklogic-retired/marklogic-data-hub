package com.marklogic.quickstart.web;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubTestBase;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.service.ProjectManagerService;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.File;
import java.io.IOException;

public class BaseTestController extends HubTestBase {

    protected static final String PROJECT_PATH = "ye-olde-project";

    protected EnvironmentConfig envConfig;

    @Autowired
    private ProjectManagerService projectManagerService;

    protected void setEnvConfig(EnvironmentConfig envConfig) {

        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        authenticationToken.setEnvironmentConfig(envConfig);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    @Before
    public void baseSetUp() throws IOException {
        envConfig = new EnvironmentConfig(PROJECT_PATH, "local", "admin", "admin");
        setEnvConfig(envConfig);
        DataHub dh = new DataHub(envConfig.getMlSettings());
        dh.initProject();
        projectManagerService.addProject(PROJECT_PATH);
    }

    @After
    public void baseTeardown() throws IOException {
        FileUtils.deleteDirectory(new File(PROJECT_PATH));
    }
}
