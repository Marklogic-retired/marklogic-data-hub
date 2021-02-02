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
import com.marklogic.hub.central.entities.search.FacetHandler;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import org.apache.commons.lang3.StringUtils;

public class EntityPropertyFacetHandler implements FacetHandler {

    private final String constraintName;

    public EntityPropertyFacetHandler(String constraintName) {
        this.constraintName = constraintName;
    }

    @Override
    public StructuredQueryDefinition buildQuery(DocSearchQueryInfo.FacetData data, StructuredQueryBuilder queryBuilder) {
        StructuredQueryDefinition facetDef = null;
        switch (data.getDataType()) {
            case "int":
            case "integer":
            case "decimal":
            case "long":
            case "float":
            case "double":
            case "date":
            case "dateTime":
                String lowerBound = data.getRangeValues().getLowerBound();
                String upperBound = data.getRangeValues().getUpperBound();
                if (StringUtils.isNotEmpty(lowerBound) || StringUtils.isNotEmpty(upperBound)) {
                    facetDef = queryBuilder
                            .and(queryBuilder.rangeConstraint(constraintName, StructuredQueryBuilder.Operator.GE, lowerBound),
                                    queryBuilder.rangeConstraint(constraintName, StructuredQueryBuilder.Operator.LE, upperBound));
                }
                break;

            default:
                facetDef = queryBuilder.rangeConstraint(constraintName, StructuredQueryBuilder.Operator.EQ,
                        data.getStringValues().toArray(new String[0]));
        }
        return facetDef;
    }
}
