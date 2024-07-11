package com.example;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.extra.jdom.JDOMHandle;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.io.marker.XMLWriteHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;

public class MyApp {
    // get a hub config
    @Autowired
    HubConfig hubConfig;

    // get a flow manager
    @Autowired
    FlowManager flowManager;

    @PostConstruct
    public void runFlow() {
        hubConfig.createProject(".");
        hubConfig.withPropertiesFromEnvironment("local");
        hubConfig.refreshProject();
        String doc = "<a/>";
        XMLDocumentManager xmlMgr = hubConfig.newStagingClient().newXMLDocumentManager();
        ServerTransform runFlow = new ServerTransform("ml:inputFlow");
        runFlow.addParameter("entity-name", "Person");
        runFlow.addParameter("flow-name", "input1");
        runFlow.addParameter("options", "{\"your\": \"options\"}");
        runFlow.addParameter("job-id", "job-123");
        InputStreamHandle handle = new InputStreamHandle(new ByteArrayInputStream(doc.getBytes()));
        xmlMgr.write("/example-document.xml", handle, runFlow);
      }

    public static void main(String[] args) {

        // start the Spring application
        SpringApplication app = new SpringApplication(MyApp.class, ApplicationConfig.class);
        app.setWebApplicationType(WebApplicationType.NONE);
        app.run();
    }
}
