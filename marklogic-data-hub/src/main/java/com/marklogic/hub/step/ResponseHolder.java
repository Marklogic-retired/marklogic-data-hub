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
package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.Map;

public class ResponseHolder {
    public String jobId;
    public long totalCount = 0;
    public long errorCount = 0;
    public List<String> completedItems;
    public List<String> failedItems;
    public List<JsonNode> errors;
    public List<JsonNode> documents;

    public String toString() {
        int completedSize = completedItems != null ? completedItems.size() : 0;
        int failedSize = failedItems != null ? failedItems.size() : 0;
        int errorSize = errors != null ? errors.size() : 0;
        int documentsSize = documents != null ? documents.size() : 0;
        return String.format("{jobId: %d, totalCount: %d, errorCount: %d, completedItems: %d, failedItems: %d, errors: %d, documents: %d}",
            jobId, totalCount, errorCount, completedSize, failedSize, errorSize, documentsSize);
    }
}
