package com.marklogic.quickstart.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import com.marklogic.hub.Scaffolding;
import com.marklogic.hub.entity.AbstractEntity;
import com.marklogic.hub.entity.Entity;
import com.marklogic.hub.entity.EntityImpl;
import com.marklogic.hub.flow.FlowType;
//import com.marklogic.quickstart.factory.EntityModelFactory;
import com.marklogic.quickstart.model.EntityModel;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.util.FileUtil;

@Service
@Scope("session")
public class EntityManagerService {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(EntityManagerService.class);

    @Autowired
    private FlowManagerService flowManagerService;

//    public EntityManager getEntityManager(HubConfig config) {
//
//        Authentication authMethod = Authentication
//                .valueOf(config.authMethod.toUpperCase());
//        DatabaseClient client = DatabaseClientFactory.newClient(
//                config.host,
//                config.stagingPort,
//                config.adminUsername,
//                config.adminPassword,
//                authMethod);
//        return new EntityManager(client);
//
//    }

    public List<EntityModel> getEntities(String projectDir) {
        List<EntityModel> entities = new ArrayList<EntityModel>();
        Path entitiesPath = Paths.get(projectDir, "plugins", "entities");
        List<String> entityNames = FileUtil.listDirectFolders(entitiesPath.toFile());
        for (String entityName : entityNames) {
            LOGGER.debug("Entity : " + entityName);
            EntityModel entity = getEntity(projectDir, entityName);
            if (entity != null) {
                entities.add(entity);
            }
        }

        return entities;
    }

//    private List<Entity> getEntitysInServer() {
//        List<Entity> entitiesInServer = new ArrayList<>();
//        try {
//            EntityManager entityManager = getEntityManager();
//            entitiesInServer = entityManager.getEntities();
//        } catch (Exception e) {
//            LOGGER.error(e.getMessage(), e);
//        }
//        return entitiesInServer;
//    }
//

    public EntityModel getEntity(String projectDir, String entityName) {
        EntityModel entityModel = null;

        Path entityPath = Paths.get(projectDir, "plugins", "entities", entityName);
        File entityFile = entityPath.toFile();
        if (entityFile.exists() && entityFile.isDirectory()) {

            entityModel = new EntityModel(entityName);
            entityModel.inputFlows = flowManagerService.getFlows(projectDir, entityName, FlowType.INPUT);
            entityModel.harmonizeFlows = flowManagerService.getFlows(projectDir, entityName, FlowType.HARMONIZE);

            File entityXmlFile = entityPath.resolve(entityName + ".xml").toFile();
            Entity entity = AbstractEntity.loadFromFile(entityXmlFile);
            if (entity != null) {
                entityModel.dataFormat = entity.getDataFormat();
            }
            else {
                if (entityModel.inputFlows.size() > 0) {
                    entityModel.dataFormat = entityModel.inputFlows.get(0).dataFormat;
                }
                else if (entityModel.harmonizeFlows.size() > 0) {
                    entityModel.dataFormat = entityModel.harmonizeFlows.get(0).dataFormat;
                }

                if (entityModel.dataFormat != null) {
                    entity = new EntityImpl(entityName, entityModel.dataFormat);
                    try(PrintWriter out = new PrintWriter(entityXmlFile)) {
                        out.println(entity.serialize());
                        out.close();
                    } catch (FileNotFoundException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                }

            }

        }

        return entityModel;
    }

    public FlowModel getFlow(String projectDir, String entityName, FlowType flowType, String flowName) {
        EntityModel entity = getEntity(projectDir, entityName);

        List<FlowModel> flows;
        if (flowType.equals(FlowType.INPUT)) {
            flows = entity.inputFlows;
        }
        else {
            flows = entity.harmonizeFlows;
        }

        for (FlowModel flow : flows) {
            if (flow.flowName.equals(flowName)) {
                return flow;
            }
        }

        return null;
    }



    public EntityModel createEntity(String projectDir, EntityModel newEntity) throws IOException {
        Scaffolding scaffolding = new Scaffolding(projectDir);

        scaffolding.createEntity(newEntity.entityName, newEntity.dataFormat);

        for (FlowModel flow : newEntity.inputFlows) {
            scaffolding.createFlow(newEntity.entityName, flow.flowName, FlowType.INPUT, newEntity.pluginFormat, newEntity.dataFormat);
        }

        for (FlowModel flow : newEntity.harmonizeFlows) {
            scaffolding.createFlow(newEntity.entityName, flow.flowName, FlowType.HARMONIZE, newEntity.pluginFormat, newEntity.dataFormat);
        }

        return getEntity(projectDir, newEntity.entityName);
    }

    public FlowModel createFlow(String projectDir, EntityModel entity, FlowType flowType, FlowModel newFlow) throws IOException {
        Scaffolding scaffolding = new Scaffolding(projectDir);
        newFlow.entityName = entity.entityName;
        LOGGER.info("data format: " + entity.dataFormat);
        scaffolding.createFlow(entity.entityName, newFlow.flowName, flowType, newFlow.pluginFormat, entity.dataFormat);
        return getFlow(projectDir, entity.entityName, flowType, newFlow.flowName);
    }
}
