package com.marklogic.hub.service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.io.Format;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.entity.Entity;
import com.marklogic.hub.exception.EntityManagerException;
import com.marklogic.hub.factory.EntityModelFactory;
import com.marklogic.hub.model.EntityModel;
import com.marklogic.hub.util.FileUtil;

@Service
@Scope("session")
public class EntityManagerService {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(EntityManagerService.class);

    @Autowired
    private EnvironmentConfiguration environmentConfiguration;

    @Autowired
    private SyncStatusService syncStatusService;

    public EntityManager getEntityManager() {

        Authentication authMethod = Authentication
                .valueOf(environmentConfiguration.getMLAuth().toUpperCase());
        DatabaseClient client = DatabaseClientFactory.newClient(
                environmentConfiguration.getMLHost(),
                Integer.parseInt(environmentConfiguration.getMLStagingPort()),
                environmentConfiguration.getMLUsername(),
                environmentConfiguration.getMLPassword(), authMethod);
        return new EntityManager(client);

    }

    public List<EntityModel> getEntities() {
        List<EntityModel> entities = new ArrayList<>();
        List<Entity> entitiesInServer = this.getEntitysInServer();
        String entitiesPath = FileUtil.createFolderIfNecessary(
                environmentConfiguration.getUserPluginDir(),
                FileUtil.ENTITIES_FOLDER);
        List<String> entityNames = FileUtil.listDirectFolders(entitiesPath);
        EntityModelFactory entityModelFactory = new EntityModelFactory(
                entitiesInServer);
        for (String entityName : entityNames) {
            LOGGER.debug("Entity : " + entityName);
            entities.add(entityModelFactory.createEntity(entityName,
                    entitiesPath + File.separator + entityName, syncStatusService));
        }

        return entities;
    }

    private List<Entity> getEntitysInServer() {
        List<Entity> entitiesInServer = new ArrayList<>();
        try {
            EntityManager entityManager = getEntityManager();
            entitiesInServer = entityManager.getEntities();
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
        return entitiesInServer;
    }

    public Entity getEntity(String entityName) {
        EntityManager entityManager = getEntityManager();
        return entityManager.getEntity(entityName);
    }

    public EntityModel createEntity(String EntityName, String inputFlowName,
            String harmonizeFlowName, PluginFormat pluginFormat, Format dataFormat) {
        EntityModelFactory EntityModelFactory = new EntityModelFactory();
        EntityModel EntityModel;
        try {
            File pluginDir = new File(environmentConfiguration.getUserPluginDir());
            EntityModel = EntityModelFactory.createNewEntity(pluginDir,
                    EntityName,
                    inputFlowName, harmonizeFlowName, pluginFormat, dataFormat);
        } catch (IOException e) {
            throw new EntityManagerException(e.getMessage(), e);
        }
        return EntityModel;
    }
}
