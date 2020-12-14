package com.marklogic.hub.impl;

import com.marklogic.hub.test.TestObject;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UpgradeFinalDatabaseXmlFileTest extends TestObject {

    private Fragment props;

    /**
     * In this scenario, we assume that fields, range-field-indexes, and range-path-indexes all exist, because they
     * all existed when this file was first added to the user's project in 5.2.0. If they don't exist, that means the
     * user has broken DHF, as DHF assumes that these indexes all exist. In such a scenario, the upgrade process will
     * throw an error, and the fix will be for the user to restore the final-database.xml file back to its original
     * form.
     */
    @Test
    void upgradeFrom520() {
        upgradeFrom(readStringFromClasspath("final-database-xml-files/version-5.2.0.xml"));
        verify540ChangesAreApplied(props);
    }

    /**
     * 5.4.0 adds a path-namespace, but a user may have already added path-namespaces to the file. So need to make sure
     * the ES one is still added and the user's addition is not lost.
     */
    @Test
    void upgradeFrom520WithCustomPathNamespaces() {
        upgradeFrom(readStringFromClasspath("final-database-xml-files/version-5.2.0-with-path-namespaces.xml"));
        verify540ChangesAreApplied(props);
        assertNotNull(props.getElements("/m:database-properties/m:path-namespaces/m:path-namespace" +
                "[m:prefix = 'test' and m:namespace-uri = 'http://example.org']").get(0),
            "The user's custom namespace should still be there");
    }

    /**
     * Tests the scenario where the project is already 5.4.0, and this operation is then applied - we just want to make
     * sure nothing blows up and the 540 changes are still in place.
     */
    @Test
    void upgrade540() {
        upgradeFrom(readStringFromClasspath("ml-config/database-fields/final-database.xml"));
        verify540ChangesAreApplied(props);
    }

    private void upgradeFrom(String fileContents) {
        String xml = new FinalDatabaseXmlFileUpgrader().updateFinalDatabaseXmlFile(fileContents);
        this.props = new Fragment(xml);
    }

    /**
     * Public and static so other tests can reuse it.
     *
     * @param props
     */
    public static void verify540ChangesAreApplied(Fragment props) {
        assertNotNull(props.getElements(FinalDatabaseXmlFileUpgrader.ES_PATH_NAMESPACE_PATH).get(0));
        assertNotNull(props.getElements(FinalDatabaseXmlFileUpgrader.SOURCE_NAME_FIELD_PATH).get(0));
        assertNotNull(props.getElements(FinalDatabaseXmlFileUpgrader.SOURCE_TYPE_FIELD_PATH).get(0));
        assertNotNull(props.getElements(FinalDatabaseXmlFileUpgrader.SOURCE_NAME_INDEX_PATH).get(0));
        assertNotNull(props.getElements(FinalDatabaseXmlFileUpgrader.SOURCE_TYPE_INDEX_PATH).get(0));

        assertTrue(props.getElements(FinalDatabaseXmlFileUpgrader.OLD_ACTION_DETAILS_INDEX_PATH).isEmpty(),
            "5.4.0 replaces this index with a different index, so it should have been removed");
        assertNotNull(props.getElements(FinalDatabaseXmlFileUpgrader.NEW_ACTION_DETAILS_INDEX_PATH).get(0));
    }
}
