package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.UndoableCommand;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.mapper.ResourceMapper;
import com.marklogic.mgmt.resource.security.PrivilegeManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Command for creating granular privileges after the resources that these privileges depend on have been created.
 */
public class CreateGranularPrivilegesCommand implements Command, UndoableCommand {

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
    public Integer getUndoSortOrder() {
        return SortOrderConstants.DELETE_PRIVILEGES;
    }

    @Override
    public void execute(CommandContext context) {
        final String finalDbName = hubConfig.getDbName(DatabaseKind.FINAL);
        final String stagingDbName = hubConfig.getDbName(DatabaseKind.STAGING);
        final String finalTriggersDbName = hubConfig.getDbName(DatabaseKind.FINAL_TRIGGERS);
        final String stagingTriggersDbName = hubConfig.getDbName(DatabaseKind.STAGING_TRIGGERS);

        PrivilegeManager mgr = new PrivilegeManager(context.getManageClient());

        buildClearDatabasePrivileges(context.getManageClient(), finalDbName, stagingDbName).forEach(p -> mgr.save(p.getJson()));

        Privilege p = new Privilege(null, "admin-database-index-" + finalDbName);
        p.setKind("execute");
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + finalDbName + ")");
        p.setRole(Arrays.asList("data-hub-developer"));
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-index-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + stagingDbName + ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-triggers-" + stagingTriggersDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/triggers/$$database-id(" + stagingTriggersDbName + ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-triggers-" + finalTriggersDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/triggers/$$database-id(" + finalTriggersDbName + ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-temporal-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/temporal/$$database-id(" + stagingDbName + ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-temporal-" + finalDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/temporal/$$database-id(" + finalDbName + ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-alerts-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/alerts/$$database-id(" + stagingDbName + ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-alerts-" + finalDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/alerts/$$database-id(" + finalDbName + ")");
        mgr.save(p.getJson());

        if (hubConfig.getIsProvisionedEnvironment()) {
            p.setPrivilegeName("admin-group-scheduled-task-Analyzer");
            p.setAction("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(Analyzer)");
            mgr.save(p.getJson());

            p.setPrivilegeName("admin-group-scheduled-task-Curator");
            p.setAction("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(Curator)");
            mgr.save(p.getJson());

            p.setPrivilegeName("admin-group-scheduled-task-Evaluator");
            p.setAction("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(Evaluator)");
            mgr.save(p.getJson());

            p.setPrivilegeName("admin-group-scheduled-task-Operator");
            p.setAction("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(Operator)");
            mgr.save(p.getJson());
        } else {
            String groupName = hubConfig.getAppConfig().getGroupName();

            p.setPrivilegeName("admin-group-scheduled-task-" + groupName);
            p.setAction("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(" + groupName + ")");
            mgr.save(p.getJson());
        }
    }

    @Override
    public void undo(CommandContext context) {
        final String finalDbName = hubConfig.getDbName(DatabaseKind.FINAL);
        final String stagingDbName = hubConfig.getDbName(DatabaseKind.STAGING);
        final String finalTriggersDbName = hubConfig.getDbName(DatabaseKind.FINAL_TRIGGERS);
        final String stagingTriggersDbName = hubConfig.getDbName(DatabaseKind.STAGING_TRIGGERS);

        PrivilegeManager mgr = new PrivilegeManager(context.getManageClient());
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-clear-" + finalDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-clear-" + stagingDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-index-" + finalDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-index-" + stagingDbName + "?kind=execute");

        mgr.deleteAtPath("/manage/v2/privileges/admin-database-triggers-" + finalTriggersDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-triggers-" + stagingTriggersDbName + "?kind=execute");

        mgr.deleteAtPath("/manage/v2/privileges/admin-database-temporal-" + finalDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-temporal-" + stagingDbName + "?kind=execute");

        mgr.deleteAtPath("/manage/v2/privileges/admin-database-alerts-" + finalDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-alerts-" + stagingDbName + "?kind=execute");

        if (hubConfig.getIsProvisionedEnvironment()) {
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-Analyzer" + "?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-Curator" + "?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-Evaluator" + "?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-Operator" + "?kind=execute");
        } else {
            String groupName = hubConfig.getAppConfig().getGroupName();
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-" + groupName + "?kind=execute");
        }
    }

    /**
     * DHS creates privileges for clearing the final/staging databases. So if those exist, data-hub-admin is added to
     * those as opposed to new privileges being created.
     *
     * @param client
     * @param finalDbName
     * @param stagingDbName
     * @return
     */
    protected List<Privilege> buildClearDatabasePrivileges(ManageClient client, String finalDbName, String stagingDbName) {
        List<Privilege> list = new ArrayList<>();

        PrivilegeManager mgr = new PrivilegeManager(client);
        final List<String> existingPrivilegeNames = mgr.getAsXml().getListItemNameRefs();
        ResourceMapper resourceMapper = new DefaultResourceMapper(new API(client));

        Privilege stagingPriv;
        if (existingPrivilegeNames.contains("clear-data-hub-STAGING")) {
            stagingPriv = resourceMapper.readResource(mgr.getAsJson("clear-data-hub-STAGING", "kind", "execute"), Privilege.class);
        } else {
            stagingPriv = new Privilege(null, "admin-database-clear-" + stagingDbName);
            stagingPriv.setKind("execute");
            stagingPriv.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + stagingDbName + ")");
        }
        stagingPriv.addRole("data-hub-admin");
        list.add(stagingPriv);

        Privilege finalPriv;
        if (existingPrivilegeNames.contains("clear-data-hub-FINAL")) {
            finalPriv = resourceMapper.readResource(mgr.getAsJson("clear-data-hub-FINAL", "kind", "execute"), Privilege.class);
        } else {
            finalPriv = new Privilege(null, "admin-database-clear-" + finalDbName);
            finalPriv.setKind("execute");
            finalPriv.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + finalDbName + ")");
        }
        finalPriv.addRole("data-hub-admin");
        list.add(finalPriv);

        return list;
    }
}
