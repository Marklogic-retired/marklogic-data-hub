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
package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.central.entities.search.Constants;
import com.marklogic.hub.central.entities.search.FacetHandler;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class CreatedOnFacetHandler implements FacetHandler {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter
            .ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

    @Override
    public StructuredQueryDefinition buildQuery(DocSearchQueryInfo.FacetData data, StructuredQueryBuilder queryBuilder) {
        // Converting the date in string format from yyyy-MM-dd format to yyyy-MM-dd HH:mm:ss format
        LocalDate startDate = LocalDate.parse(data.getRangeValues().getLowerBound(), DATE_FORMAT);
        String startDateTime = startDate.atStartOfDay(ZoneId.systemDefault())
                .format(DATE_TIME_FORMAT);

        // Converting the date in string format from yyyy-MM-dd format to yyyy-MM-dd HH:mm:ss format
        // Adding 1 day to end date to get docs harmonized on the end date as well.
        LocalDate endDate = LocalDate.parse(data.getRangeValues().getUpperBound(), DATE_FORMAT)
                .plusDays(1);
        String endDateTime = endDate.atStartOfDay(ZoneId.systemDefault()).format(DATE_TIME_FORMAT);

        return queryBuilder
                .and(queryBuilder.rangeConstraint(Constants.CREATED_ON_CONSTRAINT_NAME, StructuredQueryBuilder.Operator.GE, startDateTime),
                        queryBuilder.rangeConstraint(Constants.CREATED_ON_CONSTRAINT_NAME, StructuredQueryBuilder.Operator.LT, endDateTime));

    }
}
