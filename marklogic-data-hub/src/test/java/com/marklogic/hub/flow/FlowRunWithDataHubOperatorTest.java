/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.flow;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.security.DeployUsersCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.List;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class FlowRunWithDataHubOperatorTest extends HubTestBase {

    @Autowired
    private FlowManagerImpl fm;

    @Autowired
    private FlowRunnerImpl fr;

    @Autowired
    private HubConfigImpl hubConfig;
    SimpleAppDeployer deployer;
    AppConfig secAppConfig;
    List<ConfigDir> configDirs = new ArrayList<>();

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().deleteProjectDir();
    }

    @AfterAll
    public static void cleanUp(){
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setupEach() throws Exception {
        Assumptions.assumeTrue(!isCertAuth() && isVersionCompatibleWith520Roles());
        new DatabaseManager(adminHubConfig.getManageClient()).clearDatabase(HubConfig.DEFAULT_MODULES_DB_NAME,true);
        configDirs.addAll(adminHubConfig.getAppConfig().getConfigDirs());

        String opString = "{\n" +
            "  \"user-name\": \"test-data-hub-operator\",\n" +
            "  \"password\": \"test-data-hub-operator\",\n" +
            "  \"role\": [\"data-hub-operator\"]\n" +
            "}";
        String devString = "{\n" +
            "  \"user-name\": \"test-data-hub-developer\",\n" +
            "  \"password\": \"test-data-hub-developer\",\n" +
            "  \"role\": [\"data-hub-developer\"]\n" +
            "}";
        FileUtils.writeStringToFile(hubConfig.getUserSecurityDir().resolve("users").resolve("test-data-hub-operator.json").toFile(),
            opString);
        FileUtils.writeStringToFile(hubConfig.getUserSecurityDir().resolve("users").resolve("test-data-hub-developer.json").toFile(),
            devString);
        setupUser(true);

        //Load hub modules, rest extensions and artifacts as "data-hub-developer"
        getHubFlowRunnerConfig("test-data-hub-developer", "test-data-hub-developer");
        installHubModules();
        setupProjectForRunningTestFlow(getHubFlowRunnerConfig("test-data-hub-developer", "test-data-hub-developer"));

        //Run flow as "data-hub-operator"
        getHubFlowRunnerConfig("test-data-hub-operator", "test-data-hub-operator");
    }

    @AfterEach
    public void tearDownEach() {
        getDataHubAdminConfig();
        setupUser(false);
        new DatabaseManager(adminHubConfig.getManageClient()).clearDatabase(HubConfig.DEFAULT_MODULES_DB_NAME,true);

        //Install hub modules again as "flow-developer"
        installHubModules();
        adminHubConfig.getAppConfig().setConfigDirs(configDirs);
    }

    private void setupUser(boolean create) {
        List<Command> securityCommands = new ArrayList<Command>();
        securityCommands.add(new DeployUsersCommand());
        deployer = new SimpleAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager());
        deployer.setCommands(securityCommands);
        secAppConfig = hubConfig.getAppConfig();
        secAppConfig.setConfigDir(new ConfigDir(hubConfig.getUserConfigDir().toFile()));
        deployer.setCommands(securityCommands);
        if(create) {
            deployer.deploy(secAppConfig);
        }
        else {
            deployer.undeploy(secAppConfig);
        }

    }

    @Test
    public void testRunFlow() throws Exception {
        RunFlowResponse resp = fr.runFlow("testFlow");
        fr.awaitCompletion();
        getDataHubAdminConfig();
        //job docs cannot be read by "flow-developer-user", so creating a client using 'secUser' which is 'admin'
        DatabaseClient client = getClient(host,jobPort, HubConfig.DEFAULT_JOB_NAME, secUser, secPassword, jobAuthMethod);
        JSONDocumentManager docMgr = client.newJSONDocumentManager();
        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        docMgr.readMetadata("/jobs/" + resp.getJobId()+".json", metadataHandle);
        DocumentMetadataHandle.DocumentPermissions perms = metadataHandle.getPermissions();
        Assertions.assertEquals(1, perms.get("flow-developer-role").size());
        Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("flow-operator-role").iterator().next());
        Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("flow-developer-role").iterator().next());
        Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-job-internal").iterator().next());
        Assertions.assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-job-reader").iterator().next());

        String docID = getStringQueryResults("fn:head(cts:uris((),(),cts:collection-query('Batch')))", HubConfig.DEFAULT_JOB_NAME);
        docMgr.readMetadata(docID, metadataHandle);
        perms = metadataHandle.getPermissions();
        Assertions.assertEquals(1, perms.get("flow-developer-role").size());
        Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("flow-operator-role").iterator().next());
        Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("flow-developer-role").iterator().next());
        Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-job-internal").iterator().next());
        Assertions.assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-job-reader").iterator().next());

        client.newServerEval().xquery("cts:uris() ! xdmp:document-delete(.)").eval();

        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-coll") == 25);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-tab-coll") == 25);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "json-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "json-map") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map") == 1);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        XMLDocumentManager xmlDocMgr = stagingClient.newXMLDocumentManager();
        DocumentMetadataHandle xmlMetadataHandle = new DocumentMetadataHandle();
        xmlDocMgr.readMetadata("/ingest-xml.xml", xmlMetadataHandle);
        DocumentMetadataHandle.DocumentPermissions xmlPerms = xmlMetadataHandle.getPermissions();
        Assertions.assertEquals(2, xmlPerms.get("data-hub-operator").size());
        RunStepResponse stepResp = resp.getStepResponses().get("1");
        Assertions.assertNotNull(stepResp.getStepStartTime());
        Assertions.assertNotNull(stepResp.getStepEndTime());
        EvalResultIterator itr = runInDatabase("fn:collection(\"csv-coll\")[1]/envelope/headers/createdUsingFile", HubConfig.DEFAULT_STAGING_NAME);
        EvalResult res = itr.next();
        StringHandle sh = new StringHandle();
        res.get(sh);
        String file = sh.get();
        Assertions.assertNotNull(file);
        Assertions.assertTrue(file.contains("ingest.csv"));
    }
}
