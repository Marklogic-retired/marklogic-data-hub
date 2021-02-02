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
import com.marklogic.hub.central.exceptions.DataHubException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.Map;

public class CreatedOnFacetHandler implements FacetHandler {

    public static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssZ");

    @Override
    public StructuredQueryDefinition buildQuery(DocSearchQueryInfo.FacetData data, StructuredQueryBuilder queryBuilder) {
        Map<String, String> dateRange = computeDateRange(data, new CreatedOnFacetInputs());
        return queryBuilder.and(
            queryBuilder.rangeConstraint(Constants.CREATED_ON_CONSTRAINT_NAME, StructuredQueryBuilder.Operator.GE, dateRange.get("startDateTime")),
            queryBuilder.rangeConstraint(Constants.CREATED_ON_CONSTRAINT_NAME, StructuredQueryBuilder.Operator.LT, dateRange.get("endDateTime"))
        );
    }

    protected Map<String, String> computeDateRange(DocSearchQueryInfo.FacetData data, CreatedOnFacetInputs facetInputs) {

        if(data.getStringValues().size() > 0) {
            facetInputs.timeRange = data.getStringValues().get(0);
        }

        if(data.getStringValues().size() > 1) {
            facetInputs.zoneOffset = Integer.parseInt(data.getStringValues().get(1));
        }

        facetInputs.zoneId = ZoneId.ofOffset("UTC", ZoneOffset.ofTotalSeconds(facetInputs.zoneOffset*60));
        facetInputs.startDate = LocalDate.now().atStartOfDay(facetInputs.zoneId);
        facetInputs.endDate = LocalDate.now().atStartOfDay(facetInputs.zoneId);

        switch (facetInputs.timeRange) {
            case "Today":
                getTodayTimeWindow(facetInputs);
                break;

            case "This Week":
                getThisWeekTimeWindow(facetInputs);
                break;

            case "This Month":
                getThisMonthTimeWindow(facetInputs);
                break;

            case "Custom":
                getCustomTimeWindow(data, facetInputs);
                break;
        }
        return facetInputs.dateRange;
    }

    private void getTodayTimeWindow(CreatedOnFacetInputs facetInputs) {
        facetInputs.startDateTime = facetInputs.startDate.toLocalDate().atStartOfDay(facetInputs.zoneId).format(DATE_TIME_FORMAT);
        facetInputs.dateRange.put("startDateTime", facetInputs.startDateTime);
        facetInputs.endDateTime = facetInputs.endDate.plusDays(1).toLocalDate().atStartOfDay(facetInputs.zoneId).format(DATE_TIME_FORMAT);
        facetInputs.dateRange.put("endDateTime", facetInputs.endDateTime);
    }

    private void getThisWeekTimeWindow(CreatedOnFacetInputs facetInputs) {
        facetInputs.startDateTime = facetInputs.startDate.plusDays((-1) * (facetInputs.startDate.getDayOfWeek().getValue() % 7)).format(DATE_TIME_FORMAT);
        facetInputs.dateRange.put("startDateTime", facetInputs.startDateTime);
        facetInputs.endDateTime = facetInputs.endDate.plusDays(1).toLocalDate().atStartOfDay(facetInputs.zoneId).format(DATE_TIME_FORMAT);
        facetInputs.dateRange.put("endDateTime", facetInputs.endDateTime);
    }

    private void getThisMonthTimeWindow(CreatedOnFacetInputs facetInputs) {
        facetInputs.startDate = facetInputs.startDate.with(TemporalAdjusters.firstDayOfMonth());
        facetInputs.startDateTime = facetInputs.startDate.toLocalDate().atStartOfDay(facetInputs.zoneId).format(DATE_TIME_FORMAT);
        facetInputs.dateRange.put("startDateTime", facetInputs.startDateTime);
        facetInputs.endDateTime = facetInputs.endDate.plusDays(1).toLocalDate().atStartOfDay(facetInputs.zoneId).format(DATE_TIME_FORMAT);
        facetInputs.dateRange.put("endDateTime", facetInputs.endDateTime);
    }

    private void getCustomTimeWindow(DocSearchQueryInfo.FacetData data, CreatedOnFacetInputs facetInputs) {
        if(!data.getRangeValues().getLowerBound().isEmpty() && !data.getRangeValues().getUpperBound().isEmpty()) {
            try {
                facetInputs.startDateTime = ZonedDateTime.parse(data.getRangeValues().getLowerBound()).format(DATE_TIME_FORMAT);
                facetInputs.endDateTime = ZonedDateTime.parse(data.getRangeValues().getUpperBound()).plusDays(1).format(DATE_TIME_FORMAT);
            } catch (DateTimeParseException dtpe) {
                facetInputs.startDate = LocalDate.parse(data.getRangeValues().getLowerBound()).atStartOfDay().atZone(ZoneOffset.UTC);
                facetInputs.endDate = LocalDate.parse(data.getRangeValues().getUpperBound()).atStartOfDay().atZone(ZoneOffset.UTC);
                facetInputs.startDateTime = facetInputs.startDate.format(DATE_TIME_FORMAT);
                facetInputs.endDateTime = facetInputs.endDate.plusDays(1).format(DATE_TIME_FORMAT);
            }
            facetInputs.dateRange.put("startDateTime", facetInputs.startDateTime);
            facetInputs.dateRange.put("endDateTime", facetInputs.endDateTime);
        } else {
            throw new DataHubException("The date range is missing for createdOn in your request");
        }
    }

    protected static final class CreatedOnFacetInputs {
        int zoneOffset = 0;
        Map<String, String> dateRange = new HashMap<>();
        String startDateTime;
        String endDateTime;
        String timeRange = "Custom";
        ZoneId zoneId = ZoneId.ofOffset("UTC", ZoneOffset.ofTotalSeconds(zoneOffset*60));
        ZonedDateTime startDate = LocalDate.now().atStartOfDay(zoneId);
        ZonedDateTime endDate = LocalDate.now().atStartOfDay(zoneId);
    }
}
