/*
 * Copyright 2012-2021 MarkLogic Corporation
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
package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.central.entities.search.Constants;
import com.marklogic.hub.central.entities.search.FacetHandler;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;

public class CollectionFacetHandler implements FacetHandler {

    @Override
    public StructuredQueryDefinition buildQuery(DocSearchQueryInfo.FacetData data, StructuredQueryBuilder queryBuilder) {
        return queryBuilder
                .collectionConstraint(Constants.COLLECTION_CONSTRAINT_NAME, data.getStringValues().toArray(new String[0]));
    }
}
