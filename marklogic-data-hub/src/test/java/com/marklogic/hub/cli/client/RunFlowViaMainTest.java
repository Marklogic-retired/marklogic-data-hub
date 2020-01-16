package com.marklogic.hub.cli.client;

import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class RunFlowViaMainTest extends HubTestBase {

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().deleteProjectDir();
    }

    @AfterAll
    public static void cleanUp() {
        new Installer().deleteProjectDir();
    }

    @Test
    public void testRunFlow() {
        setupProjectForRunningTestFlow();
        runAsDataHubOperator();

        final String flowName = "testFlow";
        makeInputFilePathsAbsoluteInFlow(flowName);

        Main.main(new String[]{
            "runFlow",
            "-host", host,
            "-username", flowRunnerUser,
            "-password", flowRunnerPassword,
            "-flowName", flowName
        });

        verifyCollectionCountsFromRunningTestFlow();
    }
}
