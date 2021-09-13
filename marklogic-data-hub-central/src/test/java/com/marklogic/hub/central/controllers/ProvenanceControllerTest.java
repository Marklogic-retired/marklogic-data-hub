package com.marklogic.hub.central.controllers;

import com.marklogic.hub.central.AbstractMvcTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ProvenanceControllerTest extends AbstractMvcTest {

    /**
     * This is just a smoke test to verify we get a response; the real tests are ML unit tests.
     */
    @Test
    void testGetProvenanceGraph() throws Exception {
        loginAsTestUserWithRoles("hub-central-developer");
        getJson("/api/provenance/getProvenanceGraph?documentURI=Customer1.json").andExpect(status().isOk());
    }
}
