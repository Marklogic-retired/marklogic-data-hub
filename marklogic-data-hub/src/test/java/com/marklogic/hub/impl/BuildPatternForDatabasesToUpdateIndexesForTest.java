package com.marklogic.hub.impl;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class BuildPatternForDatabasesToUpdateIndexesForTest {

    DataHubImpl dataHub = new DataHubImpl();

    @Test
    public void test() {
        assertTrue(matches("staging-database.json"));
        assertTrue(matches("final-database.json"));
        assertTrue(matches("job-database.json"));

        assertFalse(matches("schema-database.json"));
        assertFalse(matches("triggers-database.json"));
        assertFalse(matches("final-schemas-database.json"));
        assertFalse(matches("final-triggers-database.json"));
        assertFalse(matches("modules-database.json"));
        assertFalse(matches("staging-schemas-database.json"));
        assertFalse(matches("staging-triggers-database.json"));
    }

    private boolean matches(String filename) {
        return dataHub.buildPatternForDatabasesToUpdateIndexesFor().matcher(filename).matches();
    }
}
