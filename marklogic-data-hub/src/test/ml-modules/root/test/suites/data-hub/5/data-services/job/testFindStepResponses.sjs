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

function verifyStepResponse() {
    const query = {
        "start": 1,
        "pageLength": 1,
        "sortOrder": [
            {
                "propertyName": "startTime",
                "sortDirection": "descending"
            }
        ]
    };
    const response = jobQueryService.findStepResponses(query);
    return [
        test.assertEqual(10, response.total),
        test.assertEqual(1, response.start),
        test.assertEqual(1, response.pageLength),
        test.assertEqual(1, response.results.length),
        test.assertEqual("test-job3", response.results[0].jobId),
        test.assertEqual("json-mastering-step-json", response.results[0].stepName),
        test.assertEqual("mastering", response.results[0].stepDefinitionType),
        test.assertEqual("running", response.results[0].jobStatus),
        test.assertEqual("Customer", response.results[0].entityName),
        test.assertEqual(xs.dateTime("2019-06-26T23:12:04.449693Z"), response.results[0].startTime),
        test.assertEqual(xs.dayTimeDuration("PT0.265934S"), response.results[0].duration),
        test.assertEqual(5, response.results[0].successfulItemCount),
        test.assertEqual(0, response.results[0].failedItemCount),
        test.assertEqual("admin", response.results[0].user),
        test.assertEqual("mapping_ingestion_mastering-flow", response.results[0].flowName)
    ];
}


function verifySortOrderByColumnAndSecondarySortOnStartTimeDescending() {
    const assertions = [];
    const query = {
        "start": 1,
        "pageLength": 6,
        "sortOrder": [
            {
                "propertyName": "jobId",
                "sortDirection": "descending"
            }
        ]
    };
    const response1 = jobQueryService.findStepResponses(query);
    assertions.push(
        test.assertEqual(10, response1.total),
        test.assertEqual(1, response1.start),
        test.assertEqual(6, response1.pageLength),
        test.assertEqual(6, response1.results.length),
        test.assertEqual("test-job3", response1.results[0]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:12:04.449693Z"), response1.results[0]["startTime"]),
        test.assertEqual("test-job3", response1.results[1]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:12:04.27244Z"), response1.results[1]["startTime"]),
        test.assertEqual("test-job3", response1.results[2]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:12:04.111655Z"), response1.results[2]["startTime"]),
        test.assertEqual("test-job2", response1.results[3]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:58.675437Z"), response1.results[3]["startTime"]),
        test.assertEqual("test-job2", response1.results[4]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:58.412786Z"), response1.results[4]["startTime"]),
        test.assertEqual("test-job2", response1.results[5]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:58.144528Z"), response1.results[5]["startTime"])
    );

    query["pageLength"] = 7;
    query["sortOrder"][0]["sortDirection"] = "ascending";
    const response2 = jobQueryService.findStepResponses(query);
    assertions.push(
        test.assertEqual(10, response2.total),
        test.assertEqual(1, response2.start),
        test.assertEqual(7, response2.pageLength),
        test.assertEqual(7, response2.results.length),
        test.assertEqual("test-job1", response2.results[0]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:36.718498Z"), response2.results[0]["startTime"]),
        test.assertEqual("test-job1", response2.results[1]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:31.324564Z"), response2.results[1]["startTime"]),
        test.assertEqual("test-job1", response2.results[2]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:27.510711Z"), response2.results[2]["startTime"]),
        test.assertEqual("test-job1", response2.results[3]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:22.836606Z"), response2.results[3]["startTime"]),
        test.assertEqual("test-job2", response2.results[4]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:58.675437Z"), response2.results[4]["startTime"]),
        test.assertEqual("test-job2", response2.results[5]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:58.412786Z"), response2.results[5]["startTime"]),
        test.assertEqual("test-job2", response2.results[6]["jobId"]),
        test.assertEqual(xs.dateTime("2019-06-26T23:11:58.144528Z"), response2.results[6]["startTime"])
    );
}

function verifyStartTimeAsPrimarySortOrderConstraint() {
    const assertions = [];
    const query = {
        "start": 1,
        "pageLength": 10,
        "sortOrder": [
            {
                "propertyName": "startTime",
                "sortDirection": "descending"
            }
        ]
    };
    const response1 = jobQueryService.findStepResponses(query);
    assertions.push(
        test.assertEqual(10, response1.total),
        test.assertEqual(1, response1.start),
        test.assertEqual(10, response1.pageLength),
        test.assertEqual(10, response1.results.length),
        test.assertEqual("test-job3", response1.results[0]["jobId"]),
        test.assertEqual("test-job3", response1.results[1]["jobId"]),
        test.assertEqual("test-job3", response1.results[2]["jobId"]),
        test.assertEqual("test-job2", response1.results[3]["jobId"]),
        test.assertEqual("test-job2", response1.results[4]["jobId"]),
        test.assertEqual("test-job2", response1.results[5]["jobId"]),
        test.assertEqual("test-job1", response1.results[6]["jobId"]),
        test.assertEqual("test-job1", response1.results[7]["jobId"]),
        test.assertEqual("test-job1", response1.results[8]["jobId"]),
        test.assertEqual("test-job1", response1.results[9]["jobId"])
    );

    query["sortOrder"][0]["sortDirection"] = "ascending";
    const response2 = jobQueryService.findStepResponses(query);
    assertions.push(
        test.assertEqual(10, response2.total),
        test.assertEqual(1, response2.start),
        test.assertEqual(10, response2.pageLength),
        test.assertEqual(10, response2.results.length),
        test.assertEqual("test-job1", response2.results[0]["jobId"]),
        test.assertEqual("test-job1", response2.results[1]["jobId"]),
        test.assertEqual("test-job1", response2.results[2]["jobId"]),
        test.assertEqual("test-job1", response2.results[3]["jobId"]),
        test.assertEqual("test-job2", response2.results[4]["jobId"]),
        test.assertEqual("test-job2", response2.results[5]["jobId"]),
        test.assertEqual("test-job2", response2.results[6]["jobId"]),
        test.assertEqual("test-job3", response2.results[7]["jobId"]),
        test.assertEqual("test-job3", response2.results[8]["jobId"]),
        test.assertEqual("test-job3", response2.results[9]["jobId"])
    );

    return assertions;
}

function verifyPaginationInStepResponse() {
    const assertions = [];
    const query = {
        "start": 1,
        "pageLength": 4,
        "sortOrder": [
            {
                "propertyName": "startTime",
                "sortDirection": "ascending"
            }
        ]
    };
    const response1 = jobQueryService.findStepResponses(query);
    assertions.push(
        test.assertEqual(10, response1.total),
        test.assertEqual(1, response1.start),
        test.assertEqual(4, response1.pageLength),
        test.assertEqual(4, response1.results.length),
        test.assertEqual("test-job1", response1.results[0]["jobId"]),
        test.assertEqual("test-job1", response1.results[1]["jobId"]),
        test.assertEqual("test-job1", response1.results[2]["jobId"]),
        test.assertEqual("test-job1", response1.results[3]["jobId"])
    );

    query["start"] = 2;
    const response2 = jobQueryService.findStepResponses(query);
    assertions.push(
        test.assertEqual(10, response2.total),
        test.assertEqual(2, response2.start),
        test.assertEqual(4, response2.pageLength),
        test.assertEqual(4, response2.results.length),
        test.assertEqual("test-job2", response2.results[0]["jobId"]),
        test.assertEqual("test-job2", response2.results[1]["jobId"]),
        test.assertEqual("test-job2", response2.results[2]["jobId"]),
        test.assertEqual("test-job3", response2.results[3]["jobId"])
    );

    query["start"] = 3;
    const response3 = jobQueryService.findStepResponses(query);
    assertions.push(
        test.assertEqual(10, response3.total),
        test.assertEqual(3, response3.start),
        test.assertEqual(4, response3.pageLength),
        test.assertEqual(2, response3.results.length),
        test.assertEqual("test-job3", response3.results[0]["jobId"]),
        test.assertEqual("test-job3", response3.results[1]["jobId"])
    );

    return assertions;
}

function verifyFacetsInStepResponse() {
    const query = {
        "start": 1,
        "pageLength": 4,
        "sortOrder": [
            {
                "propertyName": "stepName",
                "sortDirection": "ascending"
            }
        ],
        "facets": {
            "stepName": ["mapping-step-json"],
            "jobStatus": ["finished"],
            "entityName": ["Customer"],
            "stepDefinitionType": ["mapping"],
            "flowName": ["ingestion_mapping-flow"],
            "startTime": ["2019-06-25T23:11:27.510711Z", "2019-06-27T23:11:27.510711Z"]
        }
    };
    const response = jobQueryService.findStepResponses(query);
    const facets = response.facets;
    return [
        test.assertEqual(1, response.total),
        test.assertEqual(1, response.start),
        test.assertEqual(4, response.pageLength),
        test.assertEqual(1, response.results.length),
        test.assertEqual("test-job1", response.results[0]["jobId"]),
        test.assertEqual("mapping-step-json", response.results[0].stepName),
        test.assertEqual("mapping", response.results[0].stepDefinitionType),
        test.assertEqual("finished", response.results[0].jobStatus),
        test.assertEqual("Customer", response.results[0].entityName),
        test.assertEqual("ingestion_mapping-flow", response.results[0].flowName),
        test.assertEqual(4, Object.keys(facets).length),
        test.assertEqual(1, facets["stepDefinitionType"]["facetValues"].length),
        test.assertEqual(1, facets["jobStatus"]["facetValues"].length),
        test.assertEqual(1, facets["stepName"]["facetValues"].length),
        test.assertEqual(1, facets["flowName"]["facetValues"].length),
        test.assertEqual("mapping", facets["stepDefinitionType"]["facetValues"][0]["name"]),
        test.assertEqual("finished", facets["jobStatus"]["facetValues"][0]["name"]),
        test.assertEqual("mapping-step-json", facets["stepName"]["facetValues"][0]["name"]),
        test.assertEqual("ingestion_mapping-flow", facets["flowName"]["facetValues"][0]["name"])
    ];
}

function verifyFacetsInStepResponseForNonExistentData() {
    let query = {
        "start": 1,
        "pageLength": 4,
        "sortOrder": [
            {
                "propertyName": "stepName",
                "sortDirection": "ascending"
            }
        ],
        "facets": {
            "startTime": ["2003-06-24T23:11:27.510711Z", "2004-06-25T23:11:27.510711Z"]
        }
    };
    const response1 = jobQueryService.findStepResponses(query);
    let facets = response1.facets;
    return [
        test.assertEqual(0, response1.total),
        test.assertEqual(1, response1.start),
        test.assertEqual(4, response1.pageLength),
        test.assertEqual(0, response1.results.length),
        test.assertEqual(0, facets["stepDefinitionType"]["facetValues"].length),
        test.assertEqual(0, facets["jobStatus"]["facetValues"].length),
        test.assertEqual(0, facets["stepName"]["facetValues"].length),
        test.assertEqual(0, facets["flowName"]["facetValues"].length)
    ];
}

function verifyFacetsInStepResponseInDataWithSingleQuotes() {
    let query = {
        "start": 1,
        "pageLength": 4,
        "sortOrder": [
            {
                "propertyName": "stepName",
                "sortDirection": "ascending"
            }
        ],
        "facets": {
            "stepName": ["ingest-ste'p-ing%est-jso'n"]
        }
    };
    const response = jobQueryService.findStepResponses(query);
    const facets = response.facets;
    return [
        test.assertEqual("test-job1", response.results[0]["jobId"]),
        test.assertEqual("ingest-ste'p-ing%est-jso'n", response.results[0].stepName),
        test.assertEqual(4, Object.keys(facets).length),
        test.assertEqual(1, facets["stepName"]["facetValues"].length),
        test.assertEqual("ingest-ste'p-ing%est-jso'n", facets["stepName"]["facetValues"][0]["name"])
    ];
}

[]
    .concat(verifyStepResponse())
    .concat(verifySortOrderByColumnAndSecondarySortOnStartTimeDescending())
    .concat(verifyStartTimeAsPrimarySortOrderConstraint())
    .concat(verifyPaginationInStepResponse())
    .concat(verifyFacetsInStepResponse())
    .concat(verifyFacetsInStepResponseForNonExistentData())
    .concat(verifyFacetsInStepResponseInDataWithSingleQuotes());
