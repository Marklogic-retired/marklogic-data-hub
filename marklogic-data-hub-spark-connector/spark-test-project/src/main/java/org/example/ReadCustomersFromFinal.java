package org.example;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SQLContext;
import org.apache.spark.sql.SparkSession;

public class ReadCustomersFromFinal extends ExampleSupport {

    public static void main(String[] args) {
        new ReadCustomersFromFinal(args);
    }

    public ReadCustomersFromFinal(String[] args) {
        setConnectionProperties(args);
        SparkSession session = newSparkSession();
        SQLContext sqlContext = new SQLContext(session);

        Dataset<Row> rows = sqlContext.read()
            // Specify the package of the DH Spark connector so Spark uses our DataReader
            .format("com.marklogic.hub.spark.sql.sources.v2")

            // Connection properties
            .option("mlHost", host)
            .option("mlUsername", username)
            .option("mlPassword", password)
            .option("hubDhs", "false")
            .option("hubSsl", "false")

            // Query properties
            .option("view", "Customer")
            .option("schema", "Customer") // optional
            .option("sqlCondition", "customerId > 200") // optional
            .load() // does not actually load the data, but creates the Dataset
            .cache(); // forces the data to be loaded and stored in memory

        long rowCount = rows.count();
        logger.info("Total row count: " + rowCount);

        // Print the first 10 rows
        Row[] rowArray = (Row[]) rows.collect();
        for (int i = 0; i < 10; i++) {
            if (i < rowCount) {
                logger.info("Row: " + rowArray[i]);
            }
        }

        session.close();
    }
}
