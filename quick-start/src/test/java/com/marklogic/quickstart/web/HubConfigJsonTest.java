package com.marklogic.quickstart.web;


import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubConfigBuilder;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.io.File;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static sun.awt.OSInfo.OSType.WINDOWS;

@RunWith(SpringJUnit4ClassRunner.class)
@JsonTest
public class HubConfigJsonTest {

    protected static final String PROJECT_PATH = "ye-old-project";

    @Autowired
    private JacksonTester<HubConfig> json;

    @Before
    public void skipWindows() {
        org.junit.Assume.assumeTrue(!System.getProperty("os.name").startsWith("Windows"));
    }

    @Test
    public void testDeserialize() throws IOException {
        String projectPath = new File(PROJECT_PATH).getAbsolutePath();
        String content = "{\n" +
            "  \"host\": null,\n" +
            "  \"stagingDbName\": \"data-hub-STAGING\",\n" +
            "  \"stagingHttpName\": \"data-hub-STAGING\",\n" +
            "  \"stagingForestsPerHost\": 4,\n" +
            "  \"stagingPort\": 8010,\n" +
            "  \"stagingAuthMethod\": \"digest\",\n" +
            "  \"finalDbName\": \"data-hub-FINAL\",\n" +
            "  \"finalHttpName\": \"data-hub-FINAL\",\n" +
            "  \"finalForestsPerHost\": 4,\n" +
            "  \"finalPort\": 8011,\n" +
            "  \"finalAuthMethod\": \"digest\",\n" +
            "  \"traceDbName\": \"data-hub-TRACING\",\n" +
            "  \"traceHttpName\": \"data-hub-TRACING\",\n" +
            "  \"traceForestsPerHost\": 1,\n" +
            "  \"tracePort\": 8012,\n" +
            "  \"traceAuthMethod\": \"digest\",\n" +
            "  \"jobDbName\": \"data-hub-JOBS\",\n" +
            "  \"jobHttpName\": \"data-hub-JOBS\",\n" +
            "  \"jobForestsPerHost\": 1,\n" +
            "  \"jobPort\": 8013,\n" +
            "  \"jobAuthMethod\": \"digest\",\n" +
            "  \"modulesDbName\": \"data-hub-MODULES\",\n" +
            "  \"triggersDbName\": \"data-hub-TRIGGERS\",\n" +
            "  \"schemasDbName\": \"data-hub-SCHEMAS\",\n" +
            "  \"modulesForestsPerHost\": 1,\n" +
            "  \"triggersForestsPerHost\": 1,\n" +
            "  \"schemasForestsPerHost\": 1,\n" +
            "  \"hubRoleName\": \"data-hub-role\",\n" +
            "  \"hubUserName\": \"data-hub-user\",\n" +
            "  \"customForestPath\": \"forests\",\n" +
            "  \"modulePermissions\": \"rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute\",\n" +
            "  \"projectDir\": \"" + projectPath + "\",\n" +
            "  \"jarVersion\": \"0.1.2\",\n" +
            "  \"userModulesDeployTimestampFile\": \"" + projectPath + "/.tmp/user-modules-deploy-timestamps.properties\",\n" +
            "  \"hubEntitiesDir\": \"file://" + projectPath + "/plugins/entities\",\n" +
            "  \"entityDatabaseDir\": \"file://" + projectPath + "/entity-config/databases\",\n" +
            "  \"hubModulesDeployTimestampFile\": \"" + projectPath + "/.tmp/hub-modules-deploy-timestamps.properties\",\n" +
            "  \"userContentDeployTimestampFile\": \"" + projectPath + "/.tmp/user-content-deploy-timestamps.properties\",\n" +
            "  \"hubPluginsDir\": \"file://" + projectPath + "/plugins\",\n" +
            "  \"hubConfigDir\": \"file://" + projectPath + "/hub-internal-config\",\n" +
            "  \"hubDatabaseDir\": \"file://" + projectPath + "/hub-internal-config/databases\",\n" +
            "  \"hubServersDir\": \"file://" + projectPath + "/hub-internal-config/servers\",\n" +
            "  \"hubSecurityDir\": \"file://" + projectPath + "/hub-internal-config/security\",\n" +
            "  \"userSecurityDir\": \"file://" + projectPath + "/user-config/security\",\n" +
            "  \"userConfigDir\": \"file://" + projectPath + "/user-config\",\n" +
            "  \"userDatabaseDir\": \"file://" + projectPath + "/user-config/databases\",\n" +
            "  \"userServersDir\": \"file://" + projectPath + "/user-config/servers\",\n" +
            "  \"hubMimetypesDir\": \"file://" + projectPath + "/hub-internal-config/mimetypes\"\n" +
            "}";
        HubConfig expected = HubConfigBuilder.newHubConfigBuilder(PROJECT_PATH).withPropertiesFromEnvironment().build();


        assertThat(this.json.parseObject(content).getHubPluginsDir())
            .isEqualTo(expected.getHubPluginsDir());
    }

    @Test
    public void testSerialize() throws IOException {
        String projectPath = new File(PROJECT_PATH).getAbsolutePath();
        HubConfig hubConfig = HubConfigBuilder.newHubConfigBuilder(PROJECT_PATH).withPropertiesFromEnvironment().build();
        String expected = "{\n" +
            "  \"stagingDbName\": \"data-hub-STAGING\",\n" +
            "  \"stagingHttpName\": \"data-hub-STAGING\",\n" +
            "  \"stagingForestsPerHost\": 4,\n" +
            "  \"stagingPort\": 8010,\n" +
            "  \"stagingAuthMethod\": \"digest\",\n" +
            "  \"finalDbName\": \"data-hub-FINAL\",\n" +
            "  \"finalHttpName\": \"data-hub-FINAL\",\n" +
            "  \"finalForestsPerHost\": 4,\n" +
            "  \"finalPort\": 8011,\n" +
            "  \"finalAuthMethod\": \"digest\",\n" +
            "  \"traceDbName\": \"data-hub-TRACING\",\n" +
            "  \"traceHttpName\": \"data-hub-TRACING\",\n" +
            "  \"traceForestsPerHost\": 1,\n" +
            "  \"tracePort\": 8012,\n" +
            "  \"traceAuthMethod\": \"digest\",\n" +
            "  \"jobDbName\": \"data-hub-JOBS\",\n" +
            "  \"jobHttpName\": \"data-hub-JOBS\",\n" +
            "  \"jobForestsPerHost\": 1,\n" +
            "  \"jobPort\": 8013,\n" +
            "  \"jobAuthMethod\": \"digest\",\n" +
            "  \"modulesDbName\": \"data-hub-MODULES\",\n" +
            "  \"triggersDbName\": \"data-hub-TRIGGERS\",\n" +
            "  \"schemasDbName\": \"data-hub-SCHEMAS\",\n" +
            "  \"modulesForestsPerHost\": 1,\n" +
            "  \"triggersForestsPerHost\": 1,\n" +
            "  \"schemasForestsPerHost\": 1,\n" +
            "  \"hubRoleName\": \"data-hub-role\",\n" +
            "  \"hubUserName\": \"data-hub-user\",\n" +
            "  \"customForestPath\": \"forests\",\n" +
            "  \"modulePermissions\": \"rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute\",\n" +
            "  \"projectDir\": \"" + projectPath + "\",\n" +
            "  \"jarVersion\": \"" + hubConfig.getJarVersion() + "\",\n" +
            "  \"userModulesDeployTimestampFile\": \"" + projectPath + "/.tmp/user-modules-deploy-timestamps.properties\",\n" +
            "  \"hubEntitiesDir\": \"file://" + projectPath + "/plugins/entities\",\n" +
            "  \"entityDatabaseDir\": \"file://" + projectPath + "/entity-config/databases\",\n" +
            "  \"hubModulesDeployTimestampFile\": \"" + projectPath + "/.tmp/hub-modules-deploy-timestamps.properties\",\n" +
            "  \"userContentDeployTimestampFile\": \"" + projectPath + "/.tmp/user-content-deploy-timestamps.properties\",\n" +
            "  \"hubPluginsDir\": \"file://" + projectPath + "/plugins\",\n" +
            "  \"hubConfigDir\": \"file://" + projectPath + "/hub-internal-config\",\n" +
            "  \"hubDatabaseDir\": \"file://" + projectPath + "/hub-internal-config/databases\",\n" +
            "  \"hubServersDir\": \"file://" + projectPath + "/hub-internal-config/servers\",\n" +
            "  \"hubSecurityDir\": \"file://" + projectPath + "/hub-internal-config/security\",\n" +
            "  \"userSecurityDir\": \"file://" + projectPath + "/user-config/security\",\n" +
            "  \"userConfigDir\": \"file://" + projectPath + "/user-config\",\n" +
            "  \"userDatabaseDir\": \"file://" + projectPath + "/user-config/databases\",\n" +
            "  \"userServersDir\": \"file://" + projectPath + "/user-config/servers\",\n" +
            "  \"hubMimetypesDir\": \"file://" + projectPath + "/hub-internal-config/mimetypes\"\n" +
            "}";
        assertThat(json.write(hubConfig)).isEqualToJson(expected);
    }
}
