package test;

import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * Simple test program for verifying that the connector shadowJar works correctly within Spark. This is intended only
 * for manual ad hoc testing. The options for the connector default to a local DHF instance; customize those as needed.
 */
public class WriteTest {

    private static Logger logger = LoggerFactory.getLogger(WriteTest.class);

    private static String host = "localhost";
    private static String username = "test-data-hub-operator";
    private static String password = "password";

    public static void main(String[] args) {
        setConnectionProperties(args);

        logger.info("Creating SparkSession");
        SparkSession sparkSession = SparkSession.builder()
            .master("local")
            .getOrCreate();

        try {
            writeRowsToDataHub(loadRowsFromTestFile(sparkSession));
        } finally {
            logger.info("Closing SparkSession");
            sparkSession.close();
        }
    }

    private static void setConnectionProperties(String[] args) {
        if (args.length != 3) {
            logger.info("Defaulting to host=localhost and username=test-data-hub-operator");
        } else {
            host = args[0];
            username = args[1];
            password = args[2];
            logger.info(String.format("Will write to '%s' as user '%s'", host, username));
        }
    }

    private static Dataset<Row> loadRowsFromTestFile(SparkSession sparkSession) {
        final String filePath = getTestFilePath();
        logger.info("Loading from file: " + filePath);
        Dataset<org.apache.spark.sql.Row> rows = sparkSession.read().option("header", true).csv(getTestFilePath());
        logger.info("Number of rows loaded: " + rows.count());
        return rows;
    }

    /**
     * Depending on how this program is run - e.g. via Gradle or an IDE - the path will resolve to either this project
     * directory or the root DHF project directory. So gotta support both.
     *
     * @return
     */
    private static String getTestFilePath() {
        String filePath = "src/main/resources/data/databook.csv";
        if (new File(filePath).exists()) {
            return new File(filePath).getAbsolutePath();
        }
        return new File("marklogic-data-hub-spark-connector/spark-test-project/" + filePath).getAbsolutePath();
    }

    /**
     * Customize the options in here as needed for ad hoc testing.
     *
     * @param rows
     */
    private static void writeRowsToDataHub(Dataset<Row> rows) {
        rows.write()
            .format("com.marklogic.hub.spark.sql.sources.v2")
            .option("mlHost", host)
            .option("mlUsername", username)
            .option("mlPassword", password)
            .option("uriPrefix", "/SparkTest")
            .option("collections", "sparkTestOne,sparkTestTwo")
            .option("hubDhs", "false")
            .option("hubSsl", "false")
            .save();
    }
}

