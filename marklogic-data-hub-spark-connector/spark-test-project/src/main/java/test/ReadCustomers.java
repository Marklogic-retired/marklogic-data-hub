package test;

import org.apache.spark.SparkConf;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SQLContext;
import org.apache.spark.sql.SparkSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This test is intended to be run against the examples/reference-entity-model project. You can load as many Customers
 * as you want into the final database and test it against that.
 * <p>
 * The logging will show each row - you may want to comment that out in case you're DHF instance has a large number of
 * rows.
 */
public class ReadCustomers {

    private static Logger logger = LoggerFactory.getLogger(ReadCustomers.class);

    public static void main(String[] args) {
        SparkConf conf = new SparkConf()
            .set("spark.driver.bindAddress", "127.0.0.1");

        SparkSession session = SparkSession.builder()
            .config(conf).appName("TestAppName")
            // The brackets specify the number of cores to use; "*" defaults to the number of cores available
            .master("local[*]")
            .getOrCreate();

        SQLContext sqlContext = new SQLContext(session);

        Dataset<Row> rows = sqlContext.read()
            // Specify the package of the DH Spark connector so Spark uses our DataReader
            .format("com.marklogic.hub.spark.sql.sources.v2")

            // Connection properties
            .option("mlHost", "localhost")
            .option("mlUsername", "hub-operator")
            .option("mlPassword", "password")
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

        // Print the first up to 10 rows (and have to cast this for unknown reason)
        Row[] rowArray = (Row[])rows.collect();
        for (int i = 0; i < 10; i++) {
            if (i < rowCount) {
                logger.info("Row: " + rowArray[i]);
            }
        }

        session.close();
    }
}
