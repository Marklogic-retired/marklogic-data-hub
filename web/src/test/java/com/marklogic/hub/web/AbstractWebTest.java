package com.marklogic.hub.web;

import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = WebTestConfig.class)
@WebAppConfiguration
public class AbstractWebTest extends HubTestBase {

    @BeforeEach
    void beforeEachQuickStartTest() {
        resetHubProject();
        runAsFlowDeveloper();
    }
}
