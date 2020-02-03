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
import com.marklogic.mgmt.resource.security.PrivilegeManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Command for creating granular privileges after the resources that these privileges depend on have been created.
 */
public class CreateGranularPrivilegesCommand implements Command, UndoableCommand {

    private HubConfig hubConfig;
    private List<String> groupNames;

    public CreateGranularPrivilegesCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    public CreateGranularPrivilegesCommand(HubConfig hubConfig, List<String> groupNames) {
        this.hubConfig = hubConfig;
        this.groupNames = groupNames;
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
        buildPrivilegesThatDhsMayHaveCreated(context.getManageClient()).forEach(p -> mgr.save(p.getJson()));

        Privilege p = new Privilege(null, "admin-database-triggers-" + stagingTriggersDbName);
        p.setKind("execute");
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/triggers/$$database-id(" + stagingTriggersDbName + ")");
        p.addRole("data-hub-developer");
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

        buildScheduledTaskPrivileges().forEach(privilege -> mgr.save(privilege.getJson()));
    }

    @Override
    public void undo(CommandContext context) {
        final String finalDbName = hubConfig.getDbName(DatabaseKind.FINAL);
        final String stagingDbName = hubConfig.getDbName(DatabaseKind.STAGING);
        final String jobsDbName = hubConfig.getDbName(DatabaseKind.JOB);
        final String finalTriggersDbName = hubConfig.getDbName(DatabaseKind.FINAL_TRIGGERS);
        final String stagingTriggersDbName = hubConfig.getDbName(DatabaseKind.STAGING_TRIGGERS);

        PrivilegeManager mgr = new PrivilegeManager(context.getManageClient());
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-clear-" + finalDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-clear-" + stagingDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-clear-" + jobsDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-index-" + finalDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-index-" + stagingDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-index-" + jobsDbName + "?kind=execute");

        mgr.deleteAtPath("/manage/v2/privileges/admin-database-triggers-" + finalTriggersDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-triggers-" + stagingTriggersDbName + "?kind=execute");

        mgr.deleteAtPath("/manage/v2/privileges/admin-database-temporal-" + finalDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-temporal-" + stagingDbName + "?kind=execute");

        mgr.deleteAtPath("/manage/v2/privileges/admin-database-alerts-" + finalDbName + "?kind=execute");
        mgr.deleteAtPath("/manage/v2/privileges/admin-database-alerts-" + stagingDbName + "?kind=execute");

        getGroupNamesForScheduledTaskPrivileges().forEach(groupName -> {
            mgr.deleteAtPath("/manage/v2/privileges/admin-group-scheduled-task-" + groupName + "?kind=execute");
        });
    }

    /**
     * Some of the privileges that need to be created may already exist in DHS. If so, then a role is added to that
     * privilege instead of creating a duplicate one with the same action, which ML does not allow.
     *
     * @param client
     * @return
     */
    protected List<Privilege> buildPrivilegesThatDhsMayHaveCreated(ManageClient client) {
        final List<String> existingPrivilegeNames = new PrivilegeManager(client).getAsXml().getListItemNameRefs();
        final String stagingDbName = hubConfig.getDbName(DatabaseKind.STAGING);
        final String finalDbName = hubConfig.getDbName(DatabaseKind.FINAL);
        final String jobsDbName = hubConfig.getDbName(DatabaseKind.JOB);

        List<Privilege> list = new ArrayList<>();
        list.add(buildPrivilege(client, "admin-database-clear-" + stagingDbName, "http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + stagingDbName + ")",
            "clear-data-hub-STAGING", existingPrivilegeNames, "data-hub-admin"));
        list.add(buildPrivilege(client, "admin-database-clear-" + finalDbName, "http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + finalDbName + ")",
            "clear-data-hub-FINAL", existingPrivilegeNames, "data-hub-admin"));
        list.add(buildPrivilege(client, "admin-database-clear-" + jobsDbName, "http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + jobsDbName + ")",
            "clear-data-hub-JOBS", existingPrivilegeNames, "data-hub-admin"));

        list.add(buildPrivilege(client, "admin-database-index-" + stagingDbName, "http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + stagingDbName + ")",
            "STAGING-index-editor", existingPrivilegeNames, "data-hub-developer"));
        list.add(buildPrivilege(client, "admin-database-index-" + finalDbName, "http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + finalDbName + ")",
            "FINAL-index-editor", existingPrivilegeNames, "data-hub-developer"));
        list.add(buildPrivilege(client, "admin-database-index-" + jobsDbName, "http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + jobsDbName + ")",
            "JOBS-index-editor", existingPrivilegeNames, "data-hub-developer"));

        return list;
    }

    protected Privilege buildPrivilege(ManageClient client, String name, String action, String dhsName, List<String> existingPrivilegeNames, String role) {
        Privilege p;
        if (existingPrivilegeNames.contains(dhsName)) {
            final String json = new PrivilegeManager(client).getAsJson(dhsName, "kind", "execute");
            p = new DefaultResourceMapper(new API(client)).readResource(json, Privilege.class);
        } else {
            p = new Privilege(null, name);
            p.setKind("execute");
            p.setAction(action);
        }
        p.addRole(role);
        return p;
    }

    /**
     * Builds a list of privileges to create based on the groupNames configured on this object. If none have been
     * configured, then the groupName in AppConfig is used.
     *
     * @return
     */
    protected List<Privilege> buildScheduledTaskPrivileges() {
        List<Privilege> privileges = new ArrayList<>();
        getGroupNamesForScheduledTaskPrivileges().forEach(groupName -> {
            Privilege p = new Privilege(null, "admin-group-scheduled-task-" + groupName);
            p.setKind("execute");
            p.setAction("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(" + groupName + ")");
            p.addRole("data-hub-developer");
            privileges.add(p);
        });
        return privileges;
    }

    protected List<String> getGroupNamesForScheduledTaskPrivileges() {
        return (groupNames != null && !groupNames.isEmpty()) ?
            groupNames :
            Arrays.asList(hubConfig.getAppConfig().getGroupName());
    }

    public List<String> getGroupNames() {
        return groupNames;
    }
}
