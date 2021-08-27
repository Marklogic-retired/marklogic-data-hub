package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.controllers.ModelController;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.api.database.ElementIndex;
import com.marklogic.mgmt.api.database.PathIndex;
import com.marklogic.mgmt.api.database.PathNamespace;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CreateAndUpdateModelTest extends ModelTest {

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testModelsServicesEndpoints() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createModel();
        updateModelInfo();
        updateModelEntityTypes();
    }

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testCreateNamespacedModel() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createNamespacedModel();
        updateModelWithGraphConfig();
    }

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testUpdatedIndexes() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createModel();
        updateDataType("dateTime");
        updateDataType("date");
        assertDateTimeIndexExists();
        removeRangeElementIndexesFromFinalDatabase();
        addProperty();
        assertDateTimeIndexDoesntExist();
    }
}
