package com.marklogic.hub;


import com.marklogic.hub.collector.DiskQueueTest;
import com.marklogic.hub.collector.EmptyCollectorTest;
import com.marklogic.hub.collector.StreamCollectorTest;
import com.marklogic.hub.core.*;
import com.marklogic.hub.deploy.commands.GenerateHubTDETemplateCommandTest;
import com.marklogic.hub.deploy.commands.GeneratePiiCommandTest;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommandTest;
import com.marklogic.hub.entity.EntityManagerTest;
import com.marklogic.hub.flow.FlowManagerTest;
import com.marklogic.hub.flow.FlowRunnerTest;
import com.marklogic.hub.job.JobManagerTest;
import com.marklogic.hub.job.TracingTest;
import com.marklogic.hub.scaffolding.ScaffoldingTest;
import com.marklogic.hub.scaffolding.ScaffoldingValidatorTest;
import com.marklogic.hub.util.Installer;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses( {
    DiskQueueTest.class,
    EmptyCollectorTest.class,
    StreamCollectorTest.class,
    DataHubInstallTest.class,
    DataHubTest.class,
    DebugLibTest.class,
    HubConfigTest.class,
    HubProjectTest.class,
    GenerateHubTDETemplateCommandTest.class,
    GeneratePiiCommandTest.class,
    LoadUserModulesCommandTest.class,
    EntityManagerTest.class,
    FlowManagerTest.class,
    FlowRunnerTest.class,
    JobManagerTest.class,
    TracingTest.class,
    // these two must be run separately!
    //EndToEndFlowTests.class,
    //ScaffoldingE2E.class,
    ScaffoldingTest.class,
    ScaffoldingValidatorTest.class
})

public class CoreTestSuite {

    @BeforeClass
    public static void setUp() {
        new Installer().installHubOnce();
    }

    @AfterClass
    public static void tearDown() {
        new Installer().uninstallHub();
    }

}
