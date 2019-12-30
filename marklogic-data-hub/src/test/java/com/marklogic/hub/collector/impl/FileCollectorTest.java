package com.marklogic.hub.collector.impl;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FileCollectorTest {

    private FileCollector collector;

    @Test
    void xmlFormat() {
        collector = new FileCollector(null, "xml");
        yes("test.xml");
        yes("test.xhtml");
        yes("test.html");
        no("test.json");
        no("test");
    }

    @Test
    void jsonFormat() {
        collector = new FileCollector(null, "json");
        yes("test.json");
        no("test.xml");
        no("test");
    }

    @Test
    void textFormat() {
        collector = new FileCollector(null, "text");
        yes("test.txt");
        no("test.xml");
        no("test.json");
        no("test");
    }

    @Test
    void csvFormat() {
        collector = new FileCollector(null, "csv");
        yes("test.csv");
        yes("test.psv");
        yes("test.tsv");
        yes("test.txt");
        no("test.xml");
        no("test.json");
        no("test");
    }

    @Test
    void binaryFormat() {
        collector = new FileCollector(null, "binary");
        yes("test");
        no("test.xml");
        no("test.xhtml");
        no("test.html");
        no("test.json");
        no("test.csv");
        no("test.txt");
        no("test.psv");
    }

    void yes(String filename) {
        assertTrue(collector.acceptFile(filename));
    }

    void no(String filename) {
        assertFalse(collector.acceptFile(filename));
    }
}
