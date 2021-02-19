package com.marklogic.hub.dhs.installer.deploy;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.DeployQueryOptionsCommand;

import java.util.List;
import java.util.stream.Collectors;

public class CopyQueryOptionsCommand extends AbstractCommand {

    private HubConfig hubConfig;
    private List<String> groupNames;
    private List<String> serverNames;
    private String jobDatabaseName;

    private String scriptResponse;

    public CopyQueryOptionsCommand(HubConfig hubConfig, List<String> groupNames, List<String> serverNames, String jobDatabaseName) {
        this.hubConfig = hubConfig;
        this.groupNames = groupNames;
        this.serverNames = serverNames;
        this.jobDatabaseName = jobDatabaseName;

        // Need to run this after the contents of ml-modules-final and search query options are loaded
        setExecuteSortOrder(new DeployQueryOptionsCommand(hubConfig).getExecuteSortOrder() + 1);
    }

    @Override
    public void execute(CommandContext context) {
        final String script = buildScript();

        DatabaseClient client = hubConfig.newModulesDbClient();
        try {
            scriptResponse = client.newServerEval().javascript(script)
                .addVariable("stagingServer", serverNames.get(0))
                .addVariable("jobServer", jobDatabaseName)
                .addVariable("groups", groupNames.stream().collect(Collectors.joining(",")))
                .addVariable("servers", serverNames.subList(1, serverNames.size()).stream().collect(Collectors.joining(",")))
                .evalAs(String.class);
        } finally {
            client.release();
        }

        logger.info("Copied search options to the following URIs in the modules database:\n" + scriptResponse);
    }

    protected String buildScript() {
        return "declareUpdate();\n" +
            "var stagingServer;\n" +
            "var jobServer;\n" +
            "var groups;\n" +
            "var servers;\n" +
            "\n" +
            "groups = groups.split(',');\n" +
            "servers = servers.split(',');\n" +
            "const firstGroup = groups[0];\n" +
            "\n" +
            "// This array is returned for testing purposes\n" +
            "const createdUris = [];\n" +
            "\n" +
            "let stagingUris = cts.uriMatch('/' + firstGroup + '/' + stagingServer + '/rest-api/options/*').toArray().forEach(uri => {\n" +
            "  const doc = cts.doc(uri);\n" +
            "  const perms = xdmp.documentGetPermissions(uri);\n" +
            "  const collections = xdmp.documentGetCollections(uri);\n" +
            "  // Copy options from first group to other groups for stagingServer\n" +
            "  groups.slice(1).map(group => {\n" +
            "    let newUri = uri.toString().replace('/' + firstGroup + '/', '/' + group + '/');\n" +
            "    xdmp.documentInsert(newUri, doc, perms, collections);\n" +
            "    createdUris.push(newUri);\n" +
            "  });\n" +
            "  \n" +
            "  // Copy options to every group for all other servers\n" +
            "  groups.forEach(group => {\n" +
            "    servers.forEach(server => {\n" +
            "      let newUri = uri.toString().replace('/' + firstGroup + '/', '/' + group + '/');\n" +
            "      newUri = newUri.replace('/' + stagingServer + '/', '/' + server + '/');\n" +
            "      xdmp.documentInsert(newUri, doc, perms, collections);\n" +
            "      createdUris.push(newUri);\n" +
            "    });\n" +
            "  });\n" +
            "});\n" +
            "\n" +
            "// Copy jobs options to job servers in other groups\n" +
            "cts.uriMatch('/' + firstGroup + '/' + jobServer + '/rest-api/options/*').toArray().map(uri => {\n" +
            "  const doc = cts.doc(uri);\n" +
            "  const perms = xdmp.documentGetPermissions(uri);\n" +
            "  const collections = xdmp.documentGetCollections(uri);\n" +
            "  groups.slice(1).forEach(group => {\n" +
            "    let newUri = uri.toString().replace('/' + firstGroup + '/', '/' + group + '/');\n" +
            "    xdmp.documentInsert(newUri, doc, perms, collections);\n" +
            "    createdUris.push(newUri);\n" +
            "  });\n" +
            "});\n" +
            "\n" +
            "createdUris;";
    }

    public String getScriptResponse() {
        return scriptResponse;
    }
}
