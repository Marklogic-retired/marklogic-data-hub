package com.marklogic.hub.oneui;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand;
import com.marklogic.hub.impl.ArtifactManagerImpl;
import com.marklogic.hub.oneui.auth.LoginInfo;
import com.marklogic.hub.oneui.models.EnvironmentInfo;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.EnvironmentService;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.PropertySource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@PropertySource("classpath:application-test.properties")
@SpringBootTest(classes = {Application.class})
public class TestHelper {
    static final protected Logger logger = LoggerFactory.getLogger(TestHelper.class);

    @Value("${test.mlHost:localhost}")
    public String mlHost;

    @Value("${test.dataHubDeveloperUsername:test-data-hub-developer}")
    public String dataHubDeveloperUsername;
    @Value("${test.dataHubDeveloperPassword:password}")
    public String dataHubDeveloperPassword;

    @Value("${test.dataHubEnvironmentManagerUsername:test-data-hub-environment-manager}")
    public String dataHubEnvironmentManagerUsername;
    @Value("${test.dataHubEnvironmentManagerPassword:password}")
    public String dataHubEnvironmentManagerPassword;

    @Value("${test.adminUserName:test-admin-for-data-hub-tests}")
    public String adminUserName;
    @Value("${test.adminPassword:password}")
    public String adminPassword;

    @Value("${test.dataHubOperatorUsername:test-data-hub-operator}")
    public String dataHubEnvironmentOperatorUsername;

    private API adminAPI;

    private ManageClient client;

    private User user;

    public Path tempProjectDirectory ;

    @Autowired
    private HubConfigSession hubConfig;

    @Autowired
    private EnvironmentService environmentService;

    public ObjectNode validLoadDataConfig ;

    public TestHelper() {
        try {
            tempProjectDirectory = Files.createTempDirectory("one-ui-hub-project");
            validLoadDataConfig = (ObjectNode) new ObjectMapper().readTree("{ \"name\": \"validArtifact\", \"sourceFormat\": \"xml\", \"targetFormat\": \"json\"}");
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new RuntimeException("Unable to bootstrap one-ui tests", e);
        }
    }

    public void authenticateSession() {
        EnvironmentInfo environmentInfo = new EnvironmentInfo(mlHost, "DIGEST", 8000,"DIGEST", 8002,"DIGEST", 8010, "DIGEST", 8011);
        hubConfig.setCredentials(environmentInfo, dataHubDeveloperUsername, dataHubDeveloperPassword);
    }

    public void authenticateSessionAsEnvironmentManager() {
        EnvironmentInfo environmentInfo = new EnvironmentInfo(mlHost, "DIGEST", 8000,"DIGEST", 8002,"DIGEST", 8010, "DIGEST", 8011);
        hubConfig.setCredentials(environmentInfo, dataHubEnvironmentManagerUsername, dataHubEnvironmentManagerPassword);
    }

    public void authenticateSessionAsAdmin() {
        EnvironmentInfo environmentInfo = new EnvironmentInfo(mlHost, "DIGEST", 8000,"DIGEST", 8002,"DIGEST", 8010, "DIGEST", 8011);
        hubConfig.setCredentials(environmentInfo, adminUserName, adminPassword);
    }

    public void setHubProjectDirectory() {
        environmentService.setProjectDirectory(tempProjectDirectory.toAbsolutePath().toString());
        if (!hubConfig.getHubProject().isInitialized()) {
            hubConfig.createProject(environmentService.getProjectDirectory());
            hubConfig.initHubProject();
        }
    }

    public void clearDatabases(String... databases) {
        String collsNotToBeDeleted = Stream.of("http://marklogic.com/data-hub/step-definition",
            "http://marklogic.com/data-hub/flow", "http://marklogic.com/provenance-services/record", "http://marklogic.com/data-hub/load-data-artifact")
            .map(s -> "\"" + s + "\"")
            .collect(Collectors.joining(", "));
        ServerEvaluationCall eval = hubConfig.newStagingClient().newServerEval();
        String installer =
            "declare variable $databases external;\n" +
                "for $database in fn:tokenize($databases, \",\")\n" +
                "return\n" +
                "  xdmp:eval('\n" +
                "    cts:uris((),(),cts:not-query(cts:collection-query(("+collsNotToBeDeleted+")))) ! xdmp:document-delete(.)\n" +
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

    protected void loadHubArtifacts(){
        new LoadHubArtifactsCommand(hubConfig, true).execute(null);
    }

    public void addStagingDoc(String uri, DocumentMetadataHandle meta, String resource) {
        FileHandle handle = new FileHandle(getResourceFile(resource));
        hubConfig.newStagingClient().newDocumentManager().write(uri, meta, handle);
    }

    public File getResourceFile(String resourceName) {
        return new File(Objects.requireNonNull(TestHelper.class.getClassLoader().getResource(resourceName)).getFile());
    }

    public ArtifactManagerImpl getArtifactManager() {
        return new ArtifactManagerImpl(hubConfig);
    }

    public String getLoginPayload(String role)
        throws JsonProcessingException {
        LoginInfo loginInfo = new LoginInfo();
        loginInfo.password = "password";
        loginInfo.mlHost = mlHost;
        switch (role) {
            case "data-hub-developer":
                loginInfo.username = dataHubDeveloperUsername;;
                break;
            case "data-hub-environment-manager":
                loginInfo.username = dataHubEnvironmentManagerUsername;;
                break;
            case "admin":
                loginInfo.username = adminUserName;;
                break;
            default:
                loginInfo.username = "fake";
                break;
        }
        return new ObjectMapper().writeValueAsString(loginInfo);
    }

    public void assignRoleToUsers() {
        assignRoleToUser(dataHubEnvironmentOperatorUsername, "data-hub-operator");
        assignRoleToUser(dataHubDeveloperUsername, "data-hub-developer");
        assignRoleToUser(dataHubEnvironmentManagerUsername, "data-hub-environment-manager");
    }

    private void assignRoleToUser(String username, String role) {
        client = new ManageClient();
        client.setManageConfig(new ManageConfig(mlHost, 8002, adminUserName, adminPassword));
        adminAPI = new API(client);

        user = new User(adminAPI, username);
        user.setRole(Stream.of(role).collect(Collectors.toList()));
        user.save();
    }

    protected EvalResultIterator runJsInDatabase(String query, String databaseName) {
        try {
            return getServerEval(databaseName).javascript(query).eval();
        }
        catch(FailedRequestException e) {
            throw new RuntimeException("Failed to run query:  " + query,e);
        }
    }

    private ServerEvaluationCall getServerEval(String databaseName) {
        return getClientByName(databaseName).newServerEval();
    }

    protected DatabaseClient getClientByName(String databaseName) {
        switch(databaseName) {
            case HubConfig.DEFAULT_FINAL_NAME:
                return hubConfig.newFinalClient(databaseName);
            case HubConfig.DEFAULT_MODULES_DB_NAME:
                return hubConfig.newModulesDbClient();
            case HubConfig.DEFAULT_JOB_NAME:
                return hubConfig.newJobDbClient();
            default:
                return hubConfig.newStagingClient(databaseName);
        }
    }

    protected HubConfig getHubConfig() {
        return this.hubConfig;
    }
}
