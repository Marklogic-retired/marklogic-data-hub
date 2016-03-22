package com.marklogic.hub.factory;

import java.io.File;

import com.marklogic.hub.model.RestModel;
import com.marklogic.hub.service.SyncStatusService;

public class RestModelFactory {

    public static final String REST_FOLDER_NAME = "REST";
    private String entityName;

    public RestModelFactory(String entityName) {
        this.entityName = entityName;
    }

    public RestModel createRest(String parentDirPath, SyncStatusService syncStatusService) {
        RestModel restModel = new RestModel();
        restModel.setEntityName(entityName);
        String absolutePath = parentDirPath + File.separator + REST_FOLDER_NAME;
        restModel.setSynched(syncStatusService.isDirectorySynched(absolutePath));
        return restModel;
    }
}
