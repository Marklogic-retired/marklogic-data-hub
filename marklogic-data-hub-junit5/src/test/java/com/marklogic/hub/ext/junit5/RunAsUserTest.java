package com.marklogic.hub.ext.junit5;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RunAsUserTest extends AbstractDataHubTest {

    /**
     * Simple test for verifying that runAsUser works properly and does not lose any of the original config present
     * in the Spring Environment.
     */
    @Test
    void test() {
        getHubConfigManager().runAsUser("test-data-hub-operator", "password");
        assertEquals("test-data-hub-operator", getHubClient().getUsername());

        getHubConfigManager().runAsUser("test-data-hub-developer", "password");
        assertEquals("test-data-hub-developer", getHubClient().getUsername());
    }
}
