package org.example;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;

import java.io.File;

/**
 * Simple test program for verifying that the connector shadowJar works correctly within Spark. This is intended only
 * for manual ad hoc testing. The options for the connector default to a local DHF instance; customize those as needed.
 */
public class WriteCustomersToStaging extends ExampleSupport {

    public static void main(String[] args) {
        new WriteCustomersToStaging(args);
    }

    public WriteCustomersToStaging(String[] args) {
        setConnectionProperties(args);
        SparkSession sparkSession = newSparkSession();
        try {
            writeRowsToStaging(loadRowsFromTestFile(newSparkSession()));
        } finally {
            logger.info("Closing SparkSession");
            sparkSession.close();
        }
    }

    private Dataset<Row> loadRowsFromTestFile(SparkSession sparkSession) {
        final String filePath = getTestFilePath();
        logger.info("Loading from file: " + filePath);
        Dataset<org.apache.spark.sql.Row> rows = sparkSession.read().option("header", true).csv(getTestFilePath());
        logger.info("Number of rows loaded: " + rows.count());
        return rows;
    }

    /**
     * Customize the options in here as needed for ad hoc testing.
     *
     * @param rows
     */
    private void writeRowsToStaging(Dataset<Row> rows) {
        rows.write()
            .format("com.marklogic.hub.spark.sql.sources.v2")
            .option("mlHost", host)
            .option("mlUsername", username)
            .option("mlPassword", password)
            .option("uriTemplate", "/SparkCustomer/{CustomerID}.json")
            .option("collections", "sparkCustomer,sparkData")
            .option("permissions", "data-hub-common,read,data-hub-common,update")
            .option("hubDhs", "false")
            .option("hubSsl", "false")
            .save();
    }
}

