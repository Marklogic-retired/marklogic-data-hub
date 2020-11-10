package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubClientConfig;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.impl.HubClientImpl;
import com.marklogic.hub.spark.sql.sources.v2.writer.HubDataSourceWriter;
import com.marklogic.hub.spark.sql.sources.v2.writer.HubDataWriter;
import com.marklogic.hub.test.AbstractHubClientTest;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.expressions.GenericInternalRow;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.Metadata;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.apache.spark.unsafe.types.UTF8String;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Base class for all connector tests.
 */
public abstract class AbstractSparkConnectorTest extends AbstractHubClientTest {

    protected final static StructType FRUIT_SCHEMA = new StructType(new StructField[]{
        new StructField("fruitName", DataTypes.StringType, true, Metadata.empty()),
        new StructField("fruitColor", DataTypes.StringType, true, Metadata.empty()),
    });

    protected final static String CUSTOM_INGESTION_API_PATH = "/custom-ingestion-endpoint/endpoint.api";
    protected final static String CUSTOM_INGESTION_ENDPOINT_PATH = "/custom-ingestion-endpoint/endpoint.sjs";

    protected HubDataWriter hubDataWriter;
    protected HubDataSourceWriter dataSourceWriter;
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

    protected Options newOptions() {
        return new Options(getHubPropertiesAsMap());
    }

    /**
     * @return a default set of fruit-specific options to simplify writing tests
     */
    protected Options newFruitOptions() {
        return newOptions().withCollections("fruits");
    }

    /**
     * @return all the URIs of docs in the 'fruits' collection, which assumes usage of newFruitOptions
     */
    protected String[] getFruitUris() {
        return getHubClient().getStagingClient().newServerEval()
            .javascript("cts.uris(null, null, cts.collectionQuery('fruits'))")
            .evalAs(String.class).split("\n");
    }

    protected int getFruitCount() {
        return Integer.parseInt(getHubClient().getStagingClient().newServerEval()
            .javascript("cts.estimate(cts.collectionQuery('fruits'))")
            .evalAs(String.class));
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
     */
    protected void initializeDataWriter(Options options) {
        initializeDataWriter(options.toDataSourceOptions());
    }

    /**
     * Spark will do all of this in the real world - i.e. a user will specify the entry class and the set of options.
     * But in a test, we need to do that ourselves. So we create the DataSource class, build up the params, and then
     * call the factory/writer methods ourselves.
     *
     * @param dataSourceOptions
     */
    protected void initializeDataWriter(DataSourceOptions dataSourceOptions) {
        initializeDataSourceWriter(dataSourceOptions);

        DataWriterFactory<InternalRow> dataWriterFactory = dataSourceWriter.createWriterFactory();

        final int partitionIdDoesntMatter = 0;
        final long taskId = 2;
        final int epochIdDoesntMatter = 0;
        this.hubDataWriter = (HubDataWriter)dataWriterFactory.createDataWriter(partitionIdDoesntMatter, taskId, epochIdDoesntMatter);
    }

    protected void initializeDataSourceWriter(DataSourceOptions dataSourceOptions) {
        DefaultSource dataSource = new DefaultSource();
        final String writeUUID = "doesntMatter";
        final SaveMode saveModeDoesntMatter = SaveMode.Overwrite;
        this.dataSourceWriter = (HubDataSourceWriter)dataSource.createWriter(writeUUID, FRUIT_SCHEMA, saveModeDoesntMatter, dataSourceOptions).get();
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

    protected WriterCommitMessage writeRows(GenericInternalRow... rows) {
        Arrays.stream(rows).forEach(row -> hubDataWriter.write(row));
        return hubDataWriter.commit();
    }

    protected WriterCommitMessage writeRowsAndCommitWithSourceWriter(GenericInternalRow... rows) {
        WriterCommitMessage message = writeRows(rows);
        dataSourceWriter.commit(new WriterCommitMessage[]{message});
        return message;
    }

    /**
     * Tests that need a custom ingestion endpoint can make use of this.
     */
    protected void installCustomIngestionEndpoint() {
        GenericDocumentManager mgr = getHubClient().getModulesClient().newDocumentManager();
        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE, DocumentMetadataHandle.Capability.EXECUTE);

        try {
            mgr.write(CUSTOM_INGESTION_API_PATH, metadata,
                new FileHandle(new ClassPathResource("custom-ingestion-endpoint/endpoint.api").getFile()).withFormat(Format.JSON));
            mgr.write(CUSTOM_INGESTION_ENDPOINT_PATH, metadata,
                new FileHandle(new ClassPathResource("custom-ingestion-endpoint/endpoint.sjs").getFile()).withFormat(Format.TEXT));
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    /**
     * Use then you know there's only a single job document.
     *
     * @return
     */
    protected JsonNode getJobDocument() {
        return getHubClient().getJobsClient().newServerEval()
            .javascript("fn.head(cts.search(cts.collectionQuery('Job')))")
            .evalAs(JsonNode.class);
    }

    /**
     * Convenience method for getting the status when you know there's only one job document.
     *
     * @return
     */
    protected String getJobDocumentStatus() {
        JsonNode job = getJobDocument();
        assertTrue(job.has("job"));
        assertTrue(job.get("job").has("jobStatus"));
        return job.get("job").get("jobStatus").asText();
    }

    protected boolean canUpdateJobDoc(){
      MarkLogicVersion version = new MarkLogicVersion(getHubClient().getManageClient());
      return version.getMajor().equals(9) ? false : true;
    }

    protected void verifyJobDocumentWasNotUpdated(String status){
        assertEquals("started", status, "Status will remain 'started' as calling amped sjs function fails in 9.0-x server");
    }
}
