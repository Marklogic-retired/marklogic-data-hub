package com.marklogic.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.test.HubCoreTestConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Base class for all DHF core tests.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = HubCoreTestConfig.class)
public abstract class AbstractHubCoreTest extends HubTestBase {

    /**
     * Before each test, reset the project - clear the databases of everything except hub core artifacts - and then
     * delete and initialize a hub project. Then, run tests as a data-hub-developer by default, although each test
     * that extends this class should be sure to use the least privileged user possible. data-hub-developer is chosen
     * here, as the legacy flow-developer role has the manage-admin role which is not a typical role for a Data Hub
     * user to have.
     */
    @BeforeEach
    protected void beforeEachHubCoreTest() {
        resetHubProject();
        runAsDataHubDeveloper();
    }

    protected DocumentMetadataHelper getMetadata(DatabaseClient client, String uri) {
        return new DocumentMetadataHelper(
            uri,
            client.newDocumentManager().readMetadata(uri, new DocumentMetadataHandle())
        );
    }
}
