package com.marklogic.hub.master;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.hub.*;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.IOUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class MasterTest extends HubTestBase {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();

    @Autowired
    HubProject project;

    @Autowired
    HubConfig hubConfig;
    @Autowired
    private FlowManager flowManager;
    @Autowired
    private FlowRunner flowRunner;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().setupProject();
    }

    @AfterAll
    public static void teardown() {
        new Installer().teardownProject();
    }

    @AfterEach
    public void afterEach() {
        this.deleteProjectDir();
        clearDatabases(HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    private void installProject() throws IOException {
        LoadTestModules.loadTestModules(host, finalPort, secUser, secPassword, HubConfig.DEFAULT_MODULES_DB_NAME);
        String[] directoriesToCopy = new String[]{"input", "flows", "step-definitions", "entities", "mappings"};
        for (final String subDirectory : directoriesToCopy) {
            final Path subProjectPath = projectPath.resolve(subDirectory);
            subProjectPath.toFile().mkdir();
            Path subResourcePath = Paths.get("master-test", subDirectory);
            copyFileStructure(subResourcePath, subProjectPath);
        }
    }

    private void copyFileStructure(Path resourcePath, Path projectPath) throws IOException {
        for (File childFile: getResourceFile(resourcePath.toString().replaceAll("\\\\","/")).listFiles()) {
            if (childFile.isDirectory()) {
                Path subProjectPath = projectPath.resolve(childFile.getName());
                subProjectPath.toFile().mkdir();
                Path subResourcePath = resourcePath.resolve(childFile.getName());
                copyFileStructure(subResourcePath, subProjectPath);
            } else {
                InputStream inputStream = getResourceStream(resourcePath.resolve(childFile.getName()).toString().replaceAll("\\\\","/"));
                Files.copy(inputStream, projectPath.resolve(childFile.getName()));
                IOUtils.closeQuietly(inputStream);
            }
        }
    }

    private HubModuleManager getPropsMgr() {
        String timestampFile = getHubFlowRunnerConfig().getHubProject().getUserModulesDeployTimestampFile();
        return new HubModuleManager(timestampFile);
    }

    @Test
    public void testMasterStep() throws Exception {
        installProject();

        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        getDataHub().clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        Flow flow = flowManager.getFlow("myNewFlow");
        if (flow == null) {
            throw new Exception("myNewFlow Not Found");
        }
        RunFlowResponse flowResponse = flowRunner.runFlow("myNewFlow", Arrays.asList("1","2","3"));
        flowRunner.awaitCompletion();
        RunStepResponse masterJob = flowResponse.getStepResponses().get("3");
        assertTrue(masterJob.isSuccess(), "Mastering job failed!");
        assertTrue(getFinalDocCount("mdm-merged") >= 10,"At least 10 merges occur");
        assertTrue(getFinalDocCount("master") > 0, "Documents didn't receive master collection");
        assertEquals(209, getFinalDocCount("mdm-content"), "We end with the correct amount of final docs");
        // Setting this to 40 or greater as occasionally we get 41 in the pipeline. See bug https://project.marklogic.com/jira/browse/DHFPROD-3178
        assertTrue(getFinalDocCount("mdm-notification") >= 40, "Not enough notifications are created");
        testUnmerge();
    }

    @Test
    public void testManualMerge() throws Exception {
        installProject();

        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        getDataHub().clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        Flow flow = flowManager.getFlow("myNewFlow");
        if (flow == null) {
            throw new Exception("myNewFlow Not Found");
        }
        RunFlowResponse flowResponse = flowRunner.runFlow("myNewFlow", Arrays.asList("1","2"));
        flowRunner.awaitCompletion();
        List<String> docsToMerge = Arrays.asList("/person-1.json","/person-1-1.json","/person-1-2.json","/person-1-3.json");
        masteringManager.merge(docsToMerge, "myNewFlow","3", Boolean.FALSE, new ObjectMapper().createObjectNode());
        assertEquals(1, getFinalDocCount("mdm-merged"),"One merge should have occurred");
        assertEquals(1, getFinalDocCount("mdm-auditing"),"One auditing document should have been created");
        assertEquals(docsToMerge.size(), getFinalDocCount("mdm-archived"),docsToMerge.size() + " documents should have been archived");
    }

    private void testUnmerge() {
        String singleMergedURI = getUriByQuery("cts:and-query((cts:collection-query('mdm-merged'),cts:collection-query('mdm-content')))", HubConfig.DEFAULT_FINAL_NAME);
        String queryText = "cts:and-query((" +
            "cts:collection-query('mdm-merged')," +
            "cts:collection-query('mdm-content')," +
            "cts:document-query('" + singleMergedURI + "')" +
            "))";
        assertTrue(existsByQuery(queryText, HubConfig.DEFAULT_FINAL_NAME), "Merged doc doesn't have the expected collections");
        MasteringManager.UnmergeResponse unmergeResp = masteringManager.unmerge(singleMergedURI, Boolean.TRUE, Boolean.TRUE);
        assertFalse(existsByQuery(queryText, HubConfig.DEFAULT_FINAL_NAME), "Document didn't get unmerged: " + unmergeResp.toString());
    }

    private String getUriByQuery(String query, String database) {
        String uri = null;
        EvalResultIterator resultItr = runInDatabase("cts:uris((),('limit=1')," + query + ")", database);
        if (resultItr == null || ! resultItr.hasNext()) {
            return uri;
        }
        EvalResult res = resultItr.next();
        uri = res.getString();
        return uri;
    }

    private Boolean existsByQuery(String query, String database) {
        Boolean exists = Boolean.FALSE;
        EvalResultIterator resultItr = runInDatabase("xdmp:exists(cts:search(fn:doc()," + query + "))", database);
        if (resultItr == null || ! resultItr.hasNext()) {
            return exists;
        }
        EvalResult res = resultItr.next();
        exists = res.getBoolean();
        return exists;
    }
}
