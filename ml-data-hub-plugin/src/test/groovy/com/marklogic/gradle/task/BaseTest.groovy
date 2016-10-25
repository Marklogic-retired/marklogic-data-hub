package com.marklogic.gradle.task

import com.marklogic.client.DatabaseClient
import com.marklogic.client.DatabaseClientFactory
import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.BuildResult
import org.gradle.testkit.runner.GradleRunner
import org.junit.Rule
import org.junit.rules.TemporaryFolder
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import spock.lang.Specification

class BaseTest extends Specification {

    public static boolean makeProperties = true;

    final Logger log = LoggerFactory.getLogger(getClass())
    @Rule final TemporaryFolder testProjectDir = new TemporaryFolder()
    File buildFile
    File propertiesFile

    BuildResult runTask(String... task) {
        log.info("DEBUG: running task " + task)
        return GradleRunner.create()
            .withProjectDir(testProjectDir.root)
            .withArguments(task)
            .withDebug(true)
            .withPluginClasspath().build()
    }

    BuildResult runFailTask(String... task) {
        return GradleRunner.create()
            .withProjectDir(testProjectDir.root)
            .withArguments(task)
            .withDebug(true)
            .withPluginClasspath().buildAndFail()
    }

    DatabaseClient stagingClient() {
        HubConfig hubConfig = new HubConfig()
        def authMethod = DatabaseClientFactory.Authentication.valueOf(hubConfig.authMethod.toUpperCase());
        return DatabaseClientFactory.newClient(hubConfig.host, hubConfig.stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, "admin", "admin", authMethod)
    }

    void createBuildFile() {
        buildFile = testProjectDir.newFile('build.gradle')
        buildFile << """
            plugins {
                id 'com.marklogic.ml-data-hub'
            }
        """
    }

    void createFullPropertiesFile() {
        propertiesFile = testProjectDir.newFile('gradle.properties')
        propertiesFile << """
            mlHost=localhost
            mlAppName=data-hub

            mlUsername=admin
            mlPassword=admin
            auth=digest

            mlStagingAppserverName=data-hub-STAGING
            mlStagingPort=8010
            mlStagingDbName=data-hub-STAGING
            mlStagingForestsPerHost=4

            mlFinalAppserverName=data-hub-FINAL
            mlFinalPort=8011
            mlFinalDbName=data-hub-FINAL
            mlFinalForestsPerHost=4

            mlTraceAppserverName=data-hub-TRACING
            mlTracePort=8012
            mlTraceDbName=data-hub-TRACING
            mlTraceForestsPerHost=1

            mlJobAppserverName=data-hub-JOB
            mlJobPort=8013
            mlJobDbName=data-hub-JOB
            mlJobForestsPerHost=1

            mlModulesDbName=data-hub-MODULES
            mlTriggersDbName=data-hub-TRIGGERS
            mlSchemasDbName=data-hub-SCHEMAS
        """
    }

    def setup() {
        createBuildFile()
        createFullPropertiesFile()
    }
}
