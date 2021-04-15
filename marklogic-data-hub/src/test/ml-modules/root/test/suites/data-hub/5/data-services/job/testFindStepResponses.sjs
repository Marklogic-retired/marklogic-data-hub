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
        "sortColumn": "startTime",
        "sortDirection": "descending"
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
        test.assertEqual("ingestion_mapping_mastering-flow", response.results[0].flowName)
    ];
}


function verifySortOrderByColumnAndSecondarySortOnStartTimeDescending() {
    const assertions = [];
    const query = {
        "start": 1,
        "pageLength": 6,
        "sortColumn": "jobId",
        "sortDirection": "descending"
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
    query["sortDirection"] = "ascending";
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
        "sortColumn": "startTime",
        "sortDirection": "descending"
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

    query["sortDirection"] = "ascending";
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
        "sortColumn": "startTime",
        "sortDirection": "ascending"
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

[]
    .concat(verifyStepResponse())
    .concat(verifySortOrderByColumnAndSecondarySortOnStartTimeDescending())
    .concat(verifyStartTimeAsPrimarySortOrderConstraint())
    .concat(verifyPaginationInStepResponse());
