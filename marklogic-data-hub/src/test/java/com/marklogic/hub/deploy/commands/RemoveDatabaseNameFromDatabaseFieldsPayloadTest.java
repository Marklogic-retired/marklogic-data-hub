package com.marklogic.hub.deploy.commands;

import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RemoveDatabaseNameFromDatabaseFieldsPayloadTest {

    @Test
    void test() {
        String xml = "<database-properties xmlns=\"http://marklogic.com/manage\">\n" +
            "  <database-name>data-hub-JOBS</database-name>\n" +
            "  <triple-index>true</triple-index>\n" +
            "</database-properties>";

        Fragment frag = new Fragment(xml);
        assertTrue(frag.elementExists("/node()/m:database-name"));
        assertEquals("true", frag.getElementValue("/node()/m:triple-index"));

        xml = new DeployDatabaseFieldCommand.HubDatabaseManager(null).removeDatabaseNameFromXmlPayload(xml);
        frag = new Fragment(xml);
        assertFalse(frag.elementExists("/node()/m:database-name"));
        assertEquals("true", frag.getElementValue("/node()/m:triple-index"));
    }
}
