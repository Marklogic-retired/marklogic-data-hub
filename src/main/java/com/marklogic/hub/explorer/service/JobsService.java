/* Copyright 2019 MarkLogic Corporation. All rights reserved. */
package com.marklogic.hub.explorer.service;

import java.util.ArrayList;
import java.util.List;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.explorer.dataservices.JobInfo;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JobsService {

  @Autowired
  private DatabaseClientHolder dbClientHolder;

  @Autowired
  private ModelService modelService;

  /**
   * Get latest job info for specified model
   *
   * @param modelName Name of the entity model
   * @return - a JsonNode containing job info
   */
  public JsonNode getLatestJobInfo(String modelName) {
    DatabaseClient dbClient = dbClientHolder.getDataServiceClient();
    return getJobInfoFromDB(dbClient, modelName);
  }

  /**
   * Get latest job info for all models
   *
   * @return - a list of JsonNode containing job info
   */
  public List<JsonNode> getLatestJobInfoForAllModels() {
    DatabaseClient dbClient = dbClientHolder.getDataServiceClient();
    List<JsonNode> jobInfoList = new ArrayList<>();

    for (String modelName : modelService.getModelNames()) {
      jobInfoList.add(getJobInfoFromDB(dbClient, modelName));
    }

    return jobInfoList;
  }

  JsonNode getJobInfoFromDB(DatabaseClient dbClient, String modelName) {
    return JobInfo.on(dbClient).getLatestJobData(modelName);
  }
}
