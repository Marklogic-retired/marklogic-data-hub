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
'use strict';

const config = require("/com.marklogic.hub/config.sjs");

/**
 * This is the updated rest endpoint for searching and returning Job Documents.
 *
 * @param context
 * @param params
 * @returns {null}
 */
function get(context, params) {
    xdmp.securityAssert("http://marklogic.com/data-hub/privileges/monitor-jobs", "execute");
    const resultsFunction = function() {
        const jobQueryLib = require("/data-hub/5/flow/job-query-lib.sjs");
        jobQueryLib.findJobDocuments(params);
    };
    const jobsDatabaseId = xdmp.database(config.JOBDATABASE);
    if (xdmp.database() === jobsDatabaseId) {
        return resultsFunction();
    } else {
        return xdmp.invokeFunction(resultsFunction, {database: jobsDatabaseId});
    }
};

exports.GET = get;
