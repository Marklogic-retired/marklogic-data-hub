package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class BuildHubConfigTest {

    private Map<String, String> options = new HashMap<>();

    @Test
    void defaults() {
        HubConfigImpl hubConfig = HubDataWriterFactory.buildHubConfig(options);
        Stream.of(DatabaseKind.FINAL, DatabaseKind.STAGING, DatabaseKind.JOB).forEach(kind -> {
            assertEquals("basic", hubConfig.getAuthMethod(kind), "Should default to basic auth for DHS usage");
            assertNotNull(hubConfig.getSslContext(kind), "Should default to SSL for DHS usage");
            assertNotNull(hubConfig.getTrustManager(kind), "Should default to SSL for DHS usage");
            assertNotNull(hubConfig.getSslHostnameVerifier(kind), "Should default to SSL for DHS usage");
        });
    }

    /**
     * Note that we don't need to test hubDhs/hubSsl, nor can we test those, as Spark will always lowercase everything
     * that is in the options map.
     */
    @Test
    void digestAndNoSsl() {
        options.put("hubdhs", "false");
        options.put("hubssl", "false");

        HubConfigImpl hubConfig = HubDataWriterFactory.buildHubConfig(options);
        Stream.of(DatabaseKind.FINAL, DatabaseKind.STAGING, DatabaseKind.JOB).forEach(kind -> {
            assertEquals("digest", hubConfig.getAuthMethod(kind), "Should default to digest since hubDhs is false");
            assertNull(hubConfig.getSslContext(kind));
            assertNull(hubConfig.getTrustManager(kind));
            assertNull(hubConfig.getSslHostnameVerifier(kind));
        });
    }
}
