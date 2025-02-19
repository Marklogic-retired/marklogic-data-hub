/*
 * Copyright (c) 2021 MarkLogic Corporation
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

import com.marklogic.gradle.task.BaseTest

class TlsTest extends BaseTest {

    def setupSpec() {
        createFullPropertiesFile()
        BaseTest.buildFile = new File(BaseTest.testProjectDir, 'build.gradle')
        BaseTest.buildFile << '''
buildscript {
    repositories {
        mavenLocal()
        maven { url "https://plugins.gradle.org/m2/" }
        mavenCentral()
    }
    dependencies {
        classpath "com.marklogic:ml-data-hub:6.0-SNAPSHOT"
    }
}
apply plugin: "com.marklogic.ml-data-hub"

task importCertificate() {
    KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType())
    keyStore.load(null, null)

    URL url = new URL("https://localhost:8002/manage/v3")
    HttpsURLConnection conn = (HttpsURLConnection) url.openConnection()
    boolean connected = false
    try {
        conn.connect()
        connected = true
    } catch (Exception e) {
        print(e.toString())
    }
    if (connected) {
        def cert = X509Certificate.getInstance(conn.getServerCertificates()[0].getEncoded())
        try (FileOutputStream fos = new FileOutputStream(projectDir.toPath().resolve("admin-cert.cer").toFile())) {
            fos.write(cert.getEncoded())
        }
        try {
            exec {
                commandLine 'sudo', 'keytool', '-importcert', '-trustcacerts', '-storepass', 'changeit', '-noprompt', '-alias', 'admin-cert', '-file', 'admin-cert.cer', '-keystore', System.getProperty("java.home") + '/lib/security/cacerts'
            }
        } catch (Exception e) {
            print(e.toString())
        }
    }
}

task cleanupCertificate() {
    try {
        exec {
            commandLine 'sudo', 'keytool', '-delete', '-trustcacerts', '-storepass', 'changeit', '-noprompt', '-alias', 'admin-cert', '-keystore', System.getProperty("java.home") + '/lib/security/cacerts'
        }
    } catch (Exception e) {
        print(e.toString())
    }
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
import java.security.KeyStore
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.TrustManagerFactory
import javax.net.ssl.X509TrustManager
import javax.security.cert.Certificate
import javax.security.cert.X509Certificate
import org.apache.http.conn.ssl.AllowAllHostnameVerifier

def newSslContext = SSLContext.getInstance("TLSv1.2")
def simpleTrustManager = new SimpleX509TrustManager();
newSslContext.init(null, [simpleTrustManager] as TrustManager[], null)
def verifier = new AllowAllHostnameVerifier()
// NEVER DO THE FOLLOWING IN PRODUCTION. THIS IS JUST FOR THIS TEST!
SSLContext.setDefault(newSslContext)
HttpsURLConnection.setDefaultSSLSocketFactory(newSslContext.getSocketFactory())
HttpsURLConnection.setDefaultHostnameVerifier(verifier as HostnameVerifier)
ext {
    mlAppConfig {
        appServicesSslContext = newSslContext
        appServicesSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        appServicesTrustManager = simpleTrustManager
        restSslContext = newSslContext
        restSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        restTrustManager = simpleTrustManager
        hostnameVerifier = verifier
    }

    mlManageConfig {
        securitySslContext = newSslContext
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
        stagingTrustManager = simpleTrustManager

        finalSslContext = newSslContext
        finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        finalTrustManager = simpleTrustManager

        jobSslContext = newSslContext
        jobSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY
        jobTrustManager = simpleTrustManager
    }

    mlManageClient.setManageConfig(mlManageConfig)
    mlAdminManager.setAdminConfig(mlAdminConfig)
    hubConfig.refreshProject()
    //Update  HubConfig's AppConfig and ManageClient/Config
    hubConfig.setAppConfig(mlAppConfig, true)
    hubConfig.setManageClient(mlManageClient)

}
        '''

        def result = runTask("hubInit")
        runTask("hubDeploySecurity")
        writeSSLFiles(new File(BaseTest.testProjectDir, "src/main/ml-config/servers/final-server.json"),
            new File("src/test/resources/tls-test/ssl-server.json"))
        writeSSLFiles(new File(BaseTest.testProjectDir, "src/main/hub-internal-config/servers/job-server.json"),
            new File("src/test/resources/tls-test/ssl-server.json"))
        writeSSLFiles(new File(BaseTest.testProjectDir, "src/main/hub-internal-config/servers/staging-server.json"),
            new File("src/test/resources/tls-test/ssl-server.json"))

        createProperties()
        result = runTask("enableSSL")
        print(result.output)
        result = runTask("importCertificate")
        print(result.output)
        hubConfig().refreshProject()
    }


    def cleanupSpec() {
        runTask("mlUndeploy", "-Pconfirm=true")
        runTask("hubDeploySecurity")
        runTask("disableSSL")
        runTask("cleanupCertificate")
        //runTask("mlUnDeploySecurity")
    }

    void createProperties() {
        BaseTest.propertiesFile = new File(BaseTest.testProjectDir, 'gradle.properties')
        BaseTest.propertiesFile << """
        mlAdminScheme=https
        mlManageScheme=https
        mlAdminSimpleSsl=true
        mlManageSimpleSsl=true
        mlAppServicesSimpleSsl=true
        mlSslHostnameVerifier=ANY
        
        mlStagingSimpleSsl=true
        mlFinalSimpleSsl=true
        mlJobSimpleSsl=true
        """
    }


// TODO this test has been verified on a system that can add a self-signed certificate to the truststore. Automation for the pipeline should be resolved
/*
    def "bootstrap a project with ssl out the wazoo"() {
        when:
        def result = runTask("mlDeploy", "-i", "--stacktrace")
        print(result.output)


        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":mlDeploy").outcome == SUCCESS
    }
 */
}
