package com.marklogic.gradle.task

import com.marklogic.client.DatabaseClientFactory
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager
import org.gradle.testkit.runner.UnexpectedBuildFailure

import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS


class TlsTest extends BaseTest {
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

                    manageClient.putJson("/manage/v2/servers/Admin/properties?group-id=Default", '{"ssl-certificate-template": "admin-cert","ssl-allow-sslv3": false, "ssl-allow-tls": true, "ssl-disable-sslv3": true, "ssl-disable-tlsv1": true, "ssl-disable-tlsv1-1": true, "ssl-disable-tlsv1-2": false}')
                    adminManager.waitForRestart()
                    manageClient.putJson("/manage/v2/servers/App-Services/properties?group-id=Default", '{"ssl-certificate-template": "admin-cert","ssl-allow-sslv3": false, "ssl-allow-tls": true, "ssl-disable-sslv3": true, "ssl-disable-tlsv1": true, "ssl-disable-tlsv1-1": true, "ssl-disable-tlsv1-2": false}')
                    adminManager.waitForRestart()
                    manageClient.putJson("/manage/v2/servers/Manage/properties?group-id=Default", '{"ssl-certificate-template": "admin-cert","ssl-allow-sslv3": false, "ssl-allow-tls": true, "ssl-disable-sslv3": true, "ssl-disable-tlsv1": true, "ssl-disable-tlsv1-1": true, "ssl-disable-tlsv1-2": false}')
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

            // there is a bug in ML 8 that won't unset the ssl
            def disableSSL(appConfig, serverName) {
                def eval = appConfig.newAppServicesDatabaseClient().newServerEval()
                def xqy = """
                    import module namespace admin = "http://marklogic.com/xdmp/admin" at "/MarkLogic/admin.xqy";
                    let \\$config := admin:get-configuration()
                    let \\$appServer := admin:appserver-get-id(\\$config, admin:group-get-id(\\$config, "Default"), "\${serverName}")
                    let \\$config := admin:appserver-set-ssl-certificate-template(\\$config, \\$appServer, 0)
                    return
                        admin:save-configuration(\\$config)
                    """
                def result = eval.xquery(xqy).eval()
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

            import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager
            import com.marklogic.client.DatabaseClientFactory
            import javax.net.ssl.SSLContext
            import javax.net.ssl.TrustManager
            import javax.net.ssl.X509TrustManager
            import org.apache.http.conn.ssl.AllowAllHostnameVerifier

            def newSslContext = SSLContext.getInstance("TLSv1.2")
            newSslContext.init(null, [new SimpleX509TrustManager()] as TrustManager[], null)
            def verifier = new AllowAllHostnameVerifier()

            ext {
                mlAppConfig {
                    appServicesSslContext = newSslContext
                    appServicesSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY 
                    restSslContext = newSslContext
                    restSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
                }

                mlManageConfig {
                    sslContext = newSslContext
                    hostnameVerifier = verifier
                }

                mlAdminConfig {
                    sslContext = newSslContext
                    hostnameVerifier = verifier
                }
                
                hubConfig {
                    stagingSslContext = newSslContext
                    stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
                    
                    finalSslContext = newSslContext
                    finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
                    
                    traceSslContext = newSslContext
                    traceSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
                    
                    jobSslContext = newSslContext
                    jobSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
                }

                mlManageClient.setManageConfig(mlManageConfig)
                mlAdminManager.setAdminConfig(mlAdminConfig)
                
                hubConfig.setAppConfig(mlAppConfig, true)
            }
        '''

        def result = runTask("hubInit")
        copyResourceToFile("tls-test/my-template.xml", new File(testProjectDir.root, "user-config/security/certificate-templates/my-template.xml"))
        copyResourceToFile("tls-test/ssl-server.json", new File(testProjectDir.root, "user-config/servers/final-server.json"))
        copyResourceToFile("tls-test/ssl-server.json", new File(testProjectDir.root, "user-config/servers/job-server.json"))
        copyResourceToFile("tls-test/ssl-server.json", new File(testProjectDir.root, "user-config/servers/staging-server.json"))
        copyResourceToFile("tls-test/ssl-server.json", new File(testProjectDir.root, "user-config/servers/trace-server.json"))
        createProperties()
        result = runTask("enableSSL")
        print(result.output)
    }

    def cleanupSpec() {
        runTask("mlUndeploy", "-Pconfirm=true")
        runTask("disableSSL")
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
        # mlAdminSimpleSsl=true
        # mlManageSimpleSsl=true
        # mlAppServicesSimpleSsl=true

        mlStagingSimpleSsl=false
        mlFinalSimpleSsl=false
        mlTraceSimpleSsl=false
        mlJobSimpleSsl=false
        
        """
    }

    def "bootstrap a project with ssl out the wazoo"() {
        when:
        def result = runTask('mlDeploy', '-i')
        def newSslContext = SSLContext.getInstance("TLSv1.2")
        newSslContext.init(null, [new SimpleX509TrustManager()] as TrustManager[], null)
        hubConfig().stagingSslContext = newSslContext
        hubConfig().stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        print(result.output)

        then:
        notThrown(UnexpectedBuildFailure)
        def modCount = getModulesDocCount()
        modCount == 25 || modCount == 5
        result.task(":mlDeploy").outcome == SUCCESS
    }
}
