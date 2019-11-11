package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.mapper.ResourceMapper;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import com.marklogic.rest.util.ResourcesFragment;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class CreateGranularPrivilegesTest extends HubTestBase {

    /**
     * The CreateGranularPrivilegesCommand is assumed to have been run as part of bootstrapping the test application,
     * so this test just verifies the results of that command having been run.
     */
    @Test
    public void verifyGranularPrivilegesExist() {
        PrivilegeManager mgr = new PrivilegeManager(adminHubConfig.getManageClient());
        ResourceMapper resourceMapper = new DefaultResourceMapper(new API(adminHubConfig.getManageClient()));

        ResourcesFragment databasesXml = new DatabaseManager(adminHubConfig.getManageClient()).getAsXml();
        final String finalDbId = databasesXml.getIdForNameOrId("data-hub-FINAL");
        final String stagingDbId = databasesXml.getIdForNameOrId("data-hub-STAGING");

        Privilege p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + stagingDbId, p.getAction());
        assertEquals("data-hub-admin", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + finalDbId, p.getAction());
        assertEquals("data-hub-admin", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + stagingDbId, p.getAction());
        assertEquals("data-hub-app-admin", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + finalDbId, p.getAction());
        assertEquals("data-hub-app-admin", p.getRole().get(0));
    }
}
