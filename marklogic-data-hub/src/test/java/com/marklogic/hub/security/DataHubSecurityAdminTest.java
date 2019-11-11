package com.marklogic.hub.security;

import com.marklogic.mgmt.api.security.Role;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

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

    @Test
    public void task5CannotCreateCustomRoleInheritingExistingRole() {
        final String roleName = "test-custom-role2";
        Role customRole = new Role(userWithRoleBeingTestedApi, roleName);
        customRole.setRole(Arrays.asList("manage-admin"));

        try {
            customRole.save();
            fail("The role creation should have failed because the role inherits an existing ML-created role");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
        } finally {
            new Role(adminUserApi, roleName).delete();
        }
    }
}
