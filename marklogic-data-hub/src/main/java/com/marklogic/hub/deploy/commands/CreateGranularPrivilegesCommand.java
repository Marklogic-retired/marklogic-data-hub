package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.UndoableCommand;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.Versions;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.mapper.ResourceMapper;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.groups.GroupManager;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import com.marklogic.mgmt.resource.security.RoleManager;
import com.marklogic.rest.util.ResourcesFragment;
import org.jdom2.Namespace;

import java.util.*;

/**
 * Command for creating granular privileges after the resources that these privileges depend on have been created.
 * <p>
 * See the comments on saveGranularPrivileges for important information about how this class attempts to avoid causing
 * an error by trying to create a privilege with the same action as an existing one.
 */
public class CreateGranularPrivilegesCommand extends LoggingObject implements Command, UndoableCommand {

    private HubConfig hubConfig;
    private List<String> groupNames;

    /**
     * Defines the roles that can be inherited when a data-hub-security-admin creates or edits a custom role.
     */
    public final static List<String> ROLES_THAT_CAN_BE_INHERITED = Arrays.asList(
        "data-hub-admin",
        "data-hub-developer",
        "data-hub-monitor",
        "data-hub-operator",
        "hub-central-clear-user-data",
        "hub-central-custom-reader",
        "hub-central-developer",
        "hub-central-downloader",
        "hub-central-entity-exporter",
        "hub-central-entity-model-reader",
        "hub-central-entity-model-writer",
        "hub-central-flow-writer",
        "hub-central-load-reader",
        "hub-central-load-writer",
        "hub-central-mapping-reader",
        "hub-central-mapping-writer",
        "hub-central-operator",
        "hub-central-saved-query-user",
        "hub-central-step-runner",
        "hub-central-user",
        "data-hub-common",
        "data-hub-common-writer",
        "data-hub-custom-reader",
        "data-hub-custom-writer",
        "data-hub-entity-model-reader",
        "data-hub-entity-model-writer",
        "data-hub-flow-reader",
        "data-hub-flow-writer",
        "data-hub-ingestion-reader",
        "data-hub-ingestion-writer",
        "data-hub-job-reader",
        "data-hub-mapping-reader",
        "data-hub-mapping-writer",
        "data-hub-match-merge-reader",
        "data-hub-match-merge-writer",
        "data-hub-module-reader",
        "data-hub-module-writer",
        "data-hub-odbc-user",
        "data-hub-saved-query-user",
        "data-hub-step-definition-reader",
        "data-hub-step-definition-writer",
        "pii-reader"
    );


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

    // Granular privileges should be removed before dbs as the 'granularPrivileges' map's key uses db id
    @Override
    public Integer getUndoSortOrder() {
        return SortOrderConstants.DELETE_OTHER_DATABASES - 1;
    }

    @Override
    public void execute(CommandContext context) {
        if (new Versions(hubConfig).isVersionCompatibleWith520Roles()) {
            Map<String, Privilege> granularPrivileges = buildGranularPrivileges(context.getManageClient());
            saveGranularPrivileges(context.getManageClient(), granularPrivileges);
        } else {
            logger.info("Not running, as version of MarkLogic does not support the granular privileges in Data Hub roles");
        }
    }

    /**
     * Delete every granular privilege. Not to be used in a DHS environment of course.
     *
     * @param context
     */
    @Override
    public void undo(CommandContext context) {
        if (new Versions(hubConfig).isVersionCompatibleWith520Roles()) {
            Map<String, Privilege> granularPrivileges = buildGranularPrivileges(context.getManageClient());
            PrivilegeManager mgr = new PrivilegeManager(context.getManageClient());
            granularPrivileges.values().forEach(privilege -> {
                mgr.deleteAtPath("/manage/v2/privileges/" + privilege.getPrivilegeName() + "?kind=execute");
            });
        } else {
            logger.info("Not running, as version of MarkLogic does not support the granular privileges in Data Hub roles");
        }
    }

    /**
     * @param manageClient
     * @return a map of privilege action, containing an ID, and a Privilege object to be saved. The key must be an
     * action with an ID so that we can determine if a privilege with the same action already exists.
     */
    protected Map<String, Privilege> buildGranularPrivileges(ManageClient manageClient) {
        final String finalDbName = hubConfig.getDbName(DatabaseKind.FINAL);
        final String stagingDbName = hubConfig.getDbName(DatabaseKind.STAGING);
        final String jobsDbName = hubConfig.getDbName(DatabaseKind.JOB);
        final String finalTriggersDbName = hubConfig.getDbName(DatabaseKind.FINAL_TRIGGERS);
        final String stagingTriggersDbName = hubConfig.getDbName(DatabaseKind.STAGING_TRIGGERS);
        final String modulesDbName = hubConfig.getDbName(DatabaseKind.MODULES);

        DatabaseManager dbMgr = new DatabaseManager(manageClient);
        ResourcesFragment databases = dbMgr.getAsXml();
        final String finalDbId = databases.getIdForNameOrId(finalDbName);
        final String stagingDbId = databases.getIdForNameOrId(stagingDbName);
        final String jobsDbId = databases.getIdForNameOrId(jobsDbName);
        final String finalTriggersDbId = databases.getIdForNameOrId(finalTriggersDbName);
        final String stagingTriggersDbId = databases.getIdForNameOrId(stagingTriggersDbName);
        final String modulesDbId = databases.getIdForNameOrId(modulesDbName);

        final String adminRole = "data-hub-admin";
        final String clearUserDataRole = "hub-central-clear-user-data";
        final String developerRole = "data-hub-developer";
        final String hubCentralEntityModelWriterRole = "hub-central-entity-model-writer";

        final Map<String, Privilege> granularPrivilegeMap = new LinkedHashMap<>();

        Privilege p = newPrivilege("admin-database-clear-" + stagingDbName, adminRole, clearUserDataRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + stagingDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/clear/" + stagingDbId, p);

        p = newPrivilege("admin-database-clear-" + finalDbName, adminRole, clearUserDataRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + finalDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/clear/" + finalDbId, p);

        p = newPrivilege("admin-database-clear-" + jobsDbName, adminRole, clearUserDataRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/clear/$$database-id(" + jobsDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/clear/" + jobsDbId, p);

        p = newPrivilege("admin-database-index-" + stagingDbName, developerRole, hubCentralEntityModelWriterRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + stagingDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/index/" + stagingDbId, p);

        p = newPrivilege("admin-database-index-" + finalDbName, developerRole, hubCentralEntityModelWriterRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + finalDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/index/" + finalDbId, p);

        p = newPrivilege("admin-database-index-" + jobsDbName, developerRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/$$database-id(" + jobsDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/index/" + jobsDbId, p);

        p = newPrivilege("admin-database-triggers-" + stagingTriggersDbName, developerRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/triggers/$$database-id(" + stagingTriggersDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/triggers/" + stagingTriggersDbId, p);

        p = newPrivilege("admin-database-triggers-" + finalTriggersDbName, developerRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/triggers/$$database-id(" + finalTriggersDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/triggers/" + finalTriggersDbId, p);

        p = newPrivilege("admin-database-temporal-" + stagingDbName, developerRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/temporal/$$database-id(" + stagingDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/temporal/" + stagingDbId, p);

        p = newPrivilege("admin-database-temporal-" + finalDbName, developerRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/temporal/$$database-id(" + finalDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/temporal/" + finalDbId, p);

        p = newPrivilege("admin-database-alerts-" + stagingDbName, developerRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/alerts/$$database-id(" + stagingDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/alerts/" + stagingDbId, p);

        p = newPrivilege("admin-database-alerts-" + finalDbName, developerRole);
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/alerts/$$database-id(" + finalDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/alerts/" + finalDbId, p);

        p = newPrivilege("admin-database-amp-" + modulesDbName, "data-hub-security-admin");
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/amp/$$database-id(" + modulesDbName + ")");
        granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/database/amp/" + modulesDbId, p);

        final ResourcesFragment existingGroups = new GroupManager(manageClient).getAsXml();
        getGroupNamesForScheduledTaskPrivileges().forEach(groupName -> {
            // Check for a value ID, as user may have a typo in a group name
            final String groupId = existingGroups.getIdForNameOrId(groupName);
            if (groupId == null) {
                logger.warn(format("Unable to find group ID for group name '%s'; will not create scheduled tasks privilege for the group", groupName));
            } else {
                Privilege priv = newPrivilege("admin-group-scheduled-task-" + groupName, developerRole);
                priv.setAction("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(" + groupName + ")");
                granularPrivilegeMap.put("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/" + groupId, priv);
            }
        });

        final ResourcesFragment existingRoles = new RoleManager(manageClient).getAsXml();
        ROLES_THAT_CAN_BE_INHERITED.forEach(roleName -> {
            // We expect each role to translate to a role; otherwise, an error should be thrown
            String roleId = existingRoles.getIdForNameOrId(roleName);
            Privilege priv = newPrivilege("data-role-inherit-" + roleId, "data-hub-security-admin");
            priv.setAction("http://marklogic.com/xdmp/privileges/role/inherit/" + roleId);
            granularPrivilegeMap.put(priv.getAction(), priv);
        });

        return granularPrivilegeMap;
    }

    /**
     * Save each of the given privileges. For each key in the map - where the key is expected to be an action with a
     * resource ID in it - we check to see if an existing privilege has the same action. If so, then the roles in the
     * granular privilege are added to that existing privilege. This ensures we never cause an error by trying to create
     * a privilege with the same action as an existing one. This is crucial for DHS, as the DHS config will create some
     * of the same granular privileges that DHF needs to create (but with a different name).
     *
     * @param manageClient
     * @param granularPrivileges
     */
    protected void saveGranularPrivileges(ManageClient manageClient, Map<String, Privilege> granularPrivileges) {
        final PrivilegeManager privilegeManager = new PrivilegeManager(manageClient);
        final API manageApi = new API(manageClient);

        // For performance, grab all the privileges and build a map of them with action as the key
        final Map<String, String> actionToNameMap = buildExistingPrivilegeActionToNameMap(manageClient);
        final ResourceMapper resourceMapper = new DefaultResourceMapper(manageApi);

        granularPrivileges.keySet().forEach(actionWithId -> {
            Privilege granularPrivilege = granularPrivileges.get(actionWithId);
            granularPrivilege.setAction(actionWithId);
            final String granularPrivilegeName = granularPrivilege.getPrivilegeName();
            if (actionToNameMap.containsKey(actionWithId)) {
                final String existingPrivilegeName = actionToNameMap.get(actionWithId);
                String json = privilegeManager.getAsJson(existingPrivilegeName, "kind", "execute");
                Privilege existingPrivilege = resourceMapper.readResource(json, Privilege.class);
                List<String> existingRoles = existingPrivilege.getRole();
                if (existingRoles != null) {
                    boolean needsToBeSaved = false;
                    for (String role : granularPrivilege.getRole()) {
                        if (!existingRoles.contains(role)) {
                            existingRoles.add(role);
                            needsToBeSaved = true;
                        }
                    }
                    if (needsToBeSaved) {
                        logger.info(format("For granular privilege '%s', adding roles %s to existing privilege '%s'",
                            granularPrivilegeName, granularPrivilege.getRole(), existingPrivilegeName));
                        existingPrivilege.save();
                    } else {
                        logger.info(format("Not updating privilege '%s', it already has roles %s",
                            existingPrivilegeName, granularPrivilege.getRole()));
                    }
                } else {
                    granularPrivilege.getRole().forEach(role -> existingPrivilege.addRole(role));
                    logger.info(format("For granular privilege '%s', adding roles %s to existing privilege '%s'",
                        granularPrivilegeName, granularPrivilege.getRole(), existingPrivilegeName));
                    existingPrivilege.save();
                }
            } else {
                logger.info(format("Creating new granular privilege '%s'", granularPrivilegeName));
                granularPrivilege.setApi(manageApi);
                granularPrivilege.save();
            }
        });
    }

    /**
     * @param manageClient
     * @return a map of action to name for existing privileges. This is then used to determine if the action of a
     * granular privilege that we want to save already exists
     */
    private Map<String, String> buildExistingPrivilegeActionToNameMap(ManageClient manageClient) {
        ResourcesFragment allPrivileges = new PrivilegeManager(manageClient).getAsXml();
        final Map<String, String> actionToNameMap = new HashMap<>();
        Namespace securityNamespace = Namespace.getNamespace("http://marklogic.com/manage/security");
        allPrivileges.getListItems().forEach(privilege -> {
            String action = privilege.getChildText("action", securityNamespace);
            String name = privilege.getChildText("nameref", securityNamespace);
            actionToNameMap.put(action, name);
        });
        return actionToNameMap;
    }

    protected List<String> getGroupNamesForScheduledTaskPrivileges() {
        return (groupNames != null && !groupNames.isEmpty()) ?
            groupNames :
            Arrays.asList(hubConfig.getAppConfig().getGroupName());
    }

    private Privilege newPrivilege(String name, String... roles) {
        Privilege p = new Privilege(null, name);
        p.setKind("execute");
        for (String role : roles) {
            p.addRole(role);
        }
        return p;
    }

    public List<String> getGroupNames() {
        return groupNames;
    }
}
