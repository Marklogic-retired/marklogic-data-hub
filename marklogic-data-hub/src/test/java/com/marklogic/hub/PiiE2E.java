package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.security.DeployProtectedPathsCommand;
import com.marklogic.appdeployer.command.security.DeployQueryRolesetsCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.command.security.DeployUsersCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.FixMethodOrder;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Stream;

import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class PiiE2E extends HubTestBase
{
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();
    private static DatabaseClient clerkClient, officerClient;

    private SimpleAppDeployer deployer;
    private AppConfig secAppConfig;

    @Autowired
    protected EntityManager entityManager;

    @Autowired
    protected FlowManager flowManager;

    @Autowired
    private Scaffolding scaffolding;

    @Autowired
    private HubProject project;

    @AfterAll
    public static void teardown()
    {
        new Installer().teardownProject();
    }

    @BeforeAll
    public static void setupAll() throws Exception
    {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().teardownProject();
        new Installer().setupProject();
        Path src = Paths.get(PiiE2E.class.getClassLoader().getResource("pii-test").toURI());
        Path dest = Paths.get(PROJECT_PATH).getFileName().toAbsolutePath();
        Stream<Path> stream = Files.walk(src);
        stream.filter(f -> !Files.isDirectory(f)).forEach(sourcePath -> {
            try {
                FileUtils.copyInputStreamToFile(
                    Files.newInputStream(sourcePath),
                    dest.resolve(src.relativize(sourcePath)).toFile());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });

        new Installer().setupProject();
    }

    @BeforeEach
    public void setup()
    {
        Assumptions.assumeTrue(!(isCertAuth() || isSslRun()));
        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        installHubModules();
        installUserModules(getDataHubAdminConfig(), true);
        // Hardcoding to "digest" auth for now
        // needs to be final db
        clerkClient = DatabaseClientFactory.newClient(finalClient.getHost(), finalPort, HubConfig.DEFAULT_FINAL_NAME,
            "SydneyGardner", "x", Authentication.DIGEST);
        officerClient = DatabaseClientFactory.newClient(finalClient.getHost(), finalPort, HubConfig.DEFAULT_FINAL_NAME,
            "GiannaEmerson", "x", Authentication.DIGEST);

        try {
            runInputFLow();
            runHarmonizeFlow("harmonizer", flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME);
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }

        // command list for deploying/undeploying security
        HubConfigImpl hubConfig = (HubConfigImpl) getDataHubAdminConfig();
        // Security
        List<Command> securityCommands = new ArrayList<Command>();
        // these two should already be there... we don't want to remove them
        // securityCommands.add(new DeployHubRolesCommand(hubConfig));
        // securityCommands.add(new DeployHubUsersCommand(hubConfig));
        securityCommands.add(new DeployRolesCommand());
        securityCommands.add(new DeployUsersCommand());
        // deploy just these users now...
        deployer = new SimpleAppDeployer(((HubConfigImpl)hubConfig).getManageClient(), ((HubConfigImpl)hubConfig).getAdminManager());
        deployer.setCommands(securityCommands);
        secAppConfig = hubConfig.getAppConfig();
        secAppConfig.setConfigDir(new ConfigDir(hubConfig.getUserConfigDir().toFile()));

        deployer.deploy(secAppConfig);
        securityCommands.add(new DeployProtectedPathsCommand());
        securityCommands.add(new DeployQueryRolesetsCommand());
        // now add the paths for test bodies
        deployer.setCommands(securityCommands);
    }

    @Test
    public void testPiiE2E() throws Exception
    {

        // Clerk (without harmonized-reader role) shouldn't be able to see harmonized
        // docs
        assertEquals("{}", getCustomerHistory(clerkClient, "Holland"));
        assertEquals("{}", getCustomerHistoryBySSN(clerkClient, "228-80-9858"));

        // Compliance officer should be able see harmonized docs including ssn
        assertEquals(
            "{\"fullName\":\"Ellie Holland\",\"worksFor\":\"SuperMemo Limited\",\"email\":\"ellie.holland@supermemolimited.biz\",\"ssn\":\"164-32-6412\"}",
            getCustomerHistory(officerClient, "Holland"));
        assertEquals(
            "{\"fullName\":\"Melanie Douglas\",\"worksFor\":\"Erntogra Inc.\",\"email\":\"melanie.douglas@erntograinc.eu\",\"ssn\":\"228-80-9858\"}",
            getCustomerHistoryBySSN(officerClient, "228-80-9858"));

        // Compliance officer should not be able to update harmonized docs
        try {
            updateHarmonizedDocument(officerClient);
            fail("Officer client should be able to update");
        } catch (Exception e) {
            Assertions.assertTrue(e.getMessage().contains("Permission denied"));
        }
        // verify that doc is not changed
        assertEquals(
            "{\"fullName\":\"Morgan King\",\"worksFor\":\"Linger Company\",\"email\":\"morgan.king@lingercompany.com\",\"ssn\":\"136-70-5036\"}",
            getCustomerHistory(officerClient, "King"));

        // Provide "harmonized-reader" role to clerk, "harmonized-updater" to compliance
        // officer and make "ssn" as pii in the entity
        Files.walk(Paths.get(projectPath.toUri()))
            .filter(path -> path.toAbsolutePath().toString().contains("clerk.json")
                || path.toAbsolutePath().toString().contains("Customer.entity.json")
                || path.toAbsolutePath().toString().contains("compliance-officer.json"))
            .forEach(f -> {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode rootNode = null;
                File jsonFile = f.toFile();
                try {
                    rootNode = mapper.readTree(jsonFile);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
                if (jsonFile.getAbsolutePath().contains("clerk.json")) {
                    ((ArrayNode) rootNode.withArray("role")).insert(0, new TextNode("harmonized-reader"));
                }
                else if (jsonFile.getAbsolutePath().contains("compliance-officer.json")) {
                    ((ArrayNode) rootNode.withArray("role")).insert(0, new TextNode("harmonized-updater"));
                }
                else {
                    ((ArrayNode) rootNode.with("definitions").with("Customer").withArray("pii")).insert(
                        0,
                        new TextNode("ssn"));
                }
                try {
                    FileUtils.write(jsonFile, rootNode.toString());
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });

        // save pii, install user modules and deploy security
        installUserModules(getDataHubAdminConfig(), true);
        entityManager.savePii();

        try {
            deploySecurity();

            // Clerk able to see harmonized document but not ssn
            assertEquals(
                "{\"fullName\":\"Ellie Holland\",\"worksFor\":\"SuperMemo Limited\",\"email\":\"ellie.holland@supermemolimited.biz\"}",
                getCustomerHistory(clerkClient, "Holland"));
            // Clerk unable to search by "ssn"
            assertEquals("{}", getCustomerHistoryBySSN(clerkClient, "228-80-9858"));

            // Compliance oficer able to search using ssn and see all fields in harmonized
            // document
            assertEquals(
                "{\"fullName\":\"Ellie Holland\",\"worksFor\":\"SuperMemo Limited\",\"email\":\"ellie.holland@supermemolimited.biz\",\"ssn\":\"164-32-6412\"}",
                getCustomerHistory(officerClient, "Holland"));
            assertEquals(
                "{\"fullName\":\"Melanie Douglas\",\"worksFor\":\"Erntogra Inc.\",\"email\":\"melanie.douglas@erntograinc.eu\",\"ssn\":\"228-80-9858\"}",
                getCustomerHistoryBySSN(officerClient, "228-80-9858"));

            updateHarmonizedDocument(officerClient);
            // verify that doc is changed
            assertEquals(
                "{\"fullName\":\"Morgan King\",\"worksFor\":\"MarkLogic\",\"email\":\"morgan.king@lingercompany.com\",\"ssn\":\"136-70-5036\"}",
                getCustomerHistory(officerClient, "King"));

        } finally {
            undeploySecurity();
        }
    }

    @Test
    public void testSavePii() throws Exception
    {
        installEntities();
        entityManager.savePii();

        verifyResults(getDataHubAdminConfig().getUserSecurityDir());

    }

    private void verifyResults(Path path) throws IOException
    {
        Set<String> actuals = new HashSet<String>();

        Files.walk(path).filter(f -> Files.isRegularFile(f)).forEach(f -> {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = null;
            File jsonFile = f.toFile();
            logger.debug("Putting file in set: " + f.getFileName());
            try {
                rootNode = mapper.readTree(jsonFile);
                logger.info("whose contents were " + rootNode.toString());
                actuals.add(rootNode.toString().trim());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
        InputStreamReader keyDir = new InputStreamReader(
            PiiE2E.class.getClassLoader().getResourceAsStream("pii-test/keys"));
        BufferedReader br = new BufferedReader(keyDir);
        String keyFileName = null;

        int nFiles = 0;
        try {
            while ((keyFileName = br.readLine()) != null) {
                nFiles++;
                ObjectMapper mapper = new ObjectMapper();
                InputStreamReader configReader = new InputStreamReader(
                    PiiE2E.class.getClassLoader().getResourceAsStream("pii-test/keys/" + keyFileName));
                String expected = mapper.readTree(configReader).toString().trim();
                logger.info("Checking contents of " + keyFileName + " which are " + expected);
                assertTrue("Collected actuals must contain key " + keyFileName + ".", actuals.contains(expected));
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    private void deploySecurity()
    {
        deployer.deploy(secAppConfig);
    }

    private void undeploySecurity()
    {
        deployer.undeploy(secAppConfig);
    }

    private void installEntities()
    {
        Path employeeDir = project.getEntityDir("EmployeePii");
        employeeDir.toFile().mkdirs();
        Assertions.assertTrue(employeeDir.toFile().exists());
        FileUtil.copy(getResourceStream("pii-test/test-entities/EmployeePii.entity.json"), employeeDir.resolve("EmployeePii.entity.json").toFile());
    }

    private void runInputFLow() throws URISyntaxException
    {
        int stagingCount = getStagingDocCount();
        int finalCount = getFinalDocCount();

        ServerTransform runFlow = new ServerTransform("ml:inputFlow");
        runFlow.addParameter("entity-name", "SupportCall");
        runFlow.addParameter("flow-name", "test-data");
        runFlow.addParameter("job-id", UUID.randomUUID().toString());

        DataMovementManager stagingDataMovementManager = flowRunnerClient.newDataMovementManager();

        WriteBatcher batcher = stagingDataMovementManager.newWriteBatcher();
        batcher.withBatchSize(1).withTransform(runFlow);
        batcher.onBatchSuccess(batch -> {
        }).onBatchFailure((batch, throwable) -> {
            throw new RuntimeException(throwable);
        });
        stagingDataMovementManager.startJob(batcher);
        try (Stream<Path> paths = Files
            .walk(Paths.get(PiiE2E.class.getClassLoader().getResource("pii-test/test-data").toURI()))) {

            paths.forEach(path -> {
                if (!Files.isDirectory(path)) {
                    FileHandle handle = new FileHandle(path.toFile());
                    batcher.add("/input/" + path.toFile().getName(),
                        new DocumentMetadataHandle().withCollections("SupportCall"), handle);
                }
            });
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        batcher.flushAndWait();

        stagingCount = getStagingDocCount();
        finalCount = getFinalDocCount();

        assertTrue(
            "After save, pii, this value is 16, before, it's 15.  Actual is " + stagingCount,
            stagingCount == 15 || stagingCount == 16);
        assertTrue(
            "After save, pii, this value is 4, before, it's 3.  Actual is " + finalCount,
            finalCount == 3 || finalCount == 4);
    }

    private void runHarmonizeFlow(String flowName, DatabaseClient srcClient, String destDb)
    {
        Flow harmonizeFlow = flowManager.getFlow("SupportCall", flowName, FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner().withFlow(harmonizeFlow).withBatchSize(3).withThreadCount(1)
            .withSourceClient(srcClient).withDestinationDatabase(destDb)
            .onItemComplete((String jobId, String itemId) -> {
                logger.debug("Completed item " + itemId);
            }).onItemFailed((String jobId, String itemId) -> {
                logger.debug("Failed item " + itemId);
            });

        flowRunner.run();
        flowRunner.awaitCompletion();
        int finalCount = getFinalDocCount();

        assertTrue(
            "After save, pii, this value is 16, before, it's 15.  Actual is " + finalCount,
            finalCount == 15 || finalCount == 16);

    }

    private String getCustomerHistory(DatabaseClient client, String name)
    {
        String query = "'use strict';\r\n"
            + "var res = cts.search(cts.jsonPropertyScopeQuery(\"Customer\", cts.jsonPropertyWordQuery(\"fullName\", \""
            + name + "\")));\r\n" + "var jsonResult;" + "if (fn.head(res)) {\r\n"
            + "    jsonResult = JSON.stringify(JSON.parse(res).envelope.instance.SupportCall.caller.Customer);\r\n"
            + "} else {\r\n" + "    jsonResult = { };\r\n" + "}\r\n" + "jsonResult";
        return client.newServerEval().javascript(query).evalAs(String.class);
    }

    private String getCustomerHistoryBySSN(DatabaseClient client, String ssn)
    {
        String query = "'use strict';\r\n"
            + "var res = cts.search(cts.jsonPropertyScopeQuery(\"Customer\", cts.jsonPropertyWordQuery(\"ssn\", \""
            + ssn + "\")));\r\n" + "var jsonResult;" + "if (fn.head(res)) {\r\n"
            + "    jsonResult = JSON.stringify(JSON.parse(res).envelope.instance.SupportCall.caller.Customer);\r\n"
            + "} else {\r\n" + "    jsonResult = { };\r\n" + "}\r\n" + "jsonResult";
        return client.newServerEval().javascript(query).evalAs(String.class);
    }

    private void updateHarmonizedDocument(DatabaseClient client)
    {
        String query = "declareUpdate();\r\n" + "var doc = cts.doc(\"/input/UU4BRHD9K.json\");\r\n"
            + "var docObj = doc.toObject();\r\n"
            + "docObj.envelope.instance.SupportCall.caller.Customer.worksFor= \"MarkLogic\";\r\n"
            + "xdmp.nodeReplace(doc, docObj);";
        client.newServerEval().javascript(query).eval();
    }
}
