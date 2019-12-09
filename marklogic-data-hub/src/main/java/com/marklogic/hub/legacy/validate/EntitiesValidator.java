/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.legacy.validate;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.legacy.validate.impl.EntitiesValidatorImpl;

/**
 * Uses a supplied DatabaseClient to run an entity validation against all entities defined or
 * against a specific entity/flow/plugins (triples etc) combination
 */
public interface EntitiesValidator {

    /**
     * Creates and returns a an EntityValidator object
     * @param client - DatabaseClient to be used to obtain the information
     * @return EntitiesValidator object
     */
    static EntitiesValidator create(DatabaseClient client){
        return new EntitiesValidatorImpl(client);
    }

    /**
     * Validates all entities
     * @return JsonNode from jackson showing if entities are valid or not
     */
    JsonNode validateAll();

    /**
     * Creates and returns a an EntityValidator object
     * @param  entity - name of the entity you are attempting to validate
     * @param flow - name of the flow you want to use
     * @param plugin - which plugin (triples/headers/etc) without extension
     * @param type - xquery or javascript
     * @param content - the content to validate against
     * @return JsonNode from jackson if the entity is valid
     */
    JsonNode validate(String entity, String flow, String plugin, String type, String content);
}
