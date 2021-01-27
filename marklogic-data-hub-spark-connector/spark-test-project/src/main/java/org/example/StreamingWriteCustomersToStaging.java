package org.example;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.streaming.StreamingQuery;
import org.apache.spark.sql.streaming.StreamingQueryException;
import org.apache.spark.sql.types.StructType;

public class StreamingWriteCustomersToStaging extends ExampleSupport {

    public static void main(String[] args) {
        new StreamingWriteCustomersToStaging(args);
    }

    public StreamingWriteCustomersToStaging(String[] args) {
        setConnectionProperties(args);

        SparkSession session = newSparkSession();
        try {
            writeRowsToDataHub(loadRowsFromTestFile(session));
        } finally {
            logger.info("Closing SparkSession");
            session.close();
        }
    }

    /**
     * Demonstrates streaming from a CSV file via Spark. The schema - StructType - is determined first, and then
     * readStream() is used to open a stream on the directory containing the CSV file.
     *
     * @param sparkSession
     * @return
     */
    private Dataset<Row> loadRowsFromTestFile(SparkSession sparkSession) {
        final String filePath = getTestFilePath();
        logger.info("Loading from file: " + filePath);
        StructType structType = sparkSession.read().option("header", true).csv(getTestFilePath()).schema();
        logger.info("Schema of the input file is: " + structType);
        Dataset<org.apache.spark.sql.Row> rows = sparkSession.readStream().schema(structType).format("csv").option("header", true).csv("src/main/resources/data");
        return rows;
    }

    /**
     * Customize the options in here as needed for ad hoc testing.
     *
     * @param rows
     */
    private void writeRowsToDataHub(Dataset<Row> rows) {
        StreamingQuery streamingQuery = rows.writeStream()
            .format("com.marklogic.hub.spark.sql.sources.v2")
            .option("mlHost", host)
            .option("mlUsername", username)
            .option("mlPassword", password)
            .option("uriPrefix", "/StreamingTest/Customer/")
            .option("collections", "sparkCustomer,streamingTest")
            .option("permissions", "data-hub-common,read,data-hub-common,update")
            .option("hubDhs", "false")
            .option("batchSize", "3")
            .option("checkpointLocation", "build/checkpoints/" + System.currentTimeMillis())
            .start();

        final long timeToWait = 3000;
        try {
            streamingQuery.awaitTermination(timeToWait);
        } catch (StreamingQueryException e) {
            throw new RuntimeException(e);
        }
    }
}
