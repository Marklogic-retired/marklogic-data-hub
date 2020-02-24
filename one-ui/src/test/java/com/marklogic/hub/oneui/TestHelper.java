package com.marklogic.hub.oneui;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.hub.oneui.auth.MarkLogicAuthenticationManager;
import com.marklogic.hub.oneui.models.EnvironmentInfo;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;

@Configuration
@PropertySource("classpath:application-test.properties")
public class TestHelper {
    static final protected Logger logger = LoggerFactory.getLogger(TestHelper.class);
    @Autowired
    MarkLogicAuthenticationManager markLogicAuthenticationManager;

    @Value("${test.mlHost:localhost}")
    public String mlHost;

    @Value("${test.dataHubDeveloperUsername:data-hub-developer-user}")
    public String dataHubDeveloperUsername;
    @Value("${test.dataHubDeveloperPassword:data-hub-developer-user}")
    public String dataHubDeveloperPassword;

    @Value("${test.dataHubEnvironmentManagerUsername:data-hub-environment-manager-user}")
    public String dataHubEnvironmentManagerUsername;
    @Value("${test.dataHubEnvironmentManagerPassword:data-hub-environment-manager-user}")
    public String dataHubEnvironmentManagerPassword;

    public Path tempProjectDirectory = Files.createTempDirectory("one-ui-hub-project");

    @Autowired
    private HubConfigSession hubConfig;

    @Autowired
    private EnvironmentService environmentService;

    public ObjectNode validLoadDataConfig = (ObjectNode) new ObjectMapper().readTree("{ \"name\": \"validArtifact\", \"sourceFormat\": \"xml\", \"targetFormat\": \"json\"}");

    public TestHelper() throws IOException {
    }

    public void authenticateSession() {
       EnvironmentInfo environmentInfo = new EnvironmentInfo(mlHost, "DIGEST", 8000,"DIGEST", 8002,"DIGEST", 8010, "DIGEST", 8011);
       hubConfig.setCredentials(environmentInfo, dataHubDeveloperUsername, dataHubDeveloperPassword);
    }

    public void authenticateSessionAsEnvironmentManager() {
        EnvironmentInfo environmentInfo = new EnvironmentInfo(mlHost, "DIGEST", 8000,"DIGEST", 8002,"DIGEST", 8010, "DIGEST", 8011);
        hubConfig.setCredentials(environmentInfo, dataHubEnvironmentManagerUsername, dataHubEnvironmentManagerPassword);
    }

    public void setHubProjectDirectory() {
        environmentService.setProjectDirectory(tempProjectDirectory.toAbsolutePath().toString());
        if (!hubConfig.getHubProject().isInitialized()) {
            hubConfig.createProject(environmentService.getProjectDirectory());
            hubConfig.initHubProject();
        }
    }

    //not getting uris of prov collection as they cannot be deleted by flow-developer
    public void clearDatabases(String... databases) {
        ServerEvaluationCall eval = hubConfig.newStagingClient().newServerEval();
        String installer =
            "declare variable $databases external;\n" +
                "for $database in fn:tokenize($databases, \",\")\n" +
                "return\n" +
                "  xdmp:eval('\n" +
                "    cts:uris((),(),cts:not-query(cts:collection-query(\"http://marklogic.com/provenance-services/record\"))) ! xdmp:document-delete(.)\n" +
                "  ',\n" +
                "  (),\n" +
                "  map:entry(\"database\", xdmp:database($database))\n" +
                "  )";
        eval.addVariable("databases", String.join(",", databases));
        EvalResultIterator result = eval.xquery(installer).eval();
        if (result.hasNext()) {
            logger.error(result.next().getString());
        }
    }

    public void addStagingDoc(String uri, DocumentMetadataHandle meta, String resource) {
        FileHandle handle = new FileHandle(getResourceFile(resource));
        hubConfig.newStagingClient().newDocumentManager().write(uri, meta, handle);
    }

    public File getResourceFile(String resourceName) {
        return new File(Objects.requireNonNull(TestHelper.class.getClassLoader().getResource(resourceName)).getFile());
    }
}
