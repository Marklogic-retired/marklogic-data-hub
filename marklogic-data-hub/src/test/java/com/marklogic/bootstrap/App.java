package com.marklogic.bootstrap;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.error.CantUpgradeException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.job.Job;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class App  extends HubTestBase {

    @Autowired
    HubConfig hubConfig;
    @Autowired
    DataHubImpl dataHub;
    @Autowired
    FlowManagerImpl fm;

    @BeforeEach
    void setUp() throws IOException {
        basicSetup();
        getHubAdminConfig();
        //FileUtils.copyFileToDirectory(getResourceFile("flow-manager-test/test-flow.flow.json"), adminHubConfig.getFlowsDir().toFile());

        DataMovementManager stagingDataMovementManager = stagingClient.newDataMovementManager();

        WriteBatcher writeBatcher = stagingDataMovementManager.newWriteBatcher()
            .withBatchSize(2000)
            .withThreadCount(8)

            .onBatchFailure((batch, failure) -> {
                failure.printStackTrace();

            });


        stagingDataMovementManager.startJob(writeBatcher);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        int counter = 0;
        for (int i = 0; i < 1; i++) {
            ArrayList<String> contents = new ArrayList<>();
            for (int j = 0; j < 1; j++) {
                contents.add("\"id\":\"" + counter + "\"");
                counter++;
            }
            StringHandle handle = new StringHandle("{" + String.join(",", contents) + "}").withFormat(Format.JSON);
            writeBatcher.add("/doc-" + i + ".json", metadataHandle, handle);
        }

        writeBatcher.flushAndWait();
    }

    @Test
    public void bootstrapHub() throws JsonProcessingException, InterruptedException {/*
        *//*hubConfig.createProject("ye-olde-project");
        hubConfig.refreshProject();*//*
        FlowRunner fr = new FlowRunnerImpl(hubConfig);

        Flow flow = fm.getFlow("default-ingest");
        fr.withStep(1);
        fr.withFlow(flow);

        fr.withJobId("xsdf");
        Job j = fr.run();
        fr.awaitCompletion();
       ObjectMapper objectMapper = new ObjectMapper();


        System.out.println(Thread.currentThread().getName()+ " : "+objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(j));

    */}

/*
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(App.class, ApplicationConfig.class);
        app.setWebApplicationType(WebApplicationType.NONE);
        ConfigurableApplicationContext ctx = app.run();
    }
*/

}
