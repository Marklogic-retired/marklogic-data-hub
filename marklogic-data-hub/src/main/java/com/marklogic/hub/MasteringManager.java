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
package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.Map;

/**
 * Handles the calls to the Mastering endpoints.
 */
public interface MasteringManager {

    /**
     * Reverses the last set of merges made into the given merge UR
     * @param mergeURI - URI of the merged document that is being reversed
     * @param retainAuditTrail - determines if provenance for the merge/unmerge is kept
     * @param blockFutureMerges - ensures that the documents won't be merged together in the next mastering run, if true
     * @return - an UnmergeResponse
     */
    public UnmergeResponse unmerge(String mergeURI, Boolean retainAuditTrail, Boolean blockFutureMerges);

    /**
     * Manually merges a set of documents
     * @param mergeURIs - URIs of the documents to merge
     * @param flowName - The name of the flow that has the mastering settings
     * @param stepNumber - The number of the mastering step with settings
     * @param preview - determines if the changes should be written to the database
     * @param options - Overrides any options for the step
     * @return - a MergeResponse
     */
    public MergeResponse merge(List<String> mergeURIs, String flowName, String stepNumber, Boolean preview, JsonNode options);

    /**
     * Holds the response information from an unmerge request
     */
    class UnmergeResponse {
        public List<String> mergeURIs;
        public boolean success;
        public List<String> restoredURIs;

        public String toString() {
            return String.format("{success: %b, mergeURIs: %s, restoredURIs: %s}", success, mergeURIs, restoredURIs);
        }
    }

    /**
     * Holds the response information from an manual merge request
     */
    class MergeResponse {
        public List<String> mergedURIs;
        public boolean success;
        public Map<String,Object> mergedDocument;

        public String toString() {
            return String.format("{success: %b, mergedURIs: %s, mergeDocument: %s}", success, mergedURIs, mergedDocument);
        }
    }
}
