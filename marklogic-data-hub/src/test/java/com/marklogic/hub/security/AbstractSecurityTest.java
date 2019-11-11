package com.marklogic.hub.security;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Role;
import com.marklogic.mgmt.api.security.User;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.mapper.ResourceMapper;
import com.marklogic.mgmt.resource.security.RoleManager;
import com.marklogic.rest.util.ResourcesFragment;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Base class for tests that verify that DHF roles can/cannot do what they're intended to do.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public abstract class AbstractSecurityTest extends HubTestBase {

    protected static final String FINAL_DB = "data-hub-FINAL";
    protected static final String STAGING_DB = "data-hub-STAGING";

    protected ManageClient adminUserClient;
    protected API adminUserApi;
    protected ResourceMapper resourceMapper;

    protected Role roleBeingTested;
    protected User userWithRoleBeingTested;
    protected ManageClient userWithRoleBeingTestedClient;
    protected API userWithRoleBeingTestedApi;

    private List<String> customPrivilegeNames = new ArrayList<>();

    @BeforeEach
    public void setupFlowDeveloperApi() {
        // It's assumed that the "admin" user is the default user for talking to the Manage API
        adminUserClient = adminHubConfig.getManageClient();
        adminUserApi = new API(adminUserClient);
        resourceMapper = new DefaultResourceMapper(adminUserApi);

        roleBeingTested = new DefaultResourceMapper(adminUserApi).readResource(
            new RoleManager(adminUserClient).getAsJson(getRoleName()), Role.class
        );

        createUserWithRoleBeingTested();

        userWithRoleBeingTestedClient = new ManageClient(
            new ManageConfig(adminHubConfig.getHost(), 8002, userWithRoleBeingTested.getUserName(), userWithRoleBeingTested.getPassword())
        );
        userWithRoleBeingTestedApi = new API(userWithRoleBeingTestedClient);

        logger.info("Finished setting up role to be tested and a user with that role");
    }

    @AfterEach
    public void tearDown() {
        logger.info("Deleting the role to be tested and the user with that role");
        if (userWithRoleBeingTested != null) {
            userWithRoleBeingTested.delete();
        }
    }

    /**
     * Subclasses must define the name of the role being tested. This class will then create a user
     * with that role so that the user can be tested against different operations.
     *
     * @return
     */
    protected abstract String getRoleName();

    protected void createUserWithRoleBeingTested() {
        userWithRoleBeingTested = new User(adminUserApi, "userBeingTested");
        userWithRoleBeingTested.setPassword("password");
        userWithRoleBeingTested.setRole(Arrays.asList(roleBeingTested.getRoleName()));
        userWithRoleBeingTested.delete();
        userWithRoleBeingTested.save();
    }

    protected Role getRole(String roleName) {
        return resourceMapper.readResource(new RoleManager(adminUserClient).getAsJson(roleName), Role.class);
    }

    protected void verifySystemLogsCanBeAccessed() {
        ResourcesFragment xml = new ResourcesFragment(userWithRoleBeingTestedClient.getXml("/manage/v2/logs"));
        List<String> logNames = xml.getListItemNameRefs();
        // AuditLog.txt will only exist if auditing is enabled. Checking for ErrorLog.txt is just as good.
        assertTrue(logNames.contains("ErrorLog.txt"),
            "If the list of accessible log files includes ErrorLog.txt, then the user will be able to see " +
                "AuditLog.txt as well, as both require the get-system-logs privilege; actual list of log names: " + logNames);
    }

}
