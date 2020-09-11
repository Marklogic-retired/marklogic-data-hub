package com.marklogic.hub.core;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

public class HubProjectTest extends AbstractHubCoreTest {

    @Test
    public void testInit() throws IOException {
        HubConfigImpl config = new HubConfigImpl(getHubProject());
        config.setHttpName(DatabaseKind.STAGING, "my-crazy-test-staging");
        config.setDbName(DatabaseKind.STAGING, "my-crazy-test-staging");
        config.setForestsPerHost(DatabaseKind.STAGING, 100);
        config.setPort(DatabaseKind.STAGING, 1111);

        config.setHttpName(DatabaseKind.FINAL, "my-crazy-test-final");
        config.setDbName(DatabaseKind.FINAL, "my-crazy-test-final");
        config.setForestsPerHost(DatabaseKind.FINAL, 100);
        config.setPort(DatabaseKind.FINAL, 2222);

        config.setHttpName(DatabaseKind.JOB, "my-crazy-test-trace");
        config.setDbName(DatabaseKind.JOB, "my-crazy-test-trace");
        config.setForestsPerHost(DatabaseKind.JOB, 100);
        config.setPort(DatabaseKind.JOB, 3333);

        config.setForestsPerHost(DatabaseKind.MODULES, 3);
        config.setForestsPerHost(DatabaseKind.STAGING_TRIGGERS, 4);

        config.setForestsPerHost(DatabaseKind.STAGING_SCHEMAS, 5);

        config.setFlowOperatorRoleName("myrole");
        config.setFlowOperatorUserName("myuser");

        deleteTestProjectDirectory();
        config.initHubProject();

        String projectPath = getHubProject().getProjectDirString();

        assertTrue(new File(projectPath, "src/main/hub-internal-config/servers/staging-server.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/databases/staging-database.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/databases/staging-schemas-database.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/databases/staging-triggers-database.json").exists());

        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-explorer-architect.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-admin-role.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-entity-model-reader.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/flow-developer-role.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/flow-operator-role.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-module-reader.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-module-writer.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-job-reader.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-job-internal.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-flow-reader.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-flow-writer.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-mapping-reader.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-mapping-writer.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-step-definition-reader.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-step-definition-writer.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-entity-model-reader.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/data-hub-entity-model-writer.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/roles/hub-central-entity-exporter.json").exists());


        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/amps/amps-dhf-update-batch.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/security/amps/amps-dhf-update-job.json").exists());

        assertTrue(new File(projectPath, "src/main/ml-config/servers/final-server.json").exists());
        assertTrue(new File(projectPath, "src/main/ml-config/databases/final-database.json").exists());
        assertTrue(new File(projectPath, "src/main/ml-config/databases/modules-database.json").exists());
        assertTrue(new File(projectPath, "src/main/ml-config/databases/final-schemas-database.json").exists());
        assertTrue(new File(projectPath, "src/main/ml-config/databases/final-triggers-database.json").exists());

        File buildGradle = new File(projectPath, "build.gradle");
        assertTrue(buildGradle.exists());

        File gradleProperties = new File(projectPath, "gradle.properties");
        assertTrue(gradleProperties.exists());
        Properties props = new Properties();
        FileInputStream propsStream = new FileInputStream(gradleProperties);
        String fileContents = IOUtils.toString(propsStream);
        assertFalse(fileContents.contains("mlModulePermissions"));
        fileContents = fileContents.replace("mlUsername=", "mlUsername=twituser");
        fileContents = fileContents.replace("mlPassword=", "mlPassword=twitpassword");
        fileContents = fileContents.replace("# mlManageUsername=", "mlManageUsername=manage-user");
        fileContents = fileContents.replace("# mlManagePassword=", "mlManagePassword=manage-password");
        fileContents = fileContents.replace("# mlSecurityUsername=", "mlSecurityUsername=security-user");
        fileContents = fileContents.replace("# mlSecurityPassword=", "mlSecurityPassword=security-password");
        fileContents = fileContents.replace("# mlAppServicesPort=8000", "mlAppServicesPort=9000");
        fileContents = fileContents.replace("# mlAdminPort=8001", "mlAdminPort=9001");
        fileContents = fileContents.replace("# mlManagePort=8002", "mlManagePort=9002");
        InputStream updatedStream = IOUtils.toInputStream(fileContents);

        props.load(updatedStream);
        updatedStream.close();
        propsStream.close();

        assertEquals(config.getAppConfig().getHost(), props.getProperty("mlHost"));

        assertEquals("twituser", props.getProperty("mlUsername"));
        assertEquals("twitpassword", props.getProperty("mlPassword"));

        assertEquals("manage-user", props.getProperty("mlManageUsername"));
        assertEquals("manage-password", props.getProperty("mlManagePassword"));

        assertEquals("security-user", props.getProperty("mlSecurityUsername"));
        assertEquals("security-password", props.getProperty("mlSecurityPassword"));

        assertEquals("9000", props.getProperty("mlAppServicesPort"));
        assertEquals("9001", props.getProperty("mlAdminPort"));
        assertEquals("9002", props.getProperty("mlManagePort"));

        assertEquals(config.getHttpName(DatabaseKind.STAGING), props.getProperty("mlStagingAppserverName"));
        assertEquals(config.getPort(DatabaseKind.STAGING).toString(), props.getProperty("mlStagingPort"));
        assertEquals(config.getDbName(DatabaseKind.STAGING), props.getProperty("mlStagingDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.STAGING).toString(), props.getProperty("mlStagingForestsPerHost"));

        assertEquals(config.getHttpName(DatabaseKind.FINAL), props.getProperty("mlFinalAppserverName"));
        assertEquals(config.getPort(DatabaseKind.FINAL).toString(), props.getProperty("mlFinalPort"));
        assertEquals(config.getDbName(DatabaseKind.FINAL), props.getProperty("mlFinalDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.FINAL).toString(), props.getProperty("mlFinalForestsPerHost"));

        assertEquals(config.getHttpName(DatabaseKind.JOB), props.getProperty("mlJobAppserverName"));
        assertEquals(config.getPort(DatabaseKind.JOB).toString(), props.getProperty("mlJobPort"));
        assertEquals(config.getDbName(DatabaseKind.JOB), props.getProperty("mlJobDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.JOB).toString(), props.getProperty("mlJobForestsPerHost"));

        assertEquals(config.getDbName(DatabaseKind.MODULES), props.getProperty("mlModulesDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.MODULES).toString(), props.getProperty("mlModulesForestsPerHost"));

        assertEquals(config.getDbName(DatabaseKind.STAGING_TRIGGERS), props.getProperty("mlStagingTriggersDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.STAGING_TRIGGERS).toString(), props.getProperty("mlStagingTriggersForestsPerHost"));

        assertEquals(config.getDbName(DatabaseKind.STAGING_SCHEMAS), props.getProperty("mlStagingSchemasDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.STAGING_SCHEMAS).toString(), props.getProperty("mlStagingSchemasForestsPerHost"));

        assertEquals(config.getFlowOperatorRoleName(), props.getProperty("mlFlowOperatorRole"));
        assertEquals(config.getFlowOperatorUserName(), props.getProperty("mlFlowOperatorUserName"));

        //per DHFPROD-3617,DHFPROD-3618 following properties shouldn't be there in gradle.properties after hubInit is run. Users can adjust these if needed
        assertNull(props.getProperty("mlEntityPermissions"));
        assertNull(props.getProperty("mlFlowPermissions"));
        assertNull(props.getProperty("mlMappingPermissions"));
        assertNull(props.getProperty("mlStepDefinitionPermissions"));
        assertNull(props.getProperty("mlJobPermissions"));

        File gradleLocalProperties = new File(projectPath, "gradle-local.properties");
        assertTrue(gradleLocalProperties.exists());
    }

    @Test
    public void testUserModulesDeployTimestampFilePath() {
        String envName = "dev";

        HubConfigImpl hubConfig = new HubConfigImpl(getHubProject());
        hubConfig.withPropertiesFromEnvironment(envName);
        hubConfig.refreshProject();

        String expectedPath = Paths.get(getHubProject().getProjectDirString(), ".tmp", envName + "-" + hubConfig.USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toString();

        assertEquals(expectedPath, hubConfig.getHubProject().getUserModulesDeployTimestampFile());
    }
}
