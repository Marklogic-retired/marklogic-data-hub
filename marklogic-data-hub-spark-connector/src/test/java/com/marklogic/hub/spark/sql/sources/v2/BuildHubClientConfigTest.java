package com.marklogic.hub.spark.sql.sources.v2;

import com.marklogic.hub.HubClientConfig;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class BuildHubClientConfigTest {

    private Map<String, String> options = new HashMap<>();

    @Test
    void defaults() {
        HubClientConfig config = Util.buildHubClientConfig(options);
        verifyAuth(config, "basic", "Should default to basic auth for DHS usage");

        final String sslMessage = "Should default to SSL for DHS usage";
        assertNotNull(config.getStagingSslContext(), sslMessage);
        assertNotNull(config.getStagingSslHostnameVerifier(), sslMessage);
        assertNotNull(config.getStagingTrustManager(), sslMessage);
        assertNotNull(config.getFinalSslContext(), sslMessage);
        assertNotNull(config.getFinalSslHostnameVerifier(), sslMessage);
        assertNotNull(config.getFinalTrustManager(), sslMessage);
        assertNotNull(config.getJobSslContext(), sslMessage);
        assertNotNull(config.getJobSslHostnameVerifier(), sslMessage);
        assertNotNull(config.getJobTrustManager(), sslMessage);
    }

    /**
     * Note that we don't need to test hubDhs/hubSsl, nor can we test those, as Spark will always lowercase everything
     * that is in the options map.
     */
    @Test
    void digestAndNoSsl() {
        options.put("hubdhs", "false");
        options.put("hubssl", "false");

        HubClientConfig config = Util.buildHubClientConfig(options);
        verifyAuth(config, "digest", "Should default to digest since hubDhs is false");

        final String sslMessage = "Should default to no SSL when hubSsl is false";
        assertNull(config.getStagingSslContext(), sslMessage);
        assertNull(config.getStagingSslHostnameVerifier(), sslMessage);
        assertNull(config.getStagingTrustManager(), sslMessage);
        assertNull(config.getFinalSslContext(), sslMessage);
        assertNull(config.getFinalSslHostnameVerifier(), sslMessage);
        assertNull(config.getFinalTrustManager(), sslMessage);
        assertNull(config.getJobSslContext(), sslMessage);
        assertNull(config.getJobSslHostnameVerifier(), sslMessage);
        assertNull(config.getJobTrustManager(), sslMessage);
    }

    private void verifyAuth(HubClientConfig config, String auth, String message) {
        assertEquals(auth, config.getFinalAuthMethod(), message);
        assertEquals(auth, config.getJobAuthMethod(), message);
        assertEquals(auth, config.getStagingAuthMethod(), message);
    }
}
