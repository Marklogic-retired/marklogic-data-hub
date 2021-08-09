package com.marklogic.hub.central.entities.search.models;

import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CalculateSearchCriteriaTest {

    DocSearchQueryInfo info = new DocSearchQueryInfo();

    @Test
    void noUserInput() {
        assertEquals("hideHubArtifacts:true", calculate(), "hub artifacts are excluded by default");
    }

    @Test
    void entityTypeNoUserSearchText() {
        info.setEntityTypeIds(Arrays.asList("A", "", null, "B", null));
        assertEquals("entityType:\"A,B\" hideHubArtifacts:true", calculate());
    }

    @Test
    void entityTypeWithUserSearchText() {
        info.setSearchText("hello world");
        info.setEntityTypeIds(Arrays.asList("A", "", null, "B", null));
        assertEquals("hello world entityType:\"A,B\" hideHubArtifacts:true", calculate());
    }

    @Test
    void dontHideHubArtifacts() {
        info.setSearchText("hi   ");
        info.setHideHubArtifacts(false);
        assertEquals("hi", calculate(), "hideHubArtifacts should be omitted when set to false");
    }

    @Test
    void nullSearchText() {
        info.setSearchText(null);
        info.setEntityTypeIds(Arrays.asList("A", "B"));
        assertEquals("entityType:\"A,B\" hideHubArtifacts:true", calculate());
    }

    @Test
    void emptySearchText() {
        info.setSearchText(" ");
        info.setEntityTypeIds(Arrays.asList("A"));
        assertEquals("entityType:\"A\" hideHubArtifacts:true", calculate());
    }

    private String calculate() {
        return info.calculateSearchCriteria();
    }
}
