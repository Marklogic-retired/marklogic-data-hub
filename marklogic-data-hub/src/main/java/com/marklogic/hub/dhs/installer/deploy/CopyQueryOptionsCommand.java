package com.marklogic.hub.dhs.installer.deploy;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;

public class CopyQueryOptionsCommand extends AbstractCommand {

    private HubConfig hubConfig;

    public CopyQueryOptionsCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;

        // Need to run this after the contents of ml-modules-final is loaded
        setExecuteSortOrder(new LoadUserModulesCommand().getExecuteSortOrder() + 1);
    }

    @Override
    public void execute(CommandContext context) {
        String script = "declareUpdate();\n" +
            "[\n" +
            "  '/Evaluator/data-hub-JOBS/rest-api/options/jobs.xml',\n" +
            "  '/Evaluator/data-hub-JOBS/rest-api/options/traces.xml',\n" +
            "  '/Evaluator/data-hub-STAGING/rest-api/options/default.xml',\n" +
            "  '/Evaluator/data-hub-STAGING/rest-api/options/exp-default.xml'\n" +
            "].forEach(uri => {\n" +
            "  if (fn.docAvailable(uri)) { console.log('Reproducing: ' + uri); xdmp.documentInsert(uri.replace('Evaluator', 'Curator'), cts.doc(uri), \n" +
            "    xdmp.documentGetPermissions(uri), xdmp.documentGetCollections(uri));}\n" +
            "});\n" +

            "\n" +
            "const stagingUri = '/Evaluator/data-hub-STAGING/rest-api/options/default.xml';\n" +
            "if (fn.docAvailable(stagingUri)) { " +
            "  xdmp.documentInsert('/Evaluator/data-hub-FINAL/rest-api/options/default.xml', cts.doc(stagingUri), xdmp.documentGetPermissions(stagingUri), xdmp.documentGetCollections(stagingUri));\n" +
            "  xdmp.documentInsert('/Curator/data-hub-FINAL/rest-api/options/default.xml', cts.doc(stagingUri), xdmp.documentGetPermissions(stagingUri), xdmp.documentGetCollections(stagingUri));" +
            "}\n\n" +

            "const explorerUri = '/Evaluator/data-hub-STAGING/rest-api/options/exp-default.xml';\n" +
            "if (fn.docAvailable(explorerUri)) { " +
            "  xdmp.documentInsert('/Evaluator/data-hub-FINAL/rest-api/options/exp-default.xml', cts.doc(explorerUri), xdmp.documentGetPermissions(explorerUri), xdmp.documentGetCollections(explorerUri));\n" +
            "  xdmp.documentInsert('/Curator/data-hub-FINAL/rest-api/options/exp-default.xml', cts.doc(explorerUri), xdmp.documentGetPermissions(explorerUri), xdmp.documentGetCollections(explorerUri));" +
            "}\n\n" +

            "[\n" +
            "  '/Analyzer/data-hub-ANALYTICS/rest-api/options/default.xml',\n" +
            "  '/Analyzer/data-hub-ANALYTICS-REST/rest-api/options/default.xml',\n" +
            "  '/Operator/data-hub-OPERATION/rest-api/options/default.xml',\n" +
            "  '/Operator/data-hub-OPERATION-REST/rest-api/options/default.xml',\n" +
            "  '/Evaluator/data-hub-ANALYTICS/rest-api/options/default.xml',\n" +
            "  '/Evaluator/data-hub-OPERATION/rest-api/options/default.xml'\n" +
            "].forEach(uri => {\n" +
            "  if (fn.docAvailable(stagingUri)) {console.log('Inserting: ' + uri); xdmp.documentInsert(uri, cts.doc(stagingUri), xdmp.documentGetPermissions(stagingUri), \n" +
            "    xdmp.documentGetCollections(stagingUri));}\n" +
            "})";

        DatabaseClient client = hubConfig.newModulesDbClient();
        try {
            client.newServerEval().javascript(script).eval().close();
        } finally {
            client.release();
        }

    }
}
