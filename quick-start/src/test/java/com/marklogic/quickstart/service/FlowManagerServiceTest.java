package com.marklogic.quickstart.service;

import com.marklogic.hub.HubConfig;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.context.SecurityContextHolder;
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
    FlowManagerService fm;

    private void setEnvConfig(EnvironmentConfig envConfig) {

        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        authenticationToken.setEnvironmentConfig(envConfig);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    @Test
    public void getFlowMlcpOptionsFromFileNix() throws Exception {
        String pdir = "/some/crazy/path/to/project";
        EnvironmentConfig envConfig = new EnvironmentConfig(pdir, "local", "admin", "admin");
        envConfig.setMlSettings(new HubConfig(pdir));
        setEnvConfig(envConfig);

        String options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        assertEquals("{ \"input_file_path\": \"/some/crazy/path/to/project\" }", options);
    }

    @Test
    public void getFlowMlcpOptionsFromFileWin() throws Exception {
        String pdir = "C:\\some\\crazy\\path\\to\\project";
        EnvironmentConfig envConfig = new EnvironmentConfig(pdir, "local", "admin", "admin");
        envConfig.setMlSettings(new HubConfig(pdir));
        setEnvConfig(envConfig);

        String options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        assertEquals("{ \"input_file_path\": \"C:\\\\some\\\\crazy\\\\path\\\\to\\\\project\" }", options);
    }

}
