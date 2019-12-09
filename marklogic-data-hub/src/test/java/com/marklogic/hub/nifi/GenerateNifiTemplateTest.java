package com.marklogic.hub.nifi;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.junit5.XmlNode;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Can also do ad hoc testing of this feature via qconsole using a script like this:
 *
 * import module namespace nifi = "http://marklogic.com/data-hub/nifi" at "/nifi.xqy";
 * nifi:build-template("/flows/ingestion_mapping_mastering-flow.flow.json")
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class GenerateNifiTemplateTest extends HubTestBase {

    /**
     * This is focused on verifying that none of the XQuery modules have errors in them, and it's verifying a few
     * elements in the XML template of interest. As this feature matures, it's expected that more assertions can be
     * added to verify that the template is correct.
     */
    @Test
    public void smokeTest() {
        NifiTemplateGenerator generator = new NifiTemplateGenerator(stagingClient);
        XmlNode template = new XmlNode(generator.generateNifiTemplateFromJson(FLOW_JSON));

        template.assertElementValue("/template/description", "NiFi template for DHF flow ingestion_mapping_mastering-flow");

        template.assertElementCount(
            "Expecting 17 processors; 3 for the ingestion step, then 7 each for the mapping and mastering steps",
            "/template/snippet/processGroups/contents/processors", 17
        );

        template.assertElementCount(
            "Expecting 15 connections; 2 for the ingestion step, then 6 each for the mapping and mastering steps, " +
                "then 1 more to connect the end of the mapping step to the beginning of the mastering step",
            "/template/snippet/processGroups/contents/connections", 15
        );

        template.assertElementCount(
            "Expected the single DatabaseClient controller service",
            "/template/snippet/processGroups/contents/controllerServices", 1
        );
    }

    private final static String FLOW_JSON = "{\n" +
        "  \"name\": \"ingestion_mapping_mastering-flow\",\n" +
        "  \"description\": \"This is copied from the dh-5-example project\",\n" +
        "  \"batchSize\": 100,\n" +
        "  \"threadCount\": 4,\n" +
        "  \"options\": {\n" +
        "    \"sourceQuery\": null\n" +
        "  },\n" +
        "  \"steps\": {\n" +
        "    \"1\": {\n" +
        "      \"name\": \"ingest-step-json\",\n" +
        "      \"description\": \"ingests json docs to data-hub-STAGING\",\n" +
        "      \"stepDefinitionName\": \"default-ingestion\",\n" +
        "      \"stepDefinitionType\": \"INGESTION\",\n" +
        "      \"options\": {\n" +
        "        \"sourceQuery\": null,\n" +
        "        \"collections\": [\n" +
        "          \"mastering-flow-ingest-json\"\n" +
        "        ],\n" +
        "        \"permissions\": \"rest-reader,read,rest-writer,update\",\n" +
        "        \"outputFormat\": \"json\",\n" +
        "        \"targetDatabase\": \"data-hub-STAGING\"\n" +
        "      },\n" +
        "      \"customHook\": {},\n" +
        "      \"retryLimit\": 0,\n" +
        "      \"batchSize\": 100,\n" +
        "      \"threadCount\": 4,\n" +
        "      \"fileLocations\": {\n" +
        "        \"inputFilePath\": \"mastering-input\",\n" +
        "        \"inputFileType\": \"json\",\n" +
        "        \"outputURIReplacement\": \".*input*.,'/mastering-flow/json/'\"\n" +
        "      }\n" +
        "    },\n" +
        "    \"2\": {\n" +
        "      \"name\": \"mapping-step-json\",\n" +
        "      \"description\": \"maps and harmonizes docs to data-hub-FINAL\",\n" +
        "      \"stepDefinitionName\": \"default-mapping\",\n" +
        "      \"stepDefinitionType\": \"MAPPING\",\n" +
        "      \"options\": {\n" +
        "        \"sourceQuery\": \"cts.collectionQuery('mastering-flow-ingest-json')\",\n" +
        "        \"mapping\": {\n" +
        "          \"name\": \"OrderMappingJson\",\n" +
        "          \"version\": 1\n" +
        "        },\n" +
        "        \"sourceDatabase\": \"data-hub-STAGING\",\n" +
        "        \"collections\": [\n" +
        "          \"mastering-flow-mapping-json\",\n" +
        "          \"mdm-content\"\n" +
        "        ],\n" +
        "        \"outputFormat\": \"json\",\n" +
        "        \"targetDatabase\": \"data-hub-FINAL\"\n" +
        "      },\n" +
        "      \"customHook\": null,\n" +
        "      \"retryLimit\": 0,\n" +
        "      \"batchSize\": 0,\n" +
        "      \"threadCount\": 0\n" +
        "    },\n" +
        "    \"3\": {\n" +
        "      \"name\": \"json-mastering-step-json\",\n" +
        "      \"description\": \"matches and merges the docs\",\n" +
        "      \"stepDefinitionName\": \"default-mastering\",\n" +
        "      \"stepDefinitionType\": \"MASTERING\",\n" +
        "      \"options\": {\n" +
        "        \"stepUpdate\": true,\n" +
        "        \"sourceQuery\": \"cts.collectionQuery('mastering-flow-mapping-json')\",\n" +
        "        \"acceptsBatch\": true,\n" +
        "        \"targetEntity\": \"Order\",\n" +
        "        \"sourceDatabase\": \"data-hub-FINAL\",\n" +
        "        \"collections\": [\n" +
        "          \"mastered1\"\n" +
        "        ],\n" +
        "        \"mergeOptions\": {\n" +
        "        },\n" +
        "        \"matchOptions\": {\n" +
        "        },\n" +
        "        \"targetDatabase\": \"data-hub-FINAL\"\n" +
        "      },\n" +
        "      \"customHook\": null,\n" +
        "      \"retryLimit\": 0,\n" +
        "      \"batchSize\": 100,\n" +
        "      \"threadCount\": 4\n" +
        "    }\n" +
        "  }\n" +
        "}\n";
}
