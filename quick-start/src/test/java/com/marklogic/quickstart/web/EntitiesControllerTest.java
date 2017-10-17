package com.marklogic.quickstart.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.HubConfig;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import java.util.Map;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
@WebAppConfiguration
public class EntitiesControllerTest extends BaseTestController {

    @Autowired
    private EntitiesController ec;

    @Test
    public void getInputFlowOptions() throws Exception {
        String path = "/some/project/path";
        envConfig.setInitialized(true);
        envConfig.setProjectDir(path);
        envConfig.setMlSettings(HubConfig.hubFromEnvironment(path, null));
        Map<String, Object> options = ec.getInputFlowOptions("test-entity", "flow-name");
        JSONAssert.assertEquals("{ \"input_file_path\": \"/some/project/path\" }", new ObjectMapper().writeValueAsString(options), true);
    }

    @Test
    public void getInputFlowOptionsWin() throws Exception {
        String path = "C:\\some\\crazy\\path\\to\\project";

        envConfig.setInitialized(true);
        envConfig.setProjectDir(path);
        envConfig.setMlSettings(HubConfig.hubFromEnvironment(path, null));
        Map<String, Object> options = ec.getInputFlowOptions("test-entity", "flow-name");
        JSONAssert.assertEquals("{ \"input_file_path\": \"C:\\\\some\\\\crazy\\\\path\\\\to\\\\project\" }", new ObjectMapper().writeValueAsString(options), true);
    }

}
