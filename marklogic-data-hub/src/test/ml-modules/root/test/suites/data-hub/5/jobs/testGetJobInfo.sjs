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

const jobResultsLib = require("/data-hub/5/jobs/job-results-lib.sjs");
const test = require("/test/test-helper.xqy");

function getJobResults(start, pageLength, sortColumn, sortOperator) {
    return fn.head(
        xdmp.invokeFunction(
            function () {
                return jobResultsLib.getJobData(start, pageLength, sortColumn, sortOperator);
            },
            {database: xdmp.database("data-hub-JOBS")}
        )
    );
}

function verifyJobResults() {
    const assertions = [];
    const response = getJobResults(1, 10, 'startTime', 'descending');
    assertions.push(
        test.assertEqual(10, response.total),
        test.assertEqual(1, response.start),
        test.assertEqual(10, response.pageLength),
        test.assertEqual(10, response.results.length)
    );

    for(let result in response.results) {
        for (let key in Object.entries(result)) {
            assertions.push(test.assertNotEqual(null, result[key]));
        }
    }
    return assertions;
}

function verifySortOrderInJobResults() {
    const assertions = [];
    const response1 = getJobResults(1, 10, "startTime", "descending");
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

    const response2 = getJobResults(1, 10, "startTime", "ascending");
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

function verifyPaginationInJobResults() {
    const assertions = [];
    const response1 = getJobResults(1, 4, "startTime", "ascending");
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

    const response2 = getJobResults(2, 4, "startTime", "ascending");
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

    const response3 = getJobResults(3, 4, "startTime", "ascending");
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
    .concat(verifyJobResults())
    .concat(verifySortOrderInJobResults())
    .concat(verifyPaginationInJobResults());
