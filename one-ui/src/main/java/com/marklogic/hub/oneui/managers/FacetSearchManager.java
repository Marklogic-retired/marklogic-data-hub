/*
 * Copyright 2012-2020 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.oneui.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.EntitySearchService;
import com.marklogic.hub.oneui.exceptions.DataHubException;
import com.marklogic.hub.oneui.models.FacetInfo;
import com.marklogic.hub.oneui.models.FacetSearchQuery;

public class FacetSearchManager {

    private DatabaseClient finalDataServiceClient;

    public FacetSearchManager(HubConfig hubConfig) {
        finalDataServiceClient = hubConfig.newFinalClient();
    }

    public JsonNode getFacetValues(FacetSearchQuery fsQuery) {
        if (fsQuery.getFacetInfo().getReferenceType().equals("field")) {

            if (fsQuery.getFacetInfo().getPropertyPath().equals("createdByStep")) {
                fsQuery.getFacetInfo().setPropertyPath("datahubCreatedByStep");
            }

            if (fsQuery.getFacetInfo().getPropertyPath().equals("createdInFlowRange")) {
                fsQuery.getFacetInfo().setPropertyPath("datahubCreatedInFlow");
            }
        }

        try {
            return EntitySearchService.on(finalDataServiceClient)
                .getMatchingPropertyValues(fsQuery.getFacetInfo().getEntityTypeId(),
                    fsQuery.getFacetInfo().getPropertyPath(), fsQuery.getFacetInfo().getReferenceType(),
                    fsQuery.getPattern(), Integer.parseInt(fsQuery.getLimit()));
        }
        catch (MarkLogicServerException mse) {
            throw new DataHubException(mse.getServerMessage());
        }
    }

    public JsonNode getFacetValuesRange(FacetInfo facetInfo) {
        try {
            return EntitySearchService.on(finalDataServiceClient)
                .getMinAndMaxPropertyValues(facetInfo.getEntityTypeId(), facetInfo.getPropertyPath(),
                    facetInfo.getReferenceType());
        }
        catch (MarkLogicServerException mse) {
            throw new DataHubException(mse.getServerMessage());
        }
    }
}
