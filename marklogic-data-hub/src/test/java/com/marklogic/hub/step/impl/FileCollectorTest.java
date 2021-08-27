package com.marklogic.hub.step.impl;

import com.marklogic.hub.step.impl.FileCollector;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FileCollectorTest {

    private FileCollector collector;

    @Test
    void xmlFormat() {
        collector = new FileCollector("xml");
        yes("test.xml");
        yes("test.xhtml");
        yes("test.html");
        yes("test");
        no("test.json");
    }

    @Test
    void jsonFormat() {
        collector = new FileCollector("json");
        yes("test.json");
        yes("test");
        no("test.xml");
    }

    @Test
    void textFormat() {
        collector = new FileCollector("text");
        yes("test.txt");
        no("test");
        no("test.xml");
        no("test.json");
    }

    @Test
    void csvFormat() {
        collector = new FileCollector("csv");
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
        collector = new FileCollector("binary");
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
