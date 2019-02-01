package com.marklogic.hub.es;

import com.marklogic.client.DatabaseClient;

/*
 * This class overrides the original so we can fix the TDE templates to work properly.
 */
public class EntityServicesManager extends com.marklogic.client.ext.es.EntityServicesManager {
    protected DatabaseClient client;
    public EntityServicesManager(DatabaseClient client) {
        super(client);
        this.client = client;
    }

    @Override
    protected String generateCode(String modelUri, String functionName) {
        if ("extraction-template-generate".equals(functionName)) {
            String xquery = "import module namespace es = \"http://marklogic.com/entity-services\" at \"/MarkLogic/entity-services/entity-services.xqy\"; \n" +
                "import module namespace hent = \"http://marklogic.com/data-hub/hub-entities\" at \"/data-hub/4/impl/hub-entities.xqy\";\n" +
                "declare variable $URI external; \n" +
                "hent:dump-tde(json:to-array(es:model-validate(fn:doc($URI))))";
            return client.newServerEval().xquery(xquery).addVariable("URI", modelUri).eval().next().getString();
        } else {
            return super.generateCode(modelUri, functionName);
        }
    }
}
