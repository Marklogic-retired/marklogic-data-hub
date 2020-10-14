package com.marklogic.hub.spark.sql.sources.v2;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubClientConfig;
import com.marklogic.hub.impl.HubClientImpl;
import com.marklogic.hub.test.AbstractHubClientTest;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.expressions.GenericInternalRow;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.writer.DataSourceWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.Metadata;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.apache.spark.unsafe.types.UTF8String;
import org.junit.jupiter.api.BeforeEach;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Base class for all connector tests.
 */
public abstract class AbstractSparkConnectorTest extends AbstractHubClientTest {

    protected final static StructType FRUIT_SCHEMA = new StructType(new StructField[]{
        new StructField("fruitName", DataTypes.StringType, true, Metadata.empty()),
        new StructField("fruitColor", DataTypes.StringType, true, Metadata.empty()),
    });
    protected Optional<DataSourceWriter> dataSourceWriter;
    private HubClientConfig hubClientConfig;
    private HubClient hubClient;
    private Properties testProperties;

    /**
     * Reset the databases, then run every test by default as a data-hub-operator. Ernie the ETL engineer will typically
     * have this role.
     */
    @BeforeEach
    void beforeEachTest() {
        hubClientConfig = new HubClientConfig();
        resetDatabases();
        runAsDataHubOperator();
    }

    @Override
    protected HubClient getHubClient() {
        if (hubClient == null) {
            hubClient = new HubClientImpl(hubClientConfig);
        }
        return hubClient;
    }

    @Override
    protected HubClient runAsUser(String username, String password) {
        testProperties = new Properties();
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
        testProperties.setProperty("mlHost", mlHost);
        testProperties.setProperty("mlUsername", username);
        testProperties.setProperty("mlPassword", password);
        testProperties.setProperty("hubDHS", hubDhs);
        testProperties.setProperty("hubSsl", hubSsl);
        hubClient = new HubClientImpl(new HubClientConfig(testProperties));
        return hubClient;
    }

    /**
     * Convert the set of properties used to initialize HubConfigImpl into a map of parameters that can be easil reused
     * with our Spark classes.
     *
     * @return
     */
    protected Map<String, String> getHubPropertiesAsMap() {
        Map<String, String> params = new HashMap<>();
        testProperties.keySet().forEach(key -> params.put((String) key, testProperties.getProperty((String) key)));
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
     * @return Document Metadata
     */
    protected DocumentMetadataHandle getFirstFruitMetadata() {
        String[] uris = getFruitUris();
        assertTrue(uris.length > 0, "Expected at least one fruit URI, found zero");
        return getHubClient().getStagingClient().newDocumentManager().readMetadata(uris[0], new DocumentMetadataHandle());
    }

    /**
     * Convenience method for building a DataWriter based on our Options convenience class.
     *
     * @param options
     * @return
     */
    protected DataWriter<InternalRow> buildDataWriter(Options options) {
        return buildDataWriter(options.toDataSourceOptions());
    }

    /**
     * Spark will do all of this in the real world - i.e. a user will specify the entry class and the set of options.
     * But in a test, we need to do that ourselves. So we create the DataSource class, build up the params, and then
     * call the factory/writer methods ourselves.
     *
     * @param dataSourceOptions
     * @return
     */
    protected DataWriter<InternalRow> buildDataWriter(DataSourceOptions dataSourceOptions) {
        DefaultSource dataSource = new DefaultSource();
        final String writeUUID = "doesntMatter";
        final SaveMode saveModeDoesntMatter = SaveMode.Overwrite;

        dataSourceWriter = dataSource.createWriter(writeUUID, FRUIT_SCHEMA, saveModeDoesntMatter, dataSourceOptions);
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
