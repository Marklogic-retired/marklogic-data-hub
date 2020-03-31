package com.marklogic.hub.oneui;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Spring bean for both accessing properties defined in src/test/resources/application-test.properties and for defining
 * constants. The various username/password pairs are considered constants because they are hardcoded by the DH core
 * Installer program. Their values are then duplicated here.
 */
@Component
public class TestConfig {

    @Value("${test.mlHost:localhost}")
    public String host;

    public String dataHubDeveloperUsername = "test-data-hub-developer";
    public String dataHubDeveloperPassword = "password";

    public String dataHubEnvironmentManagerUsername = "test-data-hub-environment-manager";
    public String dataHubEnvironmentManagerPassword = "password";

    public String adminUsername = "test-admin-for-data-hub-tests";
    public String adminPassword = "password";

    public String dataHubOperatorUsername = "test-data-hub-operator";
}
