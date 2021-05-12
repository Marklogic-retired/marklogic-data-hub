'use strict';

const config = require("/com.marklogic.hub/config.sjs");
const jobQueryLib = require("/data-hub/5/flow/job-query-lib.sjs");
const test = require("/test/test-helper.xqy");

xdmp.invokeFunction(function () {
        const page1 = jobQueryLib.findJobs({start: 1, pageLength: 2});
        const page2 = jobQueryLib.findJobs({start: 2, pageLength: 2});
        const page3 = jobQueryLib.findJobs({start: 3, pageLength: 2});

        const jobIdQuery = jobQueryLib.findJobs({jobId: "25a52839-aceb-4deb-ad05-b994ae688b82"});
        const userQuery = jobQueryLib.findJobs({user: "john"});
        const jobStatusQuery = jobQueryLib.findJobs({jobStatus: "finished_with_errors"});
        const flowNameQuery = jobQueryLib.findJobs({flowName: "CurateCustomerWithRelatedEntitiesJSON"});
        const stepNameQuery = jobQueryLib.findJobs({stepName: "loadCustomersXML"});
        const stepDefinitionTypeQuery1 = jobQueryLib.findJobs({stepDefinitionType: "mapping"});
        const stepDefinitionTypeQuery2 = jobQueryLib.findJobs({stepDefinitionType: "matching"});

        const startTimeQuery = jobQueryLib.findJobs({
            startTimeBegin: "2021-05-06T04:40:04Z",
            startTimeEnd: "2021-05-06T04:40:06Z"
        });
        const endTimeQuery = jobQueryLib.findJobs({
            endTimeBegin: "2021-05-06T04:40:07Z",
            endTimeEnd: "2021-05-06T04:40:08Z"
        });

        return [
            test.assertEqual(5, page1.total, 'Page 1 should have correct count of job documents'),
            test.assertEqual(2, page1.results.length, `Page 1 should have correct number of results. Results: ${xdmp.toJsonString(page1.results)}`),
            test.assertEqual(5, page2.total, 'Page 3 should have correct count of job documents'),
            test.assertEqual(2, page2.results.length, `Page 2 should have correct number of results. Results: ${xdmp.toJsonString(page2.results)}`),
            test.assertEqual(5, page3.total, 'Page 3 should have correct count of job documents'),
            test.assertEqual(1, page3.results.length, `Page 3 should have correct number of results. Results: ${xdmp.toJsonString(page3.results)}`),
            test.assertEqual(1, jobIdQuery.total, 'Job ID query should return only one result'),
            test.assertEqual("25a52839-aceb-4deb-ad05-b994ae688b82", jobIdQuery.results[0].jobId, 'Job ID query should return result with correct value'),
            test.assertEqual(1, userQuery.total, 'User query should return only one result'),
            test.assertEqual("john", userQuery.results[0].user, 'User query should return result with correct value'),
            test.assertEqual(1, jobStatusQuery.total, 'Job status query should return only one result'),
            test.assertEqual("finished_with_errors", jobStatusQuery.results[0].jobStatus, 'User query should return result with correct value'),
            test.assertEqual(1, flowNameQuery.total, 'Flow name query should return only one result'),
            test.assertEqual("CurateCustomerWithRelatedEntitiesJSON", flowNameQuery.results[0].flowName, 'flow name query should return result with correct value'),
            test.assertEqual(1, stepNameQuery.total, 'Step name query should return only one result'),
            test.assertTrue(stepNameQuery.results[0].stepResponses.map((resp) => resp.stepName).includes("loadCustomersXML"), 'Step name query should return result with correct value'),
            test.assertEqual(5, stepDefinitionTypeQuery1.total, 'step definition type query should return 5 results for mapping'),
            test.assertEqual(0, stepDefinitionTypeQuery2.total, 'step definition type query should return 0 results for matching'),
            test.assertEqual(1, startTimeQuery.total, 'Start time query should return only one result'),
            test.assertEqual(2, endTimeQuery.total, 'End time query should return two results')
        ];
    }, { database: xdmp.database(config.JOBDATABASE) });