package com.marklogic.hub;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Adding this so that a class can subclass HubTestBase without having to define the same two Spring annotations
 * over and over. Plan is to move a lot of classes to under this so they don't duplicate the annotations.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public abstract class AbstractHubCoreTest extends HubTestBase {

    /**
     * Before each test, reset the project - clear the databases of everything except hub core artifacts - and then
     * delete and initialize a hub project. Then, run tests as a data-hub-developer by default, although each test
     * that extends this class should be sure to use the least privileged user possible. data-hub-developer is chosen
     * here, as the legacy flow-developer role has the manage-admin role which is not a typical role for a Data Hub
     * user to have.
     */
    @BeforeEach
    void beforeEachHubTest() {
        resetHubProject();
        runAsDataHubDeveloper();
    }
}
