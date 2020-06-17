package com.marklogic.hub.central.controllers.model;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.io.Format;
import com.marklogic.hub.central.AbstractHubCentralTest;

import java.util.HashMap;
import java.util.Map;
import java.util.function.BiConsumer;

public abstract class AbstractModelTest extends AbstractHubCentralTest {

    protected void assertSearchOptions(String modelName, BiConsumer<Boolean, String> assertion, boolean expected) {
        String startsWith = (expected) ? "Expected " : "Did not expect ";
        DatabaseClient stagingDatabaseClient = getHubClient().getStagingClient();
        DatabaseClient finalDatabaseClient = getHubClient().getFinalClient();
        Map<String, DatabaseClient> clientMap = new HashMap<>();
        clientMap.put("staging", stagingDatabaseClient);
        clientMap.put("final", finalDatabaseClient);
        clientMap.forEach((databaseKind, databaseClient) -> {
            QueryOptionsManager queryOptionsManager = databaseClient.newServerConfigManager().newQueryOptionsManager();
            assertion.accept(queryOptionsManager.readOptionsAs("exp-" + databaseKind + "-entity-options", Format.XML, String.class).contains(modelName), startsWith + modelName + " to be in options file " + "exp-" + databaseKind + "-entity-options");
            assertion.accept(queryOptionsManager.readOptionsAs(databaseKind + "-entity-options", Format.XML, String.class).contains(modelName), startsWith + modelName + " to be in options file " + databaseKind + "-entity-options");
        });
    }
}
