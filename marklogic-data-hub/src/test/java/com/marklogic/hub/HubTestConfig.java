package com.marklogic.hub;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import com.marklogic.client.DatabaseClientFactory.SSLHostnameVerifier;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;

import javax.net.ssl.X509TrustManager;
import java.util.Properties;

@Configuration
public class HubTestConfig {

    public static final String PROJECT_PATH = "ye-olde-project";

    @Bean(name = "hubConfig")
    HubConfig getHubConfig() {
        return getHubConfig(PROJECT_PATH, false);
    }

    @Bean(name = "adminHubConfig")
    HubConfig getAdminHubConfig() {
        return getHubConfig(PROJECT_PATH, true);
    }

    public HubConfig getHubConfig(String projectDir, boolean requireAdmin) {

        HubConfigBuilder builder = HubConfigBuilder.newHubConfigBuilder(projectDir)
            .withPropertiesFromEnvironment();

        //override 'mlUsername' and 'mlPassword' with flowRunneruser/password if requireAdmin is false
        //use 'hub-admin-user' else
        if(! requireAdmin) {
            Properties updatedProp = new Properties();
            updatedProp.setProperty("mlUsername", HubTestBase.flowRunnerUser);
            updatedProp.setProperty("mlPassword", HubTestBase.flowRunnerPassword);
            updatedProp.setProperty("mlManageUsername", HubTestBase.flowRunnerUser);
            updatedProp.setProperty("mlManagePassword", HubTestBase.flowRunnerPassword);
            builder.withProperties(updatedProp);
        }

        HubConfig hubConfig = builder.build();
        AppConfig stagingAppConfig = hubConfig.getStagingAppConfig();
        AppConfig finalAppConfig = hubConfig.getFinalAppConfig();
        ManageConfig manageConfig = ((HubConfigImpl)hubConfig).getManageConfig();
        AdminConfig adminConfig = ((HubConfigImpl)hubConfig).getAdminConfig();

        if(HubTestBase.isSslRun() || HubTestBase.isCertAuth()) {
            hubConfig.setScheme(DatabaseKind.STAGING,"https");
            hubConfig.setScheme(DatabaseKind.FINAL,"https");
            hubConfig.setScheme(DatabaseKind.JOB,"https");

            hubConfig.setSslHostnameVerifier(DatabaseKind.STAGING,SSLHostnameVerifier.ANY);
            hubConfig.setSslHostnameVerifier(DatabaseKind.FINAL,SSLHostnameVerifier.ANY);
            hubConfig.setSslHostnameVerifier(DatabaseKind.JOB,SSLHostnameVerifier.ANY);
            manageConfig.setScheme("https");
            adminConfig.setScheme("https");
        }
        if(HubTestBase.isSslRun()) {
            stagingAppConfig.setAppServicesSslContext(SimpleX509TrustManager.newSSLContext());
            stagingAppConfig.setAppServicesSslHostnameVerifier(SSLHostnameVerifier.ANY);

            finalAppConfig.setAppServicesSslContext(SimpleX509TrustManager.newSSLContext());
            finalAppConfig.setAppServicesSslHostnameVerifier(SSLHostnameVerifier.ANY);

            hubConfig.setSimpleSsl(DatabaseKind.STAGING,true);
            hubConfig.setSimpleSsl(DatabaseKind.JOB,true);
            hubConfig.setSimpleSsl(DatabaseKind.FINAL,true);

            hubConfig.setSslContext(DatabaseKind.STAGING,SimpleX509TrustManager.newSSLContext());
            hubConfig.setSslContext(DatabaseKind.FINAL,SimpleX509TrustManager.newSSLContext());
            hubConfig.setSslContext(DatabaseKind.JOB,SimpleX509TrustManager.newSSLContext());

            manageConfig.setConfigureSimpleSsl(true);
            manageConfig.setSslContext(SimpleX509TrustManager.newSSLContext());

            adminConfig.setConfigureSimpleSsl(true);
            adminConfig.setSslContext(SimpleX509TrustManager.newSSLContext());
        }
        if(HubTestBase.isCertAuth()) {
            if(requireAdmin) {
                stagingAppConfig.setAppServicesCertFile("src/test/resources/ssl/client-hub-admin-user.p12");
                finalAppConfig.setAppServicesCertFile("src/test/resources/ssl/client-hub-admin-user.p12");
                hubConfig.setCertFile(DatabaseKind.STAGING, "src/test/resources/ssl/client-hub-admin-user.p12");
                hubConfig.setCertFile(DatabaseKind.FINAL, "src/test/resources/ssl/client-hub-admin-user.p12");
                hubConfig.setSslContext(DatabaseKind.JOB,HubTestBase.datahubadmincertContext);
                manageConfig.setSslContext(HubTestBase.datahubadmincertContext);
                adminConfig.setSslContext(HubTestBase.datahubadmincertContext);
            }
            else {
                stagingAppConfig.setAppServicesCertFile("src/test/resources/ssl/client-data-hub-user.p12");
                finalAppConfig.setAppServicesCertFile("src/test/resources/ssl/client-data-hub-user.p12");
                hubConfig.setCertFile(DatabaseKind.STAGING, "src/test/resources/ssl/client-data-hub-user.p12");
                hubConfig.setCertFile(DatabaseKind.FINAL, "src/test/resources/ssl/client-data-hub-user.p12");
                hubConfig.setSslContext(DatabaseKind.JOB,HubTestBase.flowRunnercertContext);
                manageConfig.setSslContext(HubTestBase.flowRunnercertContext);
                adminConfig.setSslContext(HubTestBase.flowRunnercertContext);
            }
            stagingAppConfig.setAppServicesCertPassword("abcd");
            stagingAppConfig.setAppServicesTrustManager((X509TrustManager) HubTestBase.tmf.getTrustManagers()[0]);
            stagingAppConfig.setAppServicesSslHostnameVerifier(SSLHostnameVerifier.ANY);
            stagingAppConfig.setAppServicesSecurityContextType(SecurityContextType.CERTIFICATE);
            stagingAppConfig.setAppServicesPassword(null);

            finalAppConfig.setAppServicesCertPassword("abcd");
            finalAppConfig.setAppServicesTrustManager((X509TrustManager) HubTestBase.tmf.getTrustManagers()[0]);
            finalAppConfig.setAppServicesSslHostnameVerifier(SSLHostnameVerifier.ANY);
            finalAppConfig.setAppServicesSecurityContextType(SecurityContextType.CERTIFICATE);
            finalAppConfig.setAppServicesPassword(null);

            hubConfig.setAuthMethod(DatabaseKind.STAGING,"certificate");
            hubConfig.setAuthMethod(DatabaseKind.JOB,"certificate");
            hubConfig.setAuthMethod(DatabaseKind.FINAL,"certificate");

            hubConfig.setTrustManager(DatabaseKind.STAGING, (X509TrustManager) HubTestBase.tmf.getTrustManagers()[0]);
            hubConfig.setCertPass(DatabaseKind.STAGING, "abcd");

            hubConfig.setTrustManager(DatabaseKind.FINAL, (X509TrustManager) HubTestBase.tmf.getTrustManagers()[0]);
            hubConfig.setCertPass(DatabaseKind.FINAL, "abcd");

            manageConfig.setConfigureSimpleSsl(false);
            manageConfig.setSecuritySslContext(HubTestBase.certContext);
            manageConfig.setPassword(null);
            manageConfig.setSecurityPassword(null);

            adminConfig.setConfigureSimpleSsl(false);
            adminConfig.setPassword(null);

        }
        hubConfig.setStagingAppConfig(stagingAppConfig);
        hubConfig.setFinalAppConfig(finalAppConfig);
        ((HubConfigImpl)hubConfig).setManageConfig(manageConfig);
        ManageClient manageClient = new ManageClient(manageConfig);
        ((HubConfigImpl)hubConfig).setManageClient(manageClient);

        ((HubConfigImpl)hubConfig).setAdminConfig(adminConfig);
        AdminManager adminManager = new AdminManager(adminConfig);
        ((HubConfigImpl)hubConfig).setAdminManager(adminManager);
        return hubConfig;
    }

}
