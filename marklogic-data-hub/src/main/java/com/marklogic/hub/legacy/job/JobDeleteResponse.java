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
package com.marklogic.hub.legacy.job;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

public class JobDeleteResponse {
    public long totalCount = 0;
    public long errorCount = 0;
    public List<String> deletedJobs;
    public List<String> deletedTraces;
    public List<String> failedJobs;
    public List<String> failedTraces;
    public List<JsonNode> errors;

    public String toString()
    {
        return
            "JobDeleteResponse:" +
                "\n\ttotal jobs deleted: " + totalCount +
                "\n\ttotal errors: " + errorCount +
                "\n\tjobs deleted: " + deletedJobs +
                "\n\ttotal traces deleted: " + deletedTraces.size() +
                "\n\terrors: " + errors;
    }

}
