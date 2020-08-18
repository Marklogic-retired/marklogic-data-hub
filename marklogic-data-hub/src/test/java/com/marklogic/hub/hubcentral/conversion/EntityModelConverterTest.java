package com.marklogic.hub.hubcentral.conversion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EntityModelConverterTest extends AbstractHubCoreTest {

    private static final List<String> customerFacetableProperties = Arrays.asList("name", "nicknames", "birthDate", "status");

    @BeforeEach
    void setUp() {
        HubConfig hubConfig = getHubConfig();
        HubProject hubProject = hubConfig.getHubProject();
        File testProjectDir = null;
        try {
            testProjectDir = new ClassPathResource("entity-conversion-test").getFile();
            File entitiesDir = new File(testProjectDir, "entities");
            if (entitiesDir.exists()) {
                FileUtils.copyDirectory(entitiesDir, hubProject.getHubEntitiesDir().toFile());
            }
        } catch (IOException e) {
            throw new RuntimeException("Unable to load project files: " + e.getMessage(), e);
        }
    }

    @Test
    void testEntityModelValidForConversion() {
        HubProject hubProject = getHubConfig().getHubProject();
        HubCentralConverter hubCentralConverter = new HubCentralConverter(getHubConfig());
        Path entitiesDir = hubProject.getHubEntitiesDir();

        String currentFileName = "Customer.entity.json";
        JsonNode customerEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertTrue(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) customerEntity));

        currentFileName = "NoInfo.entity.json";
        JsonNode noInfoEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) noInfoEntity));

        currentFileName = "NoInfoTitle.entity.json";
        JsonNode noInfoTitleEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) noInfoTitleEntity));

        currentFileName = "EmptyTitle.entity.json";
        JsonNode emptyTitleEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) emptyTitleEntity));

        currentFileName = "NoDefinitions.entity.json";
        JsonNode noDefinitionsEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) noDefinitionsEntity));

        currentFileName = "NoEntityType.entity.json";
        JsonNode noEntityTypeEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) noEntityTypeEntity));

        currentFileName = "NoProperties.entity.json";
        JsonNode noPropertiesEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertTrue(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) noPropertiesEntity));

        currentFileName = "NoIndexArrays.entity.json";
        JsonNode noIndexArraysEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertTrue(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) noIndexArraysEntity));

        currentFileName = "MissingIndexedProperty.entity.json";
        JsonNode missingIndexedPropertyEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertTrue(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) missingIndexedPropertyEntity));

        currentFileName = "EmptyFile.entity.json";
        JsonNode emptyFileEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelValidForConversion(currentFileName, (ObjectNode) emptyFileEntity));
    }

    @Test
    void testEntityModelRequiresConversion() {
        HubProject hubProject = getHubConfig().getHubProject();
        HubCentralConverter hubCentralConverter = new HubCentralConverter(getHubConfig());
        Path entitiesDir = hubProject.getHubEntitiesDir();

        String currentFileName = "Customer.entity.json";
        JsonNode customerEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertTrue(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) customerEntity));

        currentFileName = "NoInfo.entity.json";
        JsonNode noInfoEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) noInfoEntity));

        currentFileName = "NoInfoTitle.entity.json";
        JsonNode noInfoTitleEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) noInfoTitleEntity));

        currentFileName = "EmptyTitle.entity.json";
        JsonNode emptyTitleEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) emptyTitleEntity));

        currentFileName = "NoDefinitions.entity.json";
        JsonNode noDefinitionsEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) noDefinitionsEntity));

        currentFileName = "NoEntityType.entity.json";
        JsonNode noEntityTypeEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) noEntityTypeEntity));

        currentFileName = "NoProperties.entity.json";
        JsonNode noPropertiesEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) noPropertiesEntity));

        currentFileName = "NoIndexArrays.entity.json";
        JsonNode noIndexArraysEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) noIndexArraysEntity));

        currentFileName = "MissingIndexedProperty.entity.json";
        JsonNode missingIndexedPropertyEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertTrue(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) missingIndexedPropertyEntity));

        currentFileName = "EmptyFile.entity.json";
        JsonNode emptyFileEntity = readJsonObject(entitiesDir.resolve(currentFileName).toFile());
        assertFalse(hubCentralConverter.entityModelRequiresConversion(currentFileName, (ObjectNode) emptyFileEntity));
    }

    @Test
    void convertEntityModels() {
        HubProject hubProject = getHubConfig().getHubProject();
        HubCentralConverter hubCentralConverter = new HubCentralConverter(getHubConfig());
        hubCentralConverter.convertEntityModels();

        File backupDir = hubProject.getProjectDir().resolve("converted-entities").toFile();
        assertTrue(backupDir.exists());

        verifyCustomerEntityModel(hubProject);
        verifyImproperEntityModels(hubProject);
        verifyNoIndexArraysEntityModel(hubProject);
        verifyMissingIndexedPropertyEntityModel(hubProject);
    }

    private void verifyCustomerEntityModel(HubProject hubProject) {
        Path entitiesDir = hubProject.getHubEntitiesDir();
        JsonNode hubEntity = readJsonObject(entitiesDir.resolve("Customer.entity.json").toFile());
        JsonNode customerNode = hubEntity.get("definitions").get("Customer");

        // verify simple and simple array properties
        JsonNode customerPropertiesNode = customerNode.get("properties");
        customerFacetableProperties.forEach(property -> assertTrue(customerPropertiesNode.get(property).get("facetable").asBoolean()));

        // verify rangeIndex and elementRangeIndex arrays are deleted
        assertNull(customerNode.get("rangeIndex"));
        assertNull(customerNode.get("elementRangeIndex"));

        // verify facetable doesn't exist on Structured Type properties
        assertNull(customerPropertiesNode.get("shipping").get("facetable"));
        assertNull(customerPropertiesNode.get("billing").get("facetable"));

        // verify there are no sortable properties
        customerPropertiesNode.fieldNames().forEachRemaining(property -> assertNull(customerPropertiesNode.get(property).get("sortable")));

        // verify rangeIndex and elementRangeIndex exist on Structured Entity Types, Address and Zip here
        JsonNode addressNode = hubEntity.get("definitions").get("Address");
        JsonNode addressPropertiesNode = addressNode.get("properties");
        assertNotNull(addressNode.get("rangeIndex"));
        assertEquals(1, addressNode.get("rangeIndex").size());
        assertNotNull(addressNode.get("elementRangeIndex"));
        assertEquals(1, addressNode.get("elementRangeIndex").size());
        addressPropertiesNode.fieldNames().forEachRemaining(property -> assertNull(addressPropertiesNode.get(property).get("facetable")));
        addressPropertiesNode.fieldNames().forEachRemaining(property -> assertNull(addressPropertiesNode.get(property).get("sortable")));

        JsonNode zipNode = hubEntity.get("definitions").get("Zip");
        JsonNode zipPropertiesNode = zipNode.get("properties");
        assertNotNull(zipNode.get("rangeIndex"));
        assertEquals(1, zipNode.get("rangeIndex").size());
        assertNotNull(zipNode.get("elementRangeIndex"));
        assertEquals(1, zipNode.get("elementRangeIndex").size());
        zipPropertiesNode.fieldNames().forEachRemaining(property -> assertNull(zipPropertiesNode.get(property).get("facetable")));
        zipPropertiesNode.fieldNames().forEachRemaining(property -> assertNull(zipPropertiesNode.get(property).get("sortable")));

        // verify facetable doesn't exist on the relationship type property
        assertNull(customerPropertiesNode.get("orders").get("facetable"));
    }

    private void verifyImproperEntityModels(HubProject hubProject) {
        List<String> improperEntityModelTitleNames = Arrays.asList("NoInfo", "NoInfoTitle", "EmptyTitle");
        Path entitiesDir = hubProject.getHubEntitiesDir();

        improperEntityModelTitleNames.forEach((entityModelName) -> {
            JsonNode entityModel = readJsonObject(entitiesDir.resolve(entityModelName + EntityManagerImpl.ENTITY_FILE_EXTENSION).toFile());
            JsonNode entityType = entityModel.get("definitions").get(entityModelName);
            assertNotNull(entityType.get("rangeIndex"));
            assertNotNull(entityType.get("elementRangeIndex"));
            assertNotNull(entityType.get("pathRangeIndex"));
            JsonNode entityTypeProperties = entityType.get("properties");
            entityTypeProperties.fieldNames().forEachRemaining(property -> assertNull(entityTypeProperties.get(property).get("sortable")));
            entityTypeProperties.fieldNames().forEachRemaining(property -> assertNull(entityTypeProperties.get(property).get("facetable")));
        });
    }

    private void verifyNoIndexArraysEntityModel(HubProject hubProject) {
        Path entitiesDir = hubProject.getHubEntitiesDir();
        String entityModelName = "NoIndexArrays";
        JsonNode entityModel = readJsonObject(entitiesDir.resolve(entityModelName + EntityManagerImpl.ENTITY_FILE_EXTENSION).toFile());
        JsonNode entityType = entityModel.get("definitions").get(entityModelName);
        assertNull(entityType.get("rangeIndex"));
        assertNull(entityType.get("elementRangeIndex"));
        assertNull(entityType.get("pathRangeIndex"));
        JsonNode entityTypeProperties = entityType.get("properties");
        entityTypeProperties.fieldNames().forEachRemaining(property -> assertNull(entityTypeProperties.get(property).get("sortable")));
        entityTypeProperties.fieldNames().forEachRemaining(property -> assertNull(entityTypeProperties.get(property).get("facetable")));
    }

    private void verifyMissingIndexedPropertyEntityModel(HubProject hubProject) {
        Path entitiesDir = hubProject.getHubEntitiesDir();
        String entityModelName = "MissingIndexedProperty";
        JsonNode entityModel = readJsonObject(entitiesDir.resolve(entityModelName + EntityManagerImpl.ENTITY_FILE_EXTENSION).toFile());
        JsonNode entityType = entityModel.get("definitions").get(entityModelName);
        assertNull(entityType.get("rangeIndex"));
        assertNull(entityType.get("elementRangeIndex"));
        assertNull(entityType.get("pathRangeIndex"));
        JsonNode entityTypeProperties = entityType.get("properties");
        customerFacetableProperties.forEach(property -> assertTrue(entityTypeProperties.get(property).get("facetable").asBoolean()));
        assertNull(entityTypeProperties.get("someTest"));
    }
}
