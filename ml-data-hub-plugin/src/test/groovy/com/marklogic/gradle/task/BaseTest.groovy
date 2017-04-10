package com.marklogic.gradle.task

import com.marklogic.client.DatabaseClient
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

    static final Logger log = LoggerFactory.getLogger(getClass())
    static final TemporaryFolder testProjectDir = new TemporaryFolder()
    static File buildFile
    static File propertiesFile

    static BuildResult runTask(String... task) {
        log.info("DEBUG: running task " + task)
        return GradleRunner.create()
            .withProjectDir(testProjectDir.root)
            .withArguments(task)
            .withDebug(true)
            .withPluginClasspath()
            .build()
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
        hubConfig.username = "admin";
        hubConfig.password = "admin";
        hubConfig.adminUsername = "admin";
        hubConfig.adminPassword = "admin";
        return hubConfig.newStagingClient()
    }

    static void createBuildFile() {
        String version = new HubConfig(testProjectDir.toString()) .getJarVersion()
        buildFile = testProjectDir.newFile('build.gradle')
        buildFile << """
            plugins {
                id 'com.marklogic.ml-data-hub' version '${version}'
            }
        """
    }

    static void createFullPropertiesFile() {
        propertiesFile = testProjectDir.newFile('gradle.properties')
        propertiesFile << """
            mlHost=localhost
            mlAppName=data-hub

            mlUsername=admin
            mlPassword=admin
            
            mlManageUsername=admin
            mlManagePassword=admin

            mlAdminUsername=admin
            mlAdminPassword=admin


            mlStagingAppserverName=data-hub-STAGING
            mlStagingPort=8010
            mlStagingDbName=data-hub-STAGING
            mlStagingForestsPerHost=4
            mlStagingAuth=digest


            mlFinalAppserverName=data-hub-FINAL
            mlFinalPort=8011
            mlFinalDbName=data-hub-FINAL
            mlFinalForestsPerHost=4
            mlFinalAuth=digest

            mlTraceAppserverName=data-hub-TRACING
            mlTracePort=8012
            mlTraceDbName=data-hub-TRACING
            mlTraceForestsPerHost=1
            mlTraceAuth=digest

            mlJobAppserverName=data-hub-JOB
            mlJobPort=8013
            mlJobDbName=data-hub-JOB
            mlJobForestsPerHost=1
            mlJobAuth=digest

            mlModulesDbName=data-hub-MODULES
            mlTriggersDbName=data-hub-TRIGGERS
            mlSchemasDbName=data-hub-SCHEMAS
        """
    }

    def setupSpec() {
        testProjectDir.create()
        createBuildFile()
        createFullPropertiesFile()
    }
}
