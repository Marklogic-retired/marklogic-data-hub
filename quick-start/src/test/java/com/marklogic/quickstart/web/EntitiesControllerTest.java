package com.marklogic.quickstart.web;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.Application;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.service.FlowManagerService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.CustomScopeConfigurer;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.support.SimpleThreadScope;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.junit.Assert.*;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(Application.class)
@WebAppConfiguration
public class EntitiesControllerTest {

    @Autowired
    MockHttpServletRequest request;

    @Autowired
    MockHttpSession session;

    @Autowired
    EnvironmentConfig envConfig;

    @Autowired
    EntitiesController ec;

    @Before
    public void setUp() {
        envConfig.isInitialized = true;
    }


    @Test
    public void getInputFlowOptions() throws Exception {
        envConfig.isInitialized = true;
        envConfig.projectDir = "/some/project/path";
        envConfig.mlSettings = new HubConfig("/some/project/path");
        String s = ec.getInputFlowOptions(session, "test-entity", FlowType.INPUT, "flow-ame");
        assertEquals("{ \"input_file_path\": \"/some/project/path\" }", s);
    }

    @Test
    public void getInputFlowOptionsWin() throws Exception {
        String path = "C:\\some\\crazy\\path\\to\\project";

        envConfig.isInitialized = true;
        envConfig.projectDir = path;
        envConfig.mlSettings = new HubConfig(path);
        String s = ec.getInputFlowOptions(session, "test-entity", FlowType.INPUT, "flow-ame");
        assertEquals("{ \"input_file_path\": \"C:\\\\some\\\\crazy\\\\path\\\\to\\\\project\" }", s);
    }

}
