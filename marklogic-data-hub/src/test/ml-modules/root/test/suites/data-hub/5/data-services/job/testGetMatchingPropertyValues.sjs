/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const jobQueryService = require("/test/suites/data-hub/5/data-services/lib/jobService.sjs");
const test = require("/test/test-helper.xqy");

function verifyMatchingStepNameValues() {
    const assertions = [];
    const query = {
        "facetName": "stepName",
        "searchTerm": "ingest"
    };

    const response1 = jobQueryService.getMatchingPropertyValues(query);
    assertions.push(
        test.assertEqual(3, response1.length, "stepName containing 'ingest' in the middle is also returned as the limit is " +
            "defaulted to 10 since its missing in request and there are only 2 stepName values starting with 'ingest'"),
        test.assertTrue(response1.includes("ingest-step-json")),
        test.assertTrue(response1.includes("ingest-ste'p-ing%est-jso'n")),
        test.assertTrue(response1.includes("step-ingest-xml"))
    );

    query["limit"] = 2;
    const response2 = jobQueryService.getMatchingPropertyValues(query);
    assertions.push(
      test.assertEqual(2, response2.length, "stepNames starting with 'ingest' to a max of 2 values are returned"),
      test.assertTrue(response2.includes("ingest-step-json")),
      test.assertTrue(response2.includes("ingest-ste'p-ing%est-jso'n"))
    );
    return assertions;
}

function verifyMatchingFlowNameValues() {
    const assertions = [];
    const query = {
        "facetName": "flowName",
        "searchTerm": "ingest"
    };

    const response1 = jobQueryService.getMatchingPropertyValues(query);
    assertions.push(
        test.assertEqual(3, response1.length, "flowName containing 'ingest' in the middle is also returned as the limit is " +
            "defaulted to 10 since its missing in request and there are only 2 flowName values starting with 'ingest'"),
        test.assertTrue(response1.includes("ingestion_mapping-flow")),
        test.assertTrue(response1.includes("ingestion_mapping_mastering-flow")),
        test.assertTrue(response1.includes("mapping_ingestion_mastering-flow"))
    );

    query["limit"] = 2;
    const response2 = jobQueryService.getMatchingPropertyValues(query);
    assertions.push(
      test.assertEqual(2, response2.length, "flowNames starting with 'ingest' to a max of 2 values are returned"),
      test.assertTrue(response2.includes("ingestion_mapping-flow")),
      test.assertTrue(response2.includes("ingestion_mapping_mastering-flow"))
    );

    return assertions;
}

[]
    .concat(verifyMatchingStepNameValues())
    .concat(verifyMatchingFlowNameValues());
