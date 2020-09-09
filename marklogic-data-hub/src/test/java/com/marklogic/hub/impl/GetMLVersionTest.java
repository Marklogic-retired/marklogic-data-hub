package com.marklogic.hub.impl;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class GetMLVersionTest {

    @Test
    void nightly9() {
        Versions.MarkLogicVersion version = new Versions().getMLVersion("9.0-20200909");
        assertTrue(version.isNightly());
        assertEquals("2020-09-09", version.getDateString());
        assertEquals(9, version.getMajor());
    }

    @Test
    void nightly10() {
        Versions.MarkLogicVersion version = new Versions().getMLVersion("10.0-20200909");
        assertTrue(version.isNightly());
        assertEquals("2020-09-09", version.getDateString());
        assertEquals(10, version.getMajor());
    }
}
