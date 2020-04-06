package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.ModelsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;

/**
 * This is implementing ModelsService instead of defining a new ModelManager interface, which would just duplicate the
 * ModelsService interface.
 */
public class ModelManagerImpl implements ModelsService {

    private final static Logger logger = LoggerFactory.getLogger(ModelManagerImpl.class);

    private HubConfig hubConfig;
    private ModelsService modelsService;

    public ModelManagerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.modelsService = ModelsService.on(hubConfig.newFinalClient(null));
    }

    @Override
    public JsonNode getPrimaryEntityTypes() {
        return modelsService.getPrimaryEntityTypes();
    }

    @Override
    public JsonNode createModel(JsonNode input) {
        return saveModelToFilesystem(modelsService.createModel(input));
    }

    @Override
    public JsonNode updateModelInfo(String name, String description) {
        return saveModelToFilesystem(modelsService.updateModelInfo(name, description));
    }

    @Override
    public JsonNode updateModelEntityTypes(String name, JsonNode input) {
        return saveModelToFilesystem(modelsService.updateModelEntityTypes(name, input));
    }

    /**
     * This does not write to the filesystem, as the only use case for this so far is for loading the model after it's
     * been read from the filesystem.
     *
     * @param model	provides input
     */
    @Override
    public void saveModel(JsonNode model) {
        modelsService.saveModel(model);
    }

    protected JsonNode saveModelToFilesystem(JsonNode model) {
        final String name = model.get("info").get("title").asText();
        File dir = hubConfig.getHubProject().getHubEntitiesDir().toFile();
        dir.mkdirs();
        File file = new File(dir, name + ".entity.json");
        try {
            FileCopyUtils.copy(model.toString().getBytes(), file);
            logger.info(String.format("Wrote %s model to %s", name, file.getAbsolutePath()));
        } catch (IOException e) {
            throw new RuntimeException("Model was saved to MarkLogic, but could not be written to the project filesystem; cause: " + e.getMessage(), e);
        }
        return model;
    }
}
