package com.marklogic.hub.spark.sql.sources.v2.reader;

/**
 * Main purpose is to allow for the JUnit tests to provide a test-specific implementation for configuring the number
 * of partitions used by HubDataSourceReader.
 */
public interface PartitionCountProvider {

    int getPartitionCount();

}
