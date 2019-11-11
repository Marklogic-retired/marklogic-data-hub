package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import com.marklogic.rest.util.ResourcesFragment;

import java.util.Arrays;

/**
 * Command for creating granular privileges after the resources that these privileges depend on have been created.
 */
public class CreateGranularPrivilegesCommand implements Command {

    private HubConfig hubConfig;

    public CreateGranularPrivilegesCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    /**
     * It is anticipated that these privileges can always be added at the end of a deployment because none of the steps
     * before that should depend on the privileges being added.
     *
     * @return
     */
    @Override
    public Integer getExecuteSortOrder() {
        return Integer.MAX_VALUE;
    }

    @Override
    public void execute(CommandContext context) {
        final String finalDbName = hubConfig.getDbName(DatabaseKind.FINAL);
        final String stagingDbName = hubConfig.getDbName(DatabaseKind.STAGING);

        // Once RMA supports pseudo functions - https://bugtrack.marklogic.com/53540 - then we won't need to get the
        // resource IDs here and can use resource names instead.
        ResourcesFragment databasesXml = new DatabaseManager(context.getManageClient()).getAsXml();
        final String finalDbId = databasesXml.getIdForNameOrId(finalDbName);
        final String stagingDbId = databasesXml.getIdForNameOrId(stagingDbName);

        PrivilegeManager mgr = new PrivilegeManager(context.getManageClient());
        Privilege p = new Privilege(null, "admin-database-clear-" + finalDbName);
        p.setKind("execute");
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/" + finalDbId);
        p.setRole(Arrays.asList("data-hub-admin"));
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-clear-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/" + stagingDbId);
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-index-" + finalDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/" + finalDbId);
        p.setRole(Arrays.asList("data-hub-app-admin"));
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-index-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/" + stagingDbId);
        mgr.save(p.getJson());
    }

}
