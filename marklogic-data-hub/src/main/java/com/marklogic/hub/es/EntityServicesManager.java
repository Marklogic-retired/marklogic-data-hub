package com.marklogic.hub.es;

import com.marklogic.client.DatabaseClient;

import java.util.Optional;

/*
 * This class overrides the original so we can fix the TDE templates to work properly.
 */
public class EntityServicesManager extends com.marklogic.client.ext.es.EntityServicesManager {
    protected DatabaseClient client;
    private static final String ENTITY_FILE_EXTENSION = ".entity.json";

    public EntityServicesManager(DatabaseClient client) {
        super(client);
        this.client = client;
    }

    @Override
    protected String generateCode(String modelUri, String functionName) {
        if ("extraction-template-generate".equals(functionName)) {
            String xquery = "import module namespace es = \"http://marklogic.com/entity-services\" at \"/MarkLogic/entity-services/entity-services.xqy\"; \n" +
                "import module namespace hent = \"http://marklogic.com/data-hub/hub-entities\" at \"/data-hub/4/impl/hub-entities.xqy\";\n" +
                "declare variable $entity-title external; \n" +
                "hent:dump-tde(json:to-array(es:model-validate(hent:get-model($entity-title))))";
            return client.newServerEval().xquery(xquery).addVariable("entity-title", extractEntityNameFromURI(modelUri).get()).eval().next().getString();
        } else {
            return super.generateCode(modelUri, functionName);
        }
    }

    public static Optional<String> extractEntityNameFromURI(String filename) {
        if (filename==null || filename.trim().isEmpty()) {
            return Optional.of(null);
        }
        int pathIndex = filename.lastIndexOf("/");
        if (pathIndex >= 0) {
            filename = filename.substring(pathIndex + 1);
        }
        int index = filename.indexOf(ENTITY_FILE_EXTENSION);
        if (index<0) {
            //not found
            return Optional.of(null);
        }
        return Optional.of(filename.substring(0,index));
    }
}
