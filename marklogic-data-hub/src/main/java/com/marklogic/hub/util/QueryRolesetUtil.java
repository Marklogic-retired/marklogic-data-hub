/*
 * Copyright (c) 2021 MarkLogic Corporation
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
package com.marklogic.hub.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.HttpClientErrorException;

public class QueryRolesetUtil {

    private static final Logger logger = LoggerFactory.getLogger(QueryRolesetUtil.class);

    /**
     * Query rolesets have a bug in the Manage API in < 10.0-4 ML, and the Manage API no longer supports PUT requests
     * (updates) on them in 10.0-4. Because DHF 5.3.0 requires ML 10.0-2.1 or higher, need to do some error handling here
     * as some errors should just be logged and ignored.
     *
     * @param ex
     */
    public static void handleSaveException(HttpClientErrorException ex) {
        try {
            JsonNode error = ObjectMapperFactory.getObjectMapper().readTree(ex.getResponseBodyAsString());
            if (error.has("errorResponse")) {
                JsonNode errorResponse = error.get("errorResponse");
                if (errorResponse.has("messageCode")) {
                    final String messageCode = errorResponse.get("messageCode").asText();
                    if ("SEC-PERMDENIED".equals(messageCode)) {
                        logger.error("Received SEC-PERMDENIED error when deploying query roleset; this can be safely ignored if the " +
                            "query roleset already exists in MarkLogic.");
                        return;
                    } else if ("REST-UNSUPPORTEDMETHOD".equals(messageCode)) {
                        // This won't occur when using a data-hub-developer user, but will when using an admin user, and
                        // likely a user with manage-admin/security as well
                        logger.info("Received REST-UNSUPPORTEDMETHOD error when updating query roleset; this can be safely ignored " +
                            "when running against MarkLogic version 10.0-4 or higher, which no longer supports updates to query rolesets");
                        return;
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Unexpected error when trying to parse error for deploying query rolesets: " + e.getMessage());
        }
        throw ex;
    }
}
