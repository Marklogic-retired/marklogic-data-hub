package com.marklogic.hub.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;

/**
 * Can be used for creating any kind of database with any sorts of forests. Specifying a config file for the database or
 * for the forests is optional. In order to create forests with different parameters, use DeployForestsCommand.
 */
public class DeployHubDatabaseCommand extends DeployDatabaseCommand {

    public enum DBType {
        STAGING, FINAL, TRACING;
    }

    private DBType dbType;

    public void setDbType(DBType dbType) {
        this.dbType = dbType;
    }

    public DeployHubDatabaseCommand(String databaseName) {
        super();
        this.setDatabaseName(databaseName);
        this.setCreateDatabaseWithoutFile(true);
        this.setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_SERVERS);
    }

    @Override
    public void undo(CommandContext context) {
    }

    @Override
    protected String getPayload(CommandContext context) {
        String payload =
                "{" +
                "  \"database-name\": \"%s\"," +
                "  \"triple-index\": true," +
                "  \"collection-lexicon\":true";
        if (this.dbType.equals(DBType.STAGING)) {
            payload += "," +
                    "\"range-element-index\": [" +
                    "  {" +
                    "    \"scalar-type\": \"unsignedInt\"," +
                    "    \"namespace-uri\": \"http://marklogic.com/data-hub/trace\"," +
                    "    \"localname\": \"is-tracing-enabled\"," +
                    "    \"collation\": \"\"," +
                    "    \"range-value-positions\": false," +
                    "    \"invalid-values\": \"reject\"" +
                    "  }" +
                    "]";
        }
        else if (this.dbType.equals(DBType.FINAL)) {

        }
        else if (this.dbType.equals(DBType.TRACING)) {
            payload += "," +
                    "\"range-element-index\": [" +
                    "  {" +
                    "    \"scalar-type\": \"string\"," +
                    "    \"namespace-uri\": \"\"," +
                    "    \"localname\": \"trace-id\"," +
                    "    \"collation\": \"http://marklogic.com/collation/codepoint\"," +
                    "    \"range-value-positions\": false," +
                    "    \"invalid-values\": \"reject\"" +
                    "  }" +
                    "]";
        }
        payload += "}";

        return format(payload, getDatabaseName());
    }
}
