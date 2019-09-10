package com.marklogic.hub.searchfacets;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.StepDefinition;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class SearchFacetsTest extends HubTestBase {

    @Autowired
    private FlowRunnerImpl fr;

    @Autowired
    private HubConfigImpl hubConfig;

    @AfterAll
    public static void cleanUp(){
        new Installer().deleteProjectDir();
    }

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setupEach() throws IOException {
        basicSetup();
        getDataHubAdminConfig();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        FileUtils.copyFileToDirectory(getResourceFile("flow-runner-test/entities/e2eentity.entity.json"),
            hubConfig.getHubEntitiesDir().toFile());
        installUserModules(getDataHubAdminConfig(), true);
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/flows"), hubConfig.getFlowsDir().toFile());
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/input"),
            hubConfig.getHubProjectDir().resolve("input").toFile());
        FileUtils.copyFileToDirectory(getResourceFile("flow-runner-test/step-definitions/json-ingestion.step.json"),
            hubConfig.getStepsDirByType(StepDefinition.StepDefinitionType.INGESTION).resolve("json-ingestion").toFile());
        FileUtils.copyFileToDirectory(getResourceFile("flow-runner-test/step-definitions/json-mapping.step.json"),
            hubConfig.getStepsDirByType(StepDefinition.StepDefinitionType.MAPPING).resolve("json-mapping").toFile());
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/mappings"),
            hubConfig.getHubMappingsDir().resolve("e2e-mapping").toFile());
        installUserModules(getDataHubAdminConfig(), true);
        installHubArtifacts(getDataHubAdminConfig(), true);
        fr.runFlow("testFlow");
        fr.awaitCompletion();
    }

    // Performing an empty search and verify the facets returned on harmonized docs
    // meta-data properties
    @Test
    public void testSearchFacets() throws InterruptedException {
        DatabaseClient finalClient = hubConfig.newFinalClient();
        QueryManager queryMgr = finalClient.newQueryManager();
        StructuredQueryBuilder qb = queryMgr.newStructuredQueryBuilder();
        StructuredQueryDefinition sqd = qb.and();

        SearchHandle resultsHandle = new SearchHandle();
        queryMgr.search(sqd, resultsHandle);
        String[] facets = resultsHandle.getFacetNames();
        String[] expectedFacets = {"Collection", "createdByJobRangeConstraint", "createdByStepRangeConstraint",
            "createdOnRangeConstraint", "createdByRangeConstraint", "createdInFlowRangeConstraint"};
        assertTrue(facets.length == 6,"There should be 5 meta data range indexes and 1 collection index");
        assertTrue(Arrays.equals(facets, expectedFacets), "The returned facets on the empty search should match with" +
            "expected facets");
    }

    // Performing a search on harmonized docs and verify the snippet and matched docs information is
    // returned
    @Test
    public void testSnippetAndSearchContent() throws InterruptedException, IOException {
        DatabaseClient finalClient = hubConfig.newFinalClient();
        QueryManager queryMgr = finalClient.newQueryManager();
        StructuredQueryBuilder qb = queryMgr.newStructuredQueryBuilder();
        StructuredQueryDefinition sqd = qb.and();
        sqd.setCriteria("123");
        StringHandle resultsHandle = new StringHandle();
        resultsHandle.withFormat(Format.JSON);
        queryMgr.search(sqd, resultsHandle);

        // look for headers in content, snippets and matches data
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readValue(resultsHandle.get(), JsonNode.class);

        assertTrue(node.get("snippet-format").asText().equals("snippet"), "Snippet format should be snippet and not empty");
        assertTrue(node.get("results").get(0).get("matches") != null, "Matches array in results shouldn't be null");
    }
}
