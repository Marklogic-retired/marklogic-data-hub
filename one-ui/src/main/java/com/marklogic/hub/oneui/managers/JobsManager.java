/*
 * Copyright 2012-2020 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.oneui.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.JobInfo;

import java.util.ArrayList;
import java.util.List;

public class JobsManager {

    private DatabaseClient finalDataServiceClient;
    private ModelManager modelManager;

    public JobsManager(HubConfig hubConfig, ModelManager modelManager) {
        this.finalDataServiceClient = hubConfig.newFinalClient();
        this.modelManager = modelManager;
    }

    /**
     * Get latest job info for specified model
     *
     * @param modelName Name of the entity model
     * @return - a JsonNode containing job info
     */
    public JsonNode getLatestJobInfo(String modelName) {
        return getJobInfoFromDB(finalDataServiceClient, modelName);
    }

    /**
     * Get latest job info for all models
     *
     * @return - a list of JsonNode containing job info
     */
    public List<JsonNode> getLatestJobInfoForAllModels() {
        List<JsonNode> jobInfoList = new ArrayList<>();

        for (String modelName : modelManager.getModelNames()) {
            jobInfoList.add(getJobInfoFromDB(finalDataServiceClient, modelName));
        }

        return jobInfoList;
    }

    JsonNode getJobInfoFromDB(DatabaseClient dbClient, String modelName) {
        return JobInfo.on(dbClient).getLatestJobData(modelName);
    }
}
