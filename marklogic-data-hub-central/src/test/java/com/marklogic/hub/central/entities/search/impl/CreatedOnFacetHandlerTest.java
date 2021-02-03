package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.central.entities.search.Constants;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.hub.central.exceptions.DataHubException;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CreatedOnFacetHandlerTest extends AbstractFacetHandlerTest {

    List<String> stringValues;
    Map<String, String> dateRange;

    CreatedOnFacetHandler createdOnFacetHandler;
    CreatedOnFacetHandler.CreatedOnFacetInputs facetInputs;
    DocSearchQueryInfo.FacetData facetData;
    DocSearchQueryInfo.RangeValues rangeValues;

    ZoneId zoneId;
    String zoneOffset = "-420";
    ZonedDateTime startDateTime;
    ZonedDateTime endDateTime;
    ZonedDateTime currentDateTime;

    @BeforeEach
    public void setup() {
        stringValues = new ArrayList<>();
        dateRange = new HashMap<>();
        createdOnFacetHandler = new CreatedOnFacetHandler();
        zoneId = ZoneId.ofOffset("UTC", ZoneOffset.ofTotalSeconds(Integer.parseInt(zoneOffset)*60));
        facetData = new DocSearchQueryInfo.FacetData();
        rangeValues = new DocSearchQueryInfo.RangeValues();
        facetInputs = new CreatedOnFacetHandler.CreatedOnFacetInputs();
    }

    @Test
    public void testCreatedOnDateRangeFacet() {
        String constraintName = Constants.CREATED_ON_CONSTRAINT_NAME;
        String lowerBound = "2020-06-01T00:00:00-07:00";
        String upperBound = "2020-06-05T00:00:00-07:00";
        String expectedLowerBound = "2020-06-01T00:00:00-0700";
        String expectedUpperBound = "2020-06-06T00:00:00-0700";
        facetData.setStringValues(Arrays.asList("Custom"));
        rangeValues.setLowerBound(lowerBound);
        rangeValues.setUpperBound(upperBound);
        facetData.setRangeValues(rangeValues);
        StructuredQueryBuilder queryBuilder = new StructuredQueryBuilder();

        StructuredQueryDefinition queryDefinition = createdOnFacetHandler.buildQuery(facetData, queryBuilder);
        Fragment fragment = toFragment(queryDefinition);

        assertEquals(Arrays.asList(constraintName, constraintName), fragment.getElementValues("//search:constraint-name"));
        assertTrue(fragment.getElementValue("//search:value[../search:range-operator='GE']").contains(expectedLowerBound),
                "Expected lower bound to include: " + expectedLowerBound);
        assertTrue(fragment.getElementValue("//search:value[../search:range-operator='LT']").contains(expectedUpperBound),
                "Upper bound is one day more than what was passed in order to include the passed in date as well" +
                        " for comparison. Expected upper bound to include: " + expectedUpperBound);
    }

    @Test
    public void testTodayDateRange() {
        stringValues = Arrays.asList("Today", zoneOffset);
        facetData.setStringValues(stringValues);
        facetData.setRangeValues(rangeValues);

        startDateTime = ZonedDateTime.parse(createdOnFacetHandler.computeDateRange(facetData, facetInputs).get("startDateTime"),
                CreatedOnFacetHandler.DATE_TIME_FORMAT);
        endDateTime = ZonedDateTime.parse(createdOnFacetHandler.computeDateRange(facetData, facetInputs).get("endDateTime"),
                CreatedOnFacetHandler.DATE_TIME_FORMAT);

        assertEquals(startDateTime.getOffset().getTotalSeconds()/60, Integer.parseInt(stringValues.get(1)));
        assertEquals(endDateTime.getOffset().getTotalSeconds()/60, Integer.parseInt(stringValues.get(1)));
        assertEquals(1, getDurationInSeconds(startDateTime, endDateTime));
    }

    @Test
    public void testThisWeekDateRange() {
        stringValues = Arrays.asList("This Week", zoneOffset);
        facetData.setStringValues(stringValues);
        facetData.setRangeValues(rangeValues);

        dateRange = createdOnFacetHandler.computeDateRange(facetData, facetInputs);
        startDateTime = ZonedDateTime.parse(dateRange.get("startDateTime"), CreatedOnFacetHandler.DATE_TIME_FORMAT);
        endDateTime = ZonedDateTime.parse(dateRange.get("endDateTime"), CreatedOnFacetHandler.DATE_TIME_FORMAT);
        currentDateTime = LocalDate.now().atStartOfDay().atZone(zoneId);

        assertEquals(startDateTime.getOffset().getTotalSeconds()/60, Integer.parseInt(stringValues.get(1)));
        assertEquals(endDateTime.getOffset().getTotalSeconds()/60, Integer.parseInt(stringValues.get(1)));
        assertEquals(getDurationInSeconds(startDateTime, endDateTime), getDurationInSeconds(startDateTime, currentDateTime) + 1);
    }

    @Test
    public void testThisMonthDateRange() {
        stringValues = Arrays.asList("This Month", zoneOffset);
        facetData.setStringValues(stringValues);
        facetData.setRangeValues(rangeValues);

        dateRange = createdOnFacetHandler.computeDateRange(facetData, facetInputs);
        startDateTime = ZonedDateTime.parse(dateRange.get("startDateTime"), CreatedOnFacetHandler.DATE_TIME_FORMAT);
        endDateTime = ZonedDateTime.parse(dateRange.get("endDateTime"), CreatedOnFacetHandler.DATE_TIME_FORMAT);
        currentDateTime = LocalDate.now().atStartOfDay().atZone(zoneId);

        assertEquals(startDateTime.getOffset().getTotalSeconds()/60, Integer.parseInt(stringValues.get(1)));
        assertEquals(endDateTime.getOffset().getTotalSeconds()/60, Integer.parseInt(stringValues.get(1)));
        assertEquals(getDurationInSeconds(startDateTime, endDateTime), getDurationInSeconds(startDateTime, currentDateTime) + 1);
        assertEquals(getDurationInSeconds(startDateTime, endDateTime), currentDateTime.getDayOfMonth());
    }

    // try block test
    @Test
    public void testCustomDateRangeWithDateTimes() {
        String lowerBound = "2020-06-01T00:00:00-07:00";
        String upperBound = "2020-06-05T00:00:00-07:00";
        String expectedLowerBound = "2020-06-01T00:00:00-0700";
        String expectedUpperBound = "2020-06-06T00:00:00-0700";

        stringValues = Arrays.asList("Custom", zoneOffset);
        rangeValues.setLowerBound(lowerBound);
        rangeValues.setUpperBound(upperBound);
        facetData.setStringValues(stringValues);
        facetData.setRangeValues(rangeValues);

        dateRange = createdOnFacetHandler.computeDateRange(facetData, facetInputs);
        assertTrue(dateRange.get("startDateTime").equals(expectedLowerBound));
        assertTrue(dateRange.get("endDateTime").equals(expectedUpperBound));
    }

    // catch block test
    @Test
    public void testCustomDateRangeWithDates() {
        String lowerBound = "2020-06-01";
        String upperBound = "2020-06-05";
        String expectedLowerBound = "2020-06-01T00:00:00+0000";
        String expectedUpperBound = "2020-06-06T00:00:00+0000";

        stringValues = Arrays.asList("Custom", zoneOffset);
        rangeValues.setLowerBound(lowerBound);
        rangeValues.setUpperBound(upperBound);
        facetData.setStringValues(stringValues);
        facetData.setRangeValues(rangeValues);

        dateRange = createdOnFacetHandler.computeDateRange(facetData, facetInputs);
        assertTrue(dateRange.get("startDateTime").equals(expectedLowerBound));
        assertTrue(dateRange.get("endDateTime").equals(expectedUpperBound));
    }

    @Test
    public void testCustomDateRangeWithoutBoundaries() {
        stringValues = Arrays.asList("Custom", zoneOffset);
        facetData.setStringValues(stringValues);
        facetData.setRangeValues(rangeValues);

        assertThrows(DataHubException.class, () -> createdOnFacetHandler.computeDateRange(facetData, facetInputs));
    }

    private long getDurationInSeconds(ZonedDateTime start, ZonedDateTime end) {
        return Duration.between(start, end).dividedBy(Duration.ofDays(1).getSeconds()).getSeconds();
    }
}
