package com.marklogic.hub.hubcentral.conversion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

public class HubCentralConverter extends LoggingObject {

    private static final List<String> removableIndexArrays = Arrays.asList("elementRangeIndex", "rangeIndex", "pathRangeIndex");
    private HubConfig hubConfig;
    private FlowConverter flowConverter;
    private ObjectMapper mapper = new ObjectMapper();

    public HubCentralConverter(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.flowConverter = new FlowConverter(this.hubConfig);
    }

    /**
     * Convert the entity model, flow and mapping files in a user's local project.
     * Does not make any changes to what's stored in MarkLogic.
     */
    public void convertUserArtifacts() {
        flowConverter.convertFlows();
        convertEntityModels();
    }

    /**
     * Convert the entity model files in a user's local project. Does not make any changes to what's stored in MarkLogic.
     */
    protected void convertEntityModels() {
        HubProject hubProject = hubConfig.getHubProject();
        final File entityModelsDir = hubProject.getHubEntitiesDir().toFile();
        if (!entityModelsDir.exists()) {
            logger.warn("No entities directory exists, so no entity models will be converted");
            return;
        }

        logger.warn("Beginning conversion of entity models in entities directory");

        Path convertedEntitiesPath = hubProject.getProjectDir().resolve("converted-entities");
        try {
            convertedEntitiesPath.toFile().mkdirs();
            FileUtils.copyDirectory(entityModelsDir, convertedEntitiesPath.toFile());
        } catch (Exception e) {
            throw new RuntimeException("Couldn't convert entity models as backing up models failed : " + e.getMessage(), e);
        }

        ObjectWriter writer = mapper.writerWithDefaultPrettyPrinter();
        boolean atLeastOneEntityModelWasConverted = false;
        File[] entityModelDefs = entityModelsDir.listFiles((dir, name) -> name.endsWith(EntityManagerImpl.ENTITY_FILE_EXTENSION));

        for (File entityModelDef : entityModelDefs) {
            ObjectNode entityModelNode = null;
            String fileName = entityModelDef.getName();
            try {
                FileInputStream fileInputStream = new FileInputStream(entityModelDef);
                entityModelNode = (ObjectNode) mapper.readTree(fileInputStream);
                fileInputStream.close();
            } catch (IOException e) {
                logger.warn(format("Ignoring %s entity model definition as malformed JSON content is found", fileName));
                logger.error(e.getMessage());
            }

            if (entityModelRequiresConversion(fileName, entityModelNode)) {
                String title = entityModelNode.get("info").get("title").asText();
                ObjectNode entityTypeNode = (ObjectNode) entityModelNode.get("definitions").get(title);

                List<String> elementRangeIndex = mapper.convertValue(entityTypeNode.get("elementRangeIndex"), ArrayList.class);
                elementRangeIndex = elementRangeIndex == null ? new ArrayList<>() : elementRangeIndex;
                List<String> rangeIndex = mapper.convertValue(entityTypeNode.get("rangeIndex"), ArrayList.class);
                rangeIndex = rangeIndex == null ? new ArrayList<>() : rangeIndex;
                List<String> pathRangeIndex = mapper.convertValue(entityTypeNode.get("pathRangeIndex"), ArrayList.class);
                pathRangeIndex = pathRangeIndex == null ? new ArrayList<>() : pathRangeIndex;
                Set<String> mergedIndexArrays = new HashSet<>();
                Stream.of(elementRangeIndex, rangeIndex, pathRangeIndex).forEach(mergedIndexArrays::addAll);

                ObjectNode entityTypePropertiesNode = (ObjectNode) entityTypeNode.get("properties");
                if (entityTypePropertiesNode == null) {
                    logger.warn("entityTypePropertiesNode is null");
                    entityTypeNode.remove(removableIndexArrays);
                    atLeastOneEntityModelWasConverted = true;
                    continue;
                }

                entityTypePropertiesNode.fieldNames().forEachRemaining(propertyName -> {
                    if (mergedIndexArrays.contains(propertyName)) {
                        ObjectNode entityPropertyNode = (ObjectNode) entityTypePropertiesNode.get(propertyName);
                        if (!isStructuredTypeProperty(entityPropertyNode)) {
                            entityPropertyNode.put("facetable", true);
                        }
                    }
                });
                entityTypeNode.remove(removableIndexArrays);

                try {
                    writer.writeValue(entityModelDef, entityModelNode);
                    logger.warn(format("Entity Model '%s' was successfully converted", entityModelDef));
                    atLeastOneEntityModelWasConverted = true;
                } catch (IOException e) {
                    logger.error(format("Entity Model '%s' conversion failed; cause: %s", entityModelDef, e.getMessage()), e);
                }
            }
        }

        if (atLeastOneEntityModelWasConverted) {
            logger.warn("Finished converting entity models.");
            logger.warn("Please examine your entity model files to verify that properties that were listed in the rangeIndex, pathRangeIndex, or elementRangeIndex arrays " +
                    "now have \"facetable\":true in their property definition.\n");
        } else {
            logger.warn("No entity models required conversion, so no project files were modified");
        }
    }

    protected boolean entityModelRequiresConversion(String fileName, ObjectNode entityModelNode) {
        if (!entityModelValidForConversion(fileName, entityModelNode)) {
            return false;
        }
        String firstLevelEntityTypeName = entityModelNode.get("info").get("title").asText();
        entityModelNode = (ObjectNode) entityModelNode.get("definitions").get(firstLevelEntityTypeName);
        return entityModelNode.get("rangeIndex") != null || entityModelNode.get("elementRangeIndex") != null ||
                entityModelNode.get("pathRangeIndex") != null;
    }

    protected boolean entityModelValidForConversion(String fileName, ObjectNode entityModelNode) {
        if (entityModelNode == null) {
            logger.warn(format("No content exist in the entity model definition %s and can not be converted", fileName));
            return false;
        }

        if (!entityModelNode.has("info")) {
            logger.warn(format("Info doesn't exist in the entity model definition %s and can not be converted", fileName));
            return false;
        }

        if (!entityModelNode.get("info").has("title")) {
            logger.warn(format("Title doesn't exist in the entity model definition %s in the info and can not be converted", fileName));
            return false;
        }

        if (entityModelNode.get("info").get("title") == null || entityModelNode.get("info").get("title").asText().isEmpty()) {
            logger.warn(format("Title is empty in the entity model definition %s in the info and can not be converted", fileName));
            return false;
        }
        String title = entityModelNode.get("info").get("title").asText();

        if (!entityModelNode.has("definitions")) {
            logger.warn(format("No definitions found in the entity model definition %s and can not be converted", fileName));
            return false;
        }

        if (entityModelNode.get("definitions").get(title) == null) {
            logger.warn(format("entityType with title %s does not exist in the entity model definition %s", title, fileName));
            return false;
        }

        return true;
    }

    private boolean isStructuredTypeProperty(ObjectNode entityPropertyNode) {
        // check for simple structured type property or simple relationship property
        if (entityPropertyNode.get("datatype") == null && entityPropertyNode.get("$ref") != null) {
            return true;
        }

        // check if structured type or relationship type property with array datatype
        if (entityPropertyNode.get("datatype") != null && entityPropertyNode.get("datatype").asText().equals("array") &&
                entityPropertyNode.get("items") != null && entityPropertyNode.get("items").get("$ref") != null) {
            return true;
        }

        return false;
    }
}
