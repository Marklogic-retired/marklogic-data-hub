/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS


/* this particular test requires bootstrap to run on a clean
   and ssl-enabled database.
 */
class SslTest extends BaseTest {
    def setupSpec() {
        createFullPropertiesFile()
        BaseTest.buildFile = BaseTest.testProjectDir.newFile('build.gradle')
        BaseTest.buildFile << '''
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
        copyResourceToFile("ssl-test/my-template.xml", new File(BaseTest.testProjectDir.root, "user-config/security/certificate-templates/my-template.xml"))
        copyResourceToFile("ssl-test/ssl-server.json", new File(BaseTest.testProjectDir.root, "user-config/servers/final-server.json"))
        copyResourceToFile("ssl-test/ssl-server.json", new File(BaseTest.testProjectDir.root, "user-config/servers/job-server.json"))
        copyResourceToFile("ssl-test/ssl-server.json", new File(BaseTest.testProjectDir.root, "user-config/servers/staging-server.json"))
        createProperties()
        try {
            clearDatabases(hubConfig().DEFAULT_MODULES_DB_NAME)
        } catch (e) {
            //pass
        }
        runTask("enableSSL")
    }

    def cleanupSpec() {
        runTask("mlUndeploy", "-Pconfirm=true")
        runTask("disableSSL", "--stacktrace")
    }


    void createProperties() {
        BaseTest.propertiesFile = new File(BaseTest.testProjectDir.root, 'gradle.properties')
        BaseTest.propertiesFile << """
        mlAdminScheme=https
        mlManageScheme=https
        mlAdminSimpleSsl=true
        mlManageSimpleSsl=true
        mlAppServicesSimpleSsl=true

        mlStagingSimpleSsl=true
        mlFinalSimpleSsl=true
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
        modCount == BaseTest.MOD_COUNT_WITH_TRACE_MODULES || modCount == BaseTest.MOD_COUNT
        result.task(":mlDeploy").outcome == SUCCESS
    }

    def "runHarmonizeFlow with default src and dest"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy').getOutput())
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
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized1.xml"), hubConfig().newFinalManageClient().newDocumentManager().read("/employee1.xml").next().getContent(new DOMHandle()).get())
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized2.xml"), hubConfig().newFinalManageClient().newDocumentManager().read("/employee2.xml").next().getContent(new DOMHandle()).get())
    }

    def "runHarmonizeFlow with swapped src and dest"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy').getOutput())
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

        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized1.xml"), hubConfig().newStagingManageClient().newDocumentManager().read("/employee1.xml").next().getContent(new DOMHandle()).get())
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized2.xml"), hubConfig().newStagingManageClient().newDocumentManager().read("/employee2.xml").next().getContent(new DOMHandle()).get())
    }
}
