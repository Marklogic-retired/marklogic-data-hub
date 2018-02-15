package com.marklogic.hub.validate;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.validate.impl.EntitiesValidatorImpl;

public interface EntitiesValidator {

    static EntitiesValidator create(DatabaseClient client){
        return new EntitiesValidatorImpl(client);
    }

    JsonNode validateAll();

    JsonNode validate(String entity, String flow, String plugin, String type, String content);
}
