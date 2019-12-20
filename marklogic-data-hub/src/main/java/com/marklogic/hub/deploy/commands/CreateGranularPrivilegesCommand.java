package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.UndoableCommand;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.resource.security.PrivilegeManager;

import java.util.Arrays;

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
        Privilege p = new Privilege(null, "admin-database-clear-" + finalDbName);
        p.setKind("execute");
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + finalDbName+ ")");
        p.setRole(Arrays.asList("data-hub-admin"));
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-clear-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + stagingDbName+ ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-index-" + finalDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + finalDbName+ ")");
        p.setRole(Arrays.asList("data-hub-developer"));
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-index-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + stagingDbName+ ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-triggers-" + stagingTriggersDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/triggers/$$database-id(" + stagingTriggersDbName+ ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-triggers-" + finalTriggersDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/triggers/$$database-id(" + finalTriggersDbName+ ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-temporal-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/temporal/$$database-id(" + stagingDbName+ ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-temporal-" + finalDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/temporal/$$database-id(" + finalDbName+ ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-alerts-" + stagingDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/alerts/$$database-id(" + stagingDbName+ ")");
        mgr.save(p.getJson());

        p.setPrivilegeName("admin-database-alerts-" + finalDbName);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/alerts/$$database-id(" + finalDbName+ ")");
        mgr.save(p.getJson());

        if(hubConfig.getIsProvisionedEnvironment()) {
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
        }
        else {
            String groupName = hubConfig.getAppConfig().getGroupName();

            p.setPrivilegeName("admin-group-scheduled-task-"+groupName);
            p.setAction("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id("+ groupName + ")");
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

        if(hubConfig.getIsProvisionedEnvironment()) {
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-Analyzer" + "?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-Curator" + "?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-Evaluator" + "?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-Operator" + "?kind=execute");
        }
        else {
            String groupName = hubConfig.getAppConfig().getGroupName();
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-"+ groupName + "?kind=execute");

        }
    }

}
