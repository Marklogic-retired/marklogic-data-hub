package org.example;

import org.apache.spark.SparkConf;
import org.apache.spark.sql.SparkSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

public abstract class ExampleSupport {

    protected Logger logger = LoggerFactory.getLogger(getClass());

    protected String host;
    protected String username;
    protected String password;

    protected void setConnectionProperties(String[] args) {
        if (args.length != 3) {
            throw new RuntimeException("Requires 3 args - host, username, and password");
        } else {
            host = args[0];
            username = args[1];
            password = args[2];
            logger.info(String.format("Will write to '%s' as user '%s'", host, username));
        }
    }

    protected SparkSession newSparkSession() {
        logger.info("Creating SparkSession");
        SparkConf conf = new SparkConf().set("spark.driver.bindAddress", "127.0.0.1");
        return SparkSession.builder()
            .config(conf).appName("ExampleAppName")
            // The brackets specify the number of cores to use; "*" defaults to the number of cores available
            .master("local[*]")
            .getOrCreate();
    }

    /**
     * Depending on how this program is run - e.g. via Gradle or an IDE - the path will resolve to either this project
     * directory or the root DHF project directory. So gotta support both.
     *
     * @return
     */
    protected String getTestFilePath() {
        String filePath = "src/main/resources/data/customers.csv";
        if (new File(filePath).exists()) {
            return new File(filePath).getAbsolutePath();
        }
        return new File("marklogic-data-hub-spark-connector/spark-test-project/" + filePath).getAbsolutePath();
    }
}
