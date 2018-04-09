package com.marklogic.quickstart;


import com.marklogic.hub.util.Installer;
import com.marklogic.quickstart.service.EntityManagerServiceTest;
import com.marklogic.quickstart.service.FlowManagerServiceTest;
import com.marklogic.quickstart.service.JobServiceTest;
import com.marklogic.quickstart.service.TraceServiceTest;
import com.marklogic.quickstart.web.EntitiesControllerTest;
import com.marklogic.quickstart.web.HubConfigJsonTest;
import com.marklogic.quickstart.web.ProjectsControllerTest;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

@RunWith(Suite.class)
@SuiteClasses( {
    EntityManagerServiceTest.class,
    FlowManagerServiceTest.class,
    JobServiceTest.class,
    TraceServiceTest.class,
    EntitiesControllerTest.class,
    HubConfigJsonTest.class,
    ProjectsControllerTest.class
})

public class WebTestSuite {

    @BeforeClass
    public static void setUp() {
        new Installer().installHubOnce();
    }

    @AfterClass
    public static void tearDown() {
        new Installer().uninstallHub();
    }

}
