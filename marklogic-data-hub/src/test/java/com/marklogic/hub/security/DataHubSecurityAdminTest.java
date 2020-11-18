package com.marklogic.hub.security;

import com.marklogic.hub.deploy.commands.CreateGranularPrivilegesCommand;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.api.security.Role;
import com.marklogic.mgmt.api.security.RolePrivilege;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class DataHubSecurityAdminTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-security-admin";
    }

    /**
     * Just need manage and the role-set-external-names privilege. Note that this is only ever updating an existing role,
     * it's not able to create a role. But due to the "manage" role, the user is able to read the from via the
     * Manage API, which is verified via the "save" call.
     */
    @Test
    public void task3CreateRoleWithExternalName() {
        final String externalName = "test-external-name";
        final String testRoleName = "external-name-test-role";

        try {
            Role role = new Role(userWithRoleBeingTestedApi, testRoleName);
            role.setExternalName(Arrays.asList(externalName));
            role.save();

            role = getRole(role.getRoleName());
            assertEquals(externalName, role.getExternalName().get(0));
        } finally {
            new Role(adminUserApi, testRoleName).delete();
        }
    }

    /**
     * Note that in this scenario, if the role had been created by e.g. flow-developer, the user would not be able to
     * modify it. ML enforces that, and that's what we want - the user can only modify roles per the rules of the
     * create-data-role privilege.
     */
    @Test
    public void task3AddExternalNameToExistingRole() {
        final String externalName = "test-external-name";
        final String testRoleName = "external-name-test-role";

        try {
            // First create the role
            Role role = new Role(userWithRoleBeingTestedApi, testRoleName);
            role.save();

            // Now modify it as the limited user
            role = new Role(userWithRoleBeingTestedApi, testRoleName);
            role.setExternalName(Arrays.asList(externalName));
            role.save();

            role = getRole(role.getRoleName());
            assertEquals(externalName, role.getExternalName().get(0));
        } finally {
            new Role(adminUserApi, testRoleName).delete();
        }
    }


    @Test
    public void task5CreateCustomRoles() {
        final String roleName = "test-custom-role";
        Role customRole = new Role(userWithRoleBeingTestedApi, roleName);

        try {
            customRole.save();
            customRole = getRole(roleName);
            assertEquals(roleName, customRole.getRoleName());
            assertNull(customRole.getRole(), "Since the user has the create-date-role privilege, it can create new roles, " +
                "though not ones that inherit existing ML-created roles");
        } finally {
            new Role(adminUserApi, roleName).delete();
        }
    }

    /**
     * Per DHFPROD-4801, data-hub-security-admin now has "data-role-inherit-" privileges so that it can inherit
     * certain DHF roles when creating a custom role.
     */
    @Test
    void createCustomRoleInheritingCertainDataHubRoles() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        final String roleName = "test-custom-role";
        Role customRole = new Role(userWithRoleBeingTestedApi, roleName);
        customRole.setRole(CreateGranularPrivilegesCommand.ROLES_THAT_CAN_BE_INHERITED);

        assertEquals(42, customRole.getRole().size(), "As of DHFPROD-5753 in 5.3.0, 42 roles are expected to be " +
            "inheritable in custom roles created by a user with the data-hub-security-admin role. When new roles must " +
            "be inheritable, they should be added to the list in CreateGranularPrivilegesCommand, and this count " +
            "should be updated to match the new total.");

        try {
            customRole.save();
            Role actualRole = getRole(roleName);
            assertEquals(roleName, actualRole.getRoleName());
            customRole.getRole().forEach(role ->
                assertTrue(actualRole.getRole().contains(role), "Expected actual role to contain inherited role: " + role)
            );
        } finally {
            new Role(adminUserApi, roleName).delete();
        }

        runAsAdmin();
        PrivilegeManager mgr = new PrivilegeManager(getHubConfig().getManageClient());
        int roleInheritPrivilegeCount = 0;
        for (String name : mgr.getAsXml().getListItemNameRefs()) {
            if (name.startsWith("data-role-inherit-")) {
                roleInheritPrivilegeCount++;
            }
        }
        assertEquals(customRole.getRole().size(), roleInheritPrivilegeCount, "Verifying that the role we tested with " +
            "includes the same number of DH/HC roles that are expected to be inheritable by a data-hub-security-admin");
    }

    @Test
    public void task5CannotCreateCustomRoleInheritingExistingRole() {
        List<String> rolesThatCannotBeInherited = Arrays.asList(
            "data-hub-environment-manager",
            "data-hub-job-internal",
            "data-hub-portal-security-admin",
            "data-hub-security-admin",
            "flow-developer-role"
        );

        rolesThatCannotBeInherited.forEach(forbiddenRole -> {
            final String roleName = "test-custom-role2";
            Role customRole = new Role(userWithRoleBeingTestedApi, roleName);
            customRole.addRole(forbiddenRole);

            try {
                customRole.save();
                fail("The role creation should have failed because the role inherits a role that data-hub-security-admin " +
                    "doesn't have a privilege to inherit; forbidden role: " + forbiddenRole);
            } catch (Exception ex) {
                logger.info("Caught expected exception: " + ex.getMessage());
            } finally {
                new Role(adminUserApi, roleName).delete();
            }
        });
    }

    @Test
    void task5CreateRoleInheritingPrivilegeThatDataHubSecurityAdminPossesses() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());

        final String roleName = "test-custom-role";
        Role customRole = new Role(userWithRoleBeingTestedApi, roleName);
        customRole.addPrivilege(new RolePrivilege("create-data-role", "http://marklogic.com/xdmp/privileges/create-data-role", "execute"));

        try {
            customRole.save();
            customRole = getRole(roleName);
            assertEquals(1, customRole.getPrivilege().size(),
                "Since data-hub-security-admin has the grant-my-privileges privilege, a user with this role can assign privileges" +
                    "that the user already inherits to new roles created by the user");
            RolePrivilege privilege = customRole.getPrivilege().get(0);
            assertEquals("create-data-role", privilege.getPrivilegeName());
        } finally {
            new Role(adminUserApi, roleName).delete();
        }
    }

    @Test
    void task5CreateRoleInheritingPrivilegeThatDataHubSecurityAdminDoesntPossess() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        final String roleName = "test-custom-role2";
        Role customRole = new Role(userWithRoleBeingTestedApi, roleName);
        customRole.addPrivilege(new RolePrivilege("add-query-rolesets", "http://marklogic.com/xdmp/privileges/add-query-rolesets", "execute"));

        try {
            customRole.save();
            fail("The role creation should have failed because the role inherits a privilege that the user doesn't possess");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
        } finally {
            new Role(adminUserApi, roleName).delete();
        }
    }

    @Test
    void task5CreateRoleWithCustomPrivilegeInDataHubNamespace() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        final String roleName = "aaa-custom-role";
        final String customPrivilegeName = "aaa-my-privilege";
        final String customPrivilegeAction = "http://datahub.marklogic.com/custom/my-privilege";

        Privilege p = new Privilege(userWithRoleBeingTestedApi, customPrivilegeName);
        p.setAction(customPrivilegeAction);
        p.setKind("execute");
        p.save();

        Role customRole = new Role(userWithRoleBeingTestedApi, roleName);
        customRole.addPrivilege(new RolePrivilege(customPrivilegeName, customPrivilegeAction, "execute"));

        try {
            customRole.save();
            customRole = getRole(roleName);
            assertEquals(1, customRole.getPrivilege().size(),
                "Since data-hub-security-admin has the create-data-hub-privilege privilege, then a user with this role " +
                    "can create any privilege with an action starting with http://datahub.marklogic.com/custom/");
            RolePrivilege privilege = customRole.getPrivilege().get(0);
            assertEquals(customPrivilegeName, privilege.getPrivilegeName());
        } finally {
            new PrivilegeManager(userWithRoleBeingTestedClient).delete(p.getJson());
            new Role(userWithRoleBeingTestedApi, roleName).delete();
        }
    }

    @Test
    void task5CreateCustomPrivilegeInDisallowedNamespace() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        final String customPrivilegeName = "bbb-my-privilege";
        final String customPrivilegeAction = "http://datahub.marklogic.com/somewhereElse/my-privilege";

        Privilege p = new Privilege(userWithRoleBeingTestedApi, customPrivilegeName);
        p.setAction(customPrivilegeAction);
        p.setKind("execute");

        try {
            p.save();
            fail("This should have failed because the privilege action does not start with http://datahub.marklogic.com/custom/");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
        } finally {
            // Just in case it was created
            new PrivilegeManager(adminUserClient).delete(p.getJson());
        }
    }

    @Test
    void task5CreateRoleWithCustomPrivilegeInDisallowedNamespace() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        final String roleName = "aaa-custom-role";
        final String customPrivilegeName = "aaa-my-privilege";
        final String customPrivilegeAction = "http://datahub.marklogic.com/disallowed/my-privilege";

        // Create the privilege as an admin, as we know the userBeingTested can't create it
        Privilege p = new Privilege(adminUserApi, customPrivilegeName);
        p.setAction(customPrivilegeAction);
        p.setKind("execute");
        p.save();

        Role customRole = new Role(userWithRoleBeingTestedApi, roleName);
        customRole.addPrivilege(new RolePrivilege(customPrivilegeName, customPrivilegeAction, "execute"));

        try {
            customRole.save();
            fail("This should have failed because the privilege action does not start with http://datahub.marklogic.com/custom/");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
        } finally {
            new PrivilegeManager(adminUserClient).delete(p.getJson());
            // Just in case the role was created
            new Role(adminUserApi, roleName).delete();
        }
    }
}
