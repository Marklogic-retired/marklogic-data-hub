package com.marklogic.quickstart.service;

import com.marklogic.hub.HubConfig;
import com.marklogic.quickstart.Application;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import static org.junit.Assert.*;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(Application.class)
@WebAppConfiguration
public class FlowManagerServiceTest {

    @Autowired
    MockHttpServletRequest request;

    @Autowired
    MockHttpSession session;

    @Autowired
    EnvironmentConfig envConfig;

    @Autowired
    FlowManagerService fm;

    @Test
    public void getFlowMlcpOptionsFromFileNix() throws Exception {
        String pdir = "/some/crazy/path/to/project";
        envConfig.mlSettings = new HubConfig(pdir);
        envConfig.projectDir = pdir;
        envConfig.environment = "local";

        String options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        assertEquals("{ \"input_file_path\": \"/some/crazy/path/to/project\" }", options);
    }

    @Test
    public void getFlowMlcpOptionsFromFileWin() throws Exception {
        String pdir = "C:\\some\\crazy\\path\\to\\project";

        envConfig.mlSettings = new HubConfig(pdir);
        envConfig.projectDir = pdir;
        envConfig.environment = "local";

        String options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        assertEquals("{ \"input_file_path\": \"C:\\\\some\\\\crazy\\\\path\\\\to\\\\project\" }", options);
    }

}
