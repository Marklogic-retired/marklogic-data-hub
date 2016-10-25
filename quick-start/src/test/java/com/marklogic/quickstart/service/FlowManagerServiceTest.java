package com.marklogic.quickstart.service;

import com.marklogic.hub.HubConfig;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest()
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
        envConfig.setMlSettings(new HubConfig(pdir));
        envConfig.setProjectDir(pdir);
        envConfig.setEnvironment("local");

        String options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        assertEquals("{ \"input_file_path\": \"/some/crazy/path/to/project\" }", options);
    }

    @Test
    public void getFlowMlcpOptionsFromFileWin() throws Exception {
        String pdir = "C:\\some\\crazy\\path\\to\\project";

        envConfig.setMlSettings(new HubConfig(pdir));
        envConfig.setProjectDir(pdir);
        envConfig.setEnvironment("local");

        String options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        assertEquals("{ \"input_file_path\": \"C:\\\\some\\\\crazy\\\\path\\\\to\\\\project\" }", options);
    }

}
