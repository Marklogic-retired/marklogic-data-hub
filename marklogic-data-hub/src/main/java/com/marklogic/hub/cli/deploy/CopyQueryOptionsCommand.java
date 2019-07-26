package com.marklogic.hub.cli.deploy;

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
            "  '/Evaluator/data-hub-FINAL/rest-api/options/default.xml'\n" +
            "].forEach(uri => {\n" +
            "  xdmp.documentInsert(uri.replace('Evaluator', 'Curator'), cts.doc(uri), \n" +
            "    xdmp.documentGetPermissions(uri), xdmp.documentGetCollections(uri));\n" +
            "});\n" +
            "\n" +
            "const finalUri = '/Evaluator/data-hub-FINAL/rest-api/options/default.xml';\n" +
            "[\n" +
            "  '/Analyzer/data-hub-ANALYTICS/rest-api/options/default.xml',\n" +
            "  '/Analyzer/data-hub-ANALYTICS-REST/rest-api/options/default.xml',\n" +
            "  '/Operator/data-hub-OPERATION/rest-api/options/default.xml',\n" +
            "  '/Operator/data-hub-OPERATION-REST/rest-api/options/default.xml',\n" +
            "  '/Evaluator/data-hub-ANALYTICS/rest-api/options/default.xml',\n" +
            "  '/Evaluator/data-hub-OPERATION/rest-api/options/default.xml'\n" +
            "].forEach(uri => {\n" +
            "  xdmp.documentInsert(uri, cts.doc(finalUri), xdmp.documentGetPermissions(finalUri), \n" +
            "    xdmp.documentGetCollections(finalUri));\n" +
            "})";

        DatabaseClient client = hubConfig.newModulesDbClient();
        try {
            client.newServerEval().javascript(script).eval();
        } finally {
            client.release();
        }

    }
}
