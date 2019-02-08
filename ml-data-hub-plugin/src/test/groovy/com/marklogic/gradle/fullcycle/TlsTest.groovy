/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.gradle.fullcycle

import com.marklogic.client.DatabaseClientFactory
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager
import com.marklogic.client.io.DOMHandle
import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.gradle.task.BaseTest
import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.UnexpectedBuildFailure
import spock.lang.Ignore

import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS


class TlsTest extends BaseTest {
    
    def setupSpec() {
        createFullPropertiesFile()
        BaseTest.buildFile = BaseTest.testProjectDir.newFile('build.gradle')
        BaseTest.buildFile << '''
            plugins {
                id 'com.marklogic.ml-data-hub'
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
                    certManager.save(dhfCert())

                    def gtcc = new com.marklogic.appdeployer.command.security.GenerateTemporaryCertificateCommand();
                    gtcc.setTemplateIdOrName("admin-cert");
                    gtcc.setCommonName("localhost");
                    gtcc.execute(new com.marklogic.appdeployer.command.CommandContext(getAppConfig(), manageClient, adminManager));

                    def command = new com.marklogic.appdeployer.command.security.GenerateTemporaryCertificateCommand()
                    command.setTemplateIdOrName("dhf-cert")
                    command.setCommonName("localhost")
                    command.setValidFor(365)
                    command.execute(new com.marklogic.appdeployer.command.CommandContext(getAppConfig(), manageClient, adminManager));
                    
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
                    certManager.delete(dhfCert())
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
            def dhfCert() {
                   return """
                   <certificate-template-properties xmlns="http://marklogic.com/manage">
                    <template-name>dhf-cert</template-name>
                    <template-description>Sample description</template-description>
                    <key-type>rsa</key-type>
                    <key-options />
                    <req>
                    <version>0</version>
                    <subject>
                    <countryName>US</countryName>
                    <stateOrProvinceName>VA</stateOrProvinceName>
                    <localityName>McLean</localityName>
                    <organizationName>MarkLogic</organizationName>
                    <organizationalUnitName>Consulting</organizationalUnitName>
                    <emailAddress>nobody@marklogic.com</emailAddress>
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

                    jobSslContext = newSslContext
                    jobSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
                }

                mlManageClient.setManageConfig(mlManageConfig)
                mlAdminManager.setAdminConfig(mlAdminConfig)
                hubConfig.setAppConfig(mlAppConfig, true)
                hubConfig.refreshProject()
            }
        '''

        def result = runTask("hubInit")
        runTask("hubDeploySecurity")
        writeSSLFiles(new File(BaseTest.testProjectDir.root, "src/main/ml-config/servers/final-server.json"),
            new File("src/test/resources/tls-test/ssl-server.json"))
        writeSSLFiles(new File(BaseTest.testProjectDir.root, "src/main/hub-internal-config/servers/job-server.json"),
            new File("src/test/resources/tls-test/ssl-server.json"))
        writeSSLFiles(new File(BaseTest.testProjectDir.root, "src/main/hub-internal-config/servers/staging-server.json"),
            new File("src/test/resources/tls-test/ssl-server.json"))
       
        createProperties()
        result = runTask("enableSSL")
        print(result.output)
        hubConfig().refreshProject()
    }

    
    def cleanupSpec() {
        runTask("mlUndeploy", "-Pconfirm=true")
        runTask("hubDeploySecurity")
        runTask("disableSSL")
        //runTask("mlUnDeploySecurity")
    }

    void createProperties() {
        BaseTest.propertiesFile = new File(BaseTest.testProjectDir.root, 'gradle.properties')
        BaseTest.propertiesFile << """
        mlAdminScheme=https
        mlManageScheme=https
        # mlAdminSimpleSsl=true
        # mlManageSimpleSsl=true
        # mlAppServicesSimpleSsl=true

        mlStagingSimpleSsl=false
        mlFinalSimpleSsl=false
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
        
        hubConfig().finalSslContext = newSslContext
        hubConfig().finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        print(result.output)

        then:
        notThrown(UnexpectedBuildFailure)
        def modCount = getModulesDocCount()
        //Commenting this out as the number of modules are going to change with new additions in 5
        //modCount == BaseTest.MOD_COUNT_NO_OPTIONS_NO_TRACES
        result.task(":mlDeploy").outcome == SUCCESS
    }

    
    def "runHarmonizeFlow with default src and dest"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
        println(runTask('mlReLoadModules'))
        def newSslContext = SSLContext.getInstance("TLSv1.2")
        newSslContext.init(null, [new SimpleX509TrustManager()] as TrustManager[], null)
        hubConfig().stagingSslContext = newSslContext
        hubConfig().stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        
        hubConfig().finalSslContext = newSslContext
        hubConfig().finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME)

        assert (getStagingDocCount() == 0)
        assert (getFinalDocCount() == 0)

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("my-new-entity");
        installStagingDoc("/employee1.xml", meta, new File("src/test/resources/run-flow-test/employee1.xml").text)
        installStagingDoc("/employee2.xml", meta, new File("src/test/resources/run-flow-test/employee2.xml").text)
        assert (getStagingDocCount() == 2)
        assert (getFinalDocCount() == 0)

        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")

        when:
        println(runTask('hubRunFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-i').getOutput())

        then:
        notThrown(UnexpectedBuildFailure)
        getStagingDocCount() == 2
        getFinalDocCount() == 2
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized1.xml"), hubConfig().newFinalClient().newDocumentManager().read("/employee1.xml").next().getContent(new DOMHandle()).get())
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized2.xml"), hubConfig().newFinalClient().newDocumentManager().read("/employee2.xml").next().getContent(new DOMHandle()).get())
    }

    
    def "runHarmonizeFlow with swapped src and dest"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
        println(runTask('mlReLoadModules'))
        def newSslContext = SSLContext.getInstance("TLSv1.2")
        newSslContext.init(null, [new SimpleX509TrustManager()] as TrustManager[], null)
        hubConfig().stagingSslContext = newSslContext
        hubConfig().stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        hubConfig().finalSslContext = newSslContext
        hubConfig().finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME)
        assert (getStagingDocCount() == 0)
        assert (getFinalDocCount() == 0)

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("my-new-entity");
        installFinalDoc("/employee1.xml", meta, new File("src/test/resources/run-flow-test/employee1.xml").text)
        installFinalDoc("/employee2.xml", meta, new File("src/test/resources/run-flow-test/employee2.xml").text)

        assert (getStagingDocCount() == 0)
        assert (getFinalDocCount() == 2)
        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")

        when:
        println(runTask(
            'hubRunFlow',
            '-PentityName=my-new-entity',
            '-PflowName=my-new-harmonize-flow',
            '-PsourceDB=data-hub-FINAL',
            '-PdestDB=data-hub-STAGING',
            '-i'
        ).getOutput())

        then:
        notThrown(UnexpectedBuildFailure)
        getStagingDocCount() == 2
        getFinalDocCount() == 2

        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized1.xml"), hubConfig().newStagingClient().newDocumentManager().read("/employee1.xml").next().getContent(new DOMHandle()).get())
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized2.xml"), hubConfig().newStagingClient().newDocumentManager().read("/employee2.xml").next().getContent(new DOMHandle()).get())
    }
}
