package com.marklogic.hub.spark.sql.sources.v2;

import com.marklogic.hub.HubClient;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.test.AbstractHubTest;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.expressions.GenericInternalRow;
import org.apache.spark.sql.sources.v2.writer.DataSourceWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.Metadata;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.apache.spark.unsafe.types.UTF8String;
import org.junit.jupiter.api.BeforeEach;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

/**
 * Base class for all glue-connector tests.
 */
public abstract class AbstractSparkConnectorTest extends AbstractHubTest {

    protected final static StructType FRUIT_SCHEMA = new StructType(new StructField[]{
        new StructField("fruitName", DataTypes.StringType, true, Metadata.empty()),
        new StructField("fruitColor", DataTypes.StringType, true, Metadata.empty()),
    });

    private HubConfigImpl hubConfig;
    private HubClient hubClient;
    private Properties hubProperties;

    /**
     * Reset the databases, then run every test by default as a data-hub-operator. Ernie the ETL engineer will typically
     * have this role.
     */
    @BeforeEach
    void beforeEachTest() {
        hubConfig = new HubConfigImpl();
        resetDatabases();
        runAsDataHubOperator();
    }

    @Override
    protected HubClient getHubClient() {
        if (hubClient == null) {
            hubClient = hubConfig.newHubClient();
        }
        return hubClient;
    }

    @Override
    protected HubConfigImpl getHubConfig() {
        return hubConfig;
    }

    @Override
    protected File getTestProjectDirectory() {
        // We don't have any need for a HubProject within the connector
        return null;
    }

    @Override
    protected HubConfigImpl runAsUser(String username, String password) {
        hubProperties = new Properties();
        String mlHost = "localhost";
        String hubDhs = "false";
        String hubSsl = "false";
        boolean isDhs = false;
        //Can override if we want to run tests on DHS
        if (System.getProperty("mlHost") != null) {
            mlHost = System.getProperty("mlHost");
        }
        if (System.getProperty("isDhs") != null) {
            isDhs = Boolean.parseBoolean(System.getProperty("isDhs"));
        }
        if (isDhs) {
            hubDhs = "true";
            hubSsl = "true";
        }
        hubProperties.setProperty("mlHost", mlHost);
        hubProperties.setProperty("mlUsername", username);
        hubProperties.setProperty("mlPassword", password);
        hubProperties.setProperty("hubDHS", hubDhs);
        hubProperties.setProperty("hubSsl", hubSsl);
        this.hubConfig = HubConfigImpl.withProperties(hubProperties);
        return hubConfig;
    }

    /**
     * Convert the set of properties used to initialize HubConfigImpl into a map of parameters that can be easil reused
     * with our Spark classes.
     *
     * @return
     */
    protected Map<String, String> getHubPropertiesAsMap() {
        Map<String, String> params = new HashMap<>();
        hubProperties.keySet().forEach(key -> params.put((String) key, hubProperties.getProperty((String) key)));
        return params;
    }

    /**
     * @return a default set of fruit-specific options to simplify writing tests. Uses a batch size of 1 so that there's
     * no need for tests to call commit by default.
     */
    protected Options newFruitOptions() {
        return new Options(getHubPropertiesAsMap()).withBatchSize(1).withCollections("fruits");
    }

    /**
     * @return all the URIs of docs in the 'fruits' collection, which assumes usage of newFruitOptions
     */
    protected String[] getFruitUris() {
        return getHubClient().getStagingClient().newServerEval()
            .javascript("cts.uris(null, null, cts.collectionQuery('fruits'))")
            .evalAs(String.class).split("\n");
    }

    /**
     * Spark will do all of this in the real world - i.e. a user will specify the entry class and the set of options.
     * But in a test, we need to do that ourselves. So we create the DataSource class, build up the params, and then
     * call the factory/writer methods ourselves.
     *
     * @param options
     * @return
     */
    protected DataWriter<InternalRow> buildDataWriter(Options options) {
        HubDataSource dataSource = new HubDataSource();
        final String writeUUID = "doesntMatter";
        final SaveMode saveModeDoesntMatter = SaveMode.Overwrite;

        // Get the set of DHF properties used to connect to ML as a map, and then add connector-specific params

        Optional<DataSourceWriter> dataSourceWriter = dataSource.createWriter(writeUUID, FRUIT_SCHEMA, saveModeDoesntMatter, options.toDataSourceOptions());
        DataWriterFactory<InternalRow> dataWriterFactory = dataSourceWriter.get().createWriterFactory();

        final int partitionIdDoesntMatter = 0;
        final long taskId = 2;
        final int epochIdDoesntMatter = 0;
        return dataWriterFactory.createDataWriter(partitionIdDoesntMatter, taskId, epochIdDoesntMatter);
    }

    /**
     * @param values
     * @return a row that can be ingested via HubDataWriter for testing purposes
     */
    protected GenericInternalRow buildRow(String... values) {
        Object[] rowValues = new Object[values.length];
        for (int i = 0; i < values.length; i++) {
            rowValues[i] = UTF8String.fromString(values[i]);
        }
        return new GenericInternalRow(rowValues);
    }
}
