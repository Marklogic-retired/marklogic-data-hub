package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubConfig;

public class CheckSecurityConfiguration extends LoggingObject implements Command {
    private final HubConfig hubConfig;
    private static final String dataHubDeveloperRole = "data-hub-developer";
    private static final String dataHubOperatorRole = "data-hub-operator";
    public CheckSecurityConfiguration(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public void execute(CommandContext context) {
        if (dataHubDeveloperRole.equals(this.hubConfig.getFlowDeveloperRoleName())) {
            throw new RuntimeException("mlFlowDeveloperRole setting conflicts with core '"+ dataHubDeveloperRole + "' role. \n" +
                    "Change mlFlowDeveloperRole to a different value or consider removing src/main/hub-internal-config/security/roles/flow-developer-role.json in favor of using " + dataHubDeveloperRole + ".");
        }
        if (dataHubOperatorRole.equals(this.hubConfig.getFlowOperatorRoleName())) {
            throw new RuntimeException("mlFlowOperatorRole setting conflicts with core '"+ dataHubOperatorRole + "' role. \n" +
                    "Change mlFlowDeveloperRole to a different value or consider removing src/main/hub-internal-config/security/roles/flow-operator-role.json in favor of using " + dataHubOperatorRole + ".");
        }
    }

    @Override
    public Integer getExecuteSortOrder() {
        return SortOrderConstants.DEPLOY_ROLES - 1;
    }
}