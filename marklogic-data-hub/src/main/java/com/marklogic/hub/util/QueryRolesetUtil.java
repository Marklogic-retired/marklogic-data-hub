/*
 * Copyright (c) 2020 MarkLogic Corporation
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

    public static void handleSaveException(HttpClientErrorException ex) {
        if (isPermissionDeniedException(ex)) {
            logger.error("Received SEC-PERMDENIED error when deploying query roleset; this can be safely ignored if the " +
                "query roleset already exists in MarkLogic.");
        } else {
            throw ex;
        }
    }

    private static boolean isPermissionDeniedException(HttpClientErrorException ex) {
        try {
            JsonNode error = ObjectMapperFactory.getObjectMapper().readTree(ex.getResponseBodyAsString());
            if (error.has("errorResponse")) {
                JsonNode errorResponse = error.get("errorResponse");
                if (errorResponse.has("messageCode")) {
                    return "SEC-PERMDENIED".equals(errorResponse.get("messageCode").asText());
                }
            }
        } catch (Exception e) {
            logger.warn("Unexpected error when trying to parse error for deploying query rolesets: " + e.getMessage());
        }
        return false;
    }
}
