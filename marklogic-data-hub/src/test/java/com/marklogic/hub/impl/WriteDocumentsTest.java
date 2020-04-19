package com.marklogic.hub.impl;

import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * This test was created based on the temporal-document-write.sjs unit test. That test required at least a flow-developer
 * user in order to succeed. But with the intent of RunMarkLogicUnitTestsTest running as a data-hub-developer user, the
 * test had to be converted into a JUnit test where a flow-developer user can be used.
 */
public class WriteDocumentsTest extends AbstractHubCoreTest {

    @Test
    void test() {
        runAsFlowDeveloper();

        addIndexes();
        createAxes();
        createTemporalCollection();

        try {
            testWriteDocuments();
        } finally {
            try {
                protectTestDocument();
                wipeTestDocument();
            } catch (Exception ex) {
                logger.info("Unable to remove the test document, likely because the test failued: " + ex.getMessage());
            }
            removeCollection();
            removeAxes();
            removeIndexes();
        }
    }

    private void addIndexes() {
        eval("const admin = require(\"/MarkLogic/admin\");\n" +
            "\n" +
            "  let config = admin.getConfiguration();\n" +
            "  let dbid = xdmp.database();\n" +
            "  let rangespecs = [\n" +
            "    admin.databaseRangeElementIndex(\"dateTime\", \"\", \"TESTsystemStart\", \"\", fn.false()),\n" +
            "    admin.databaseRangeElementIndex(\"dateTime\", \"\", \"TESTsystemEnd\", \"\", fn.false()),\n" +
            "    admin.databaseRangeElementIndex(\"dateTime\", \"\", \"TESTvalidStart\", \"\", fn.false()),\n" +
            "    admin.databaseRangeElementIndex(\"dateTime\", \"\", \"TESTvalidEnd\", \"\", fn.false())];\n" +
            " rangespecs.forEach((rangespec) => {\n" +
            "    config = admin.databaseAddRangeElementIndex(config, dbid, rangespec);\n" +
            " });\n" +
            "admin.saveConfiguration(config);");
        logger.info("Added indexes");
    }

    private void createAxes() {
        eval("const temporal = require(\"/MarkLogic/temporal.xqy\");\n" +
            "try {\n" +
            "  temporal.axisRemove(\"TESTsystem\");\n" +
            "  temporal.axisRemove(\"TESTvalid\");\n" +
            "} catch (e) {\n" +
            "}\n" +
            "var output = new Array();\n" +
            "output.push(\n" +
            "  temporal.axisCreate(\n" +
            "   \"TESTsystem\",\n" +
            "   cts.elementReference(xs.QName(\"TESTsystemStart\")),\n" +
            "   cts.elementReference(xs.QName(\"TESTsystemEnd\")))\n" +
            "  );\n" +
            "output.push(\n" +
            "  temporal.axisCreate(\n" +
            "   \"TESTvalid\",\n" +
            "   cts.elementReference(xs.QName(\"TESTvalidStart\")),\n" +
            "   cts.elementReference(xs.QName(\"TESTvalidEnd\")))\n" +
            "  );\n" +
            "output;");
        logger.info("Created temporal axes");
    }

    private void createTemporalCollection() {
        eval("const temporal = require(\"/MarkLogic/temporal.xqy\");\n" +
            "temporal.collectionCreate(\"TESTtemporalCollection\", \"TESTsystem\", \"TESTvalid\");");
        logger.info("Created temporal collection");
    }

    private void testWriteDocuments() {
        String results = eval("'use strict';\n" +
            "const test = require('/test/test-helper.xqy');\n" +
            "const HubUtils = require('/data-hub/5/impl/hub-utils.sjs');\n" +
            "const hubUtils = new HubUtils();\n" +
            "const temporal = require('/MarkLogic/temporal.xqy');\n" +
            "\n" +
            "const temporalCollections = temporal.collections().toArray();\n" +
            "let emptySequence = Sequence.from([]);\n" +
            "\n" +
            "let temporalCollection = 'TESTtemporalCollection';\n" +
            "let temporalDoc = {uri: \"/TESTtemporal.json\", value: { TESTsystemStart: null, TESTsystemEnd: null, TESTvalidStart: fn.currentDateTime(), TESTvalidEnd: fn.currentDateTime().add(xs.yearMonthDuration('P1Y')) }};\n" +
            "\n" +
            "hubUtils.writeDocuments([temporalDoc], xdmp.defaultPermissions(), [temporalCollection], xdmp.databaseName(xdmp.database()));\n" +
            "\n" +
            "let readTemporalDoc = fn.head(xdmp.eval(`\n" +
            " cts.doc('${temporalDoc.uri}');\n" +
            "`));\n" +
            "[\n" +
            "  test.assertTrue(\n" +
            "    temporalCollections.filter((col) => fn.string(col) === temporalCollection).length === 1,\n" +
            "    `Temporal collections: ${xdmp.describe(temporalCollections, emptySequence, emptySequence)}`\n" +
            "  ),\n" +
            "  test.assertTrue(fn.exists(readTemporalDoc))\n" +
            "];");

        assertTrue(results.contains("<test:result type=\\\"success\\\""), "The script returns marklogic-unit-test " +
            "results; it should be an array with two results that are both successful; we can verify that at least one" +
            "exists, because if a failure did occur, then an error would have been thrown; results: " + results);
    }

    private void protectTestDocument() {
        eval("declareUpdate();\n" +
            "const temporal = require(\"/MarkLogic/temporal.xqy\");\n" +
            "temporal.documentProtect(\n" +
            "   \"TESTtemporalCollection\",\n" +
            "   \"/TESTtemporal.json\",\n" +
            "  {\n" +
            "    expireTime: fn.currentDateTime()\n" +
            "  }\n" +
            ");\n");
        logger.info("Protected test document");
    }

    private void wipeTestDocument() {
        eval("declareUpdate();\n" +
            "const temporal = require(\"/MarkLogic/temporal.xqy\");\n" +
            "temporal.documentWipe(\n" +
            "   \"TESTtemporalCollection\",\n" +
            "   \"/TESTtemporal.json\"\n" +
            ");\n");
        logger.info("Wiped test document");
    }

    private void removeCollection() {
        eval("declareUpdate();\n" +
            "  const temporal = require(\"/MarkLogic/temporal.xqy\");\n" +
            "  temporal.collectionRemove(\"TESTtemporalCollection\");");
        logger.info("Removed temporal collection");
    }

    private void removeAxes() {
        eval("declareUpdate();\n" +
            "  const temporal = require(\"/MarkLogic/temporal.xqy\");\n" +
            "  temporal.axisRemove(\"TESTsystem\");\n" +
            "  temporal.axisRemove(\"TESTvalid\");");
        logger.info("Removed temporal axes");
    }

    private void removeIndexes() {
        eval("const admin = require(\"/MarkLogic/admin\");\n" +
            "\n" +
            "  let config = admin.getConfiguration();\n" +
            "  let dbid = xdmp.database();\n" +
            "  let rangespecs = [\n" +
            "    admin.databaseRangeElementIndex(\"dateTime\", \"\", \"TESTsystemStart\", \"\", fn.false()),\n" +
            "    admin.databaseRangeElementIndex(\"dateTime\", \"\", \"TESTsystemEnd\", \"\", fn.false()),\n" +
            "    admin.databaseRangeElementIndex(\"dateTime\", \"\", \"TESTvalidStart\", \"\", fn.false()),\n" +
            "    admin.databaseRangeElementIndex(\"dateTime\", \"\", \"TESTvalidEnd\", \"\", fn.false())];\n" +
            " rangespecs.forEach((rangespec) => {\n" +
            "  config = admin.databaseDeleteRangeElementIndex(config, dbid, rangespec);\n" +
            " });\n" +
            "admin.saveConfiguration(config);");
        logger.info("Removed indexes");
    }

    private String eval(String javascript) {
        return getHubConfig().newStagingClient().newServerEval().javascript(javascript).evalAs(String.class);
    }
}
