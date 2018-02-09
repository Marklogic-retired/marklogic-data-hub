package com.marklogic.gradle.task

import com.marklogic.client.DatabaseClientFactory
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager
import org.gradle.testkit.runner.UnexpectedBuildFailure

import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS


class SslTest extends BaseTest {
    def setupSpec() {
        buildFile = testProjectDir.newFile('build.gradle')
        buildFile << '''
            plugins {
                id 'com.marklogic.ml-data-hub'
            }

            ext {
                def command = new com.marklogic.appdeployer.command.security.GenerateTemporaryCertificateCommand()
                command.setTemplateIdOrName("dhf-cert")
                command.setCommonName("localhost")
                command.setValidFor(365)
                mlAppDeployer.commands.add(command)
            }


            task enableSSL(type: com.marklogic.gradle.task.MarkLogicTask) {
                doFirst {
                    def manageConfig = getProject().property("mlManageConfig")
                    manageConfig.setScheme("http")
                    manageConfig.setConfigureSimpleSsl(false)

                    def adminConfig = getProject().property("mlAdminConfig")
                    adminConfig.setScheme("http")
                    adminConfig.setConfigureSimpleSsl(false)

                    def manageClient = new com.marklogic.mgmt.ManageClient(manageConfig)
                    def adminManager = new com.marklogic.mgmt.admin.AdminManager(adminConfig)

                    def certManager = new com.marklogic.mgmt.resource.security.CertificateTemplateManager(manageClient)
                    certManager.save(adminCert())

                    def gtcc = new com.marklogic.appdeployer.command.security.GenerateTemporaryCertificateCommand();
                    gtcc.setTemplateIdOrName("admin-cert");
                    gtcc.setCommonName("localhost");
                    gtcc.execute(new com.marklogic.appdeployer.command.CommandContext(getAppConfig(), manageClient, adminManager));

                    adminConfig = getProject().property("mlAdminConfig")
                    adminConfig.setScheme("https")
                    adminConfig.setConfigureSimpleSsl(true)
                    adminManager = new com.marklogic.mgmt.admin.AdminManager(adminConfig)

                    manageClient.putJson("/manage/v2/servers/Admin/properties?group-id=Default", '{"ssl-certificate-template": "admin-cert","ssl-allow-sslv3": true, "ssl-allow-tls": true, "ssl-disable-sslv3": false, "ssl-disable-tlsv1": false, "ssl-disable-tlsv1-1": false, "ssl-disable-tlsv1-2": false}')
                    adminManager.waitForRestart()
                    manageClient.putJson("/manage/v2/servers/App-Services/properties?group-id=Default", '{"ssl-certificate-template": "admin-cert","ssl-allow-sslv3": true, "ssl-allow-tls": true, "ssl-disable-sslv3": false, "ssl-disable-tlsv1": false, "ssl-disable-tlsv1-1": false, "ssl-disable-tlsv1-2": false}')
                    adminManager.waitForRestart()
                    manageClient.putJson("/manage/v2/servers/Manage/properties?group-id=Default", '{"ssl-certificate-template": "admin-cert","ssl-allow-sslv3": true, "ssl-allow-tls": true, "ssl-disable-sslv3": false, "ssl-disable-tlsv1": false, "ssl-disable-tlsv1-1": false, "ssl-disable-tlsv1-2": false}')
                    adminManager.waitForRestart()
                }
            }

            task disableSSL(type: com.marklogic.gradle.task.MarkLogicTask) {
                doFirst {
                    def manageClient = getManageClient()
                    manageClient.putJson("/manage/v2/servers/Admin/properties?group-id=Default", '{"ssl-certificate-template": ""}')
                    manageClient.putJson("/manage/v2/servers/App-Services/properties?group-id=Default", '{"ssl-certificate-template": ""}')
                    manageClient.putJson("/manage/v2/servers/Manage/properties?group-id=Default", '{"ssl-certificate-template": ""}')
                        
                    def adminConfig = getProject().property("mlAdminConfig")
                    adminConfig.setScheme("http")
                    adminConfig.setConfigureSimpleSsl(false)
                    def adminManager = new com.marklogic.mgmt.admin.AdminManager(adminConfig)
                    adminManager.waitForRestart()
            
                    def manageConfig = getProject().property("mlManageConfig")
                    manageConfig.setScheme("http")
                    manageConfig.setConfigureSimpleSsl(false)
                    def mgClient = new com.marklogic.mgmt.ManageClient(manageConfig)
            
                    def certManager = new com.marklogic.mgmt.resource.security.CertificateTemplateManager(mgClient)
                    certManager.delete(adminCert())
                }
            }

            def adminCert() {
                return """
                    <certificate-template-properties xmlns="http://marklogic.com/manage">
                    <template-name>admin-cert</template-name>
                  <template-description>System Cert</template-description>
                    <key-type>rsa</key-type>
                  <key-options />
                    <req>
                    <version>0</version>
                    <subject>
                      <organizationName>MarkLogic</organizationName>
                    </subject>
                  </req>
                    </certificate-template-properties>
                """
            }

        '''

        runTask("hubInit")
        copyResourceToFile("ssl-test/my-template.xml", new File(testProjectDir.root, "user-config/security/certificate-templates/my-template.xml"))
        copyResourceToFile("ssl-test/ssl-server.json", new File(testProjectDir.root, "user-config/servers/final-server.json"))
        copyResourceToFile("ssl-test/ssl-server.json", new File(testProjectDir.root, "user-config/servers/job-server.json"))
        copyResourceToFile("ssl-test/ssl-server.json", new File(testProjectDir.root, "user-config/servers/staging-server.json"))
        copyResourceToFile("ssl-test/ssl-server.json", new File(testProjectDir.root, "user-config/servers/trace-server.json"))
        createProperties()
        runTask("enableSSL")
    }

    def cleanupSpec() {
        runTask("mlUndeploy", "-Pconfirm=true")
        runTask("disableSSL", "--stacktrace")
    }

    void createProperties() {
        propertiesFile = new File(testProjectDir.root, 'gradle.properties')
        propertiesFile << """
        mlHost=localhost

        mlUsername=admin
        mlPassword=admin

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

        mlJobAppserverName=data-hub-JOBS
        mlJobPort=8013
        mlJobDbName=data-hub-JOBS
        mlJobForestsPerHost=1
        mlJobAuth=digest

        mlModulesDbName=data-hub-MODULES
        mlModulesForestsPerHost=1

        mlTriggersDbName=data-hub-TRIGGERS
        mlTriggersForestsPerHost=1

        mlSchemasDbName=data-hub-SCHEMAS
        mlSchemasForestsPerHost=1

        mlHubUserRole=data-hub-role
        mlHubUserName=data-hub-user
        mlHubUserPassword=bI7'3Ya|&;Ohw.ZzsDY

        mlAdminScheme=https
        mlManageScheme=https
        mlAdminSimpleSsl=true
        mlManageSimpleSsl=true
        mlAppServicesSimpleSsl=true

        mlStagingSimpleSsl=true
        mlFinalSimpleSsl=true
        mlTraceSimpleSsl=true
        mlJobSimpleSsl=true
        """
    }

    def "bootstrap a project with ssl out the wazoo"() {
        when:
        def result = runTask('mlDeploy')
        def newSslContext = SSLContext.getInstance("SSLv3")
        newSslContext.init(null, [new SimpleX509TrustManager()] as TrustManager[], null)
        hubConfig().stagingSslContext = newSslContext
        hubConfig().stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        print(result.output)

        then:
        notThrown(UnexpectedBuildFailure)
        def modCount = getModulesDocCount()
        modCount == MOD_COUNT_WITH_TRACE_MODULES || modCount == MOD_COUNT
        result.task(":mlDeploy").outcome == SUCCESS
    }
}
