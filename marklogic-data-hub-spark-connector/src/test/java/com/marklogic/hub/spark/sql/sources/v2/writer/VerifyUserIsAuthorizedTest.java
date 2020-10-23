package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class VerifyUserIsAuthorizedTest extends AbstractSparkConnectorTest {

    @Test
    void validCredentials() {
        initializeDataSourceWriter(new Options(getHubPropertiesAsMap()).toDataSourceOptions());
        logger.info("The lack of an exception indicates that the user was authorized when checking the connection to ML");
    }

    @Test
    void invalidCredentials() {
        Map<String, String> props = getHubPropertiesAsMap();
        props.put("mlUsername", "unknown-user");
        props.put("mlPassword", "bad-password");

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> initializeDataSourceWriter(new Options(props).toDataSourceOptions()));

        assertEquals("User is unauthorized; please ensure you have the correct username and password for a MarkLogic user that has at least the data-hub-operator role",
            ex.getMessage());
    }
}
