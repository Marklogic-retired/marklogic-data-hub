/*
 * Copyright (c) 2020 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.DatabaseClientFactory.SSLHostnameVerifier;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.*;
import com.marklogic.client.io.marker.AbstractReadHandle;
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.Versions;
import com.marklogic.hub.legacy.LegacyDebugging;
import com.marklogic.hub.legacy.LegacyTracing;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.legacy.impl.LegacyFlowManagerImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.test.AbstractHubTest;
import com.marklogic.hub.test.HubConfigInterceptor;
import com.marklogic.hub.util.ComboListener;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.annotation.Autowired;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.net.ssl.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;


@SuppressWarnings("deprecation")
/**
 * Do not extend this class - extend AbstractHubCoreTest for core tests, and for subprojects that depend on the core
 * project, check the subproject for an existing extension of this that you should extend.
 */
public class HubTestBase extends AbstractHubTest {

    @Autowired
    protected HubConfigInterceptor hubConfigInterceptor;

    /**
     * This is a misleading name; it's really "the current HubConfig being used by tests". It's actually rarely a user
     * with the admin role; it's most often a user with the flow-developer-role role, which has the manage-admin role.
     * But it can be changed at any point by any test.
     */
    @Autowired
    protected HubConfigImpl adminHubConfig;

    @Autowired
    protected DataHubImpl dataHub;

    @Autowired
    protected Versions versions;

    @Autowired
    protected Scaffolding scaffolding;

    @Autowired
    protected MappingManager mappingManager;

    @Autowired
    protected LegacyFlowManagerImpl fm;

    public String host;
    public int stagingPort;
    public int finalPort;
    public int jobPort;
    public String user;
    public String password;
    public String manageUser;
    public String managePassword;
    public String secUser;
    public String secPassword;
    public static String flowRunnerUser;
    public static String flowRunnerPassword;
    protected Authentication stagingAuthMethod;
    protected Authentication jobAuthMethod;
    protected Authentication finalAuthMethod;
    public DatabaseClient stagingClient = null;
    public DatabaseClient flowRunnerClient = null;
    // this is needed for some evals in the test suite that are not mainline tests.
    public DatabaseClient stagingModulesClient = null;
    public DatabaseClient finalSchemasClient = null;
    public DatabaseClient stagingSchemasClient = null;
    public DatabaseClient finalClient = null;
    public DatabaseClient finalFlowRunnerClient = null;
    public DatabaseClient jobClient = null;
    public DatabaseClient jobModulesClient = null;
    public Boolean isHostLoadBalancer = false;
    private AppConfig appConfig = null;
    private AdminConfig adminConfig = null;
    private ManageConfig manageConfig = null;
    private ManageClient manageClient = null;
    private static boolean sslRun = false;
    private static boolean certAuth = false;
    public static SSLContext certContext;
    static SSLContext flowDevelopercertContext;
    static SSLContext flowOperatorcertContext;
    public GenericDocumentManager stagingDocMgr;
    public GenericDocumentManager flowRunnerDocMgr;
    public GenericDocumentManager finalDocMgr;
    public JSONDocumentManager jobDocMgr;
    public GenericDocumentManager modMgr;
    static TrustManagerFactory tmf;

    static {
        try {
            installCARootCertIntoStore(getResourceFile("ssl/ca-cert.crt"));
            certContext = createSSLContext(getResourceFile("ssl/client-cert.p12"));
            flowDevelopercertContext = createSSLContext(getResourceFile("ssl/client-flow-developer.p12"));
            flowOperatorcertContext = createSSLContext(getResourceFile("ssl/client-flow-operator.p12"));
        } catch (Exception e) {
            throw new DataHubConfigurationException("Root ca not loaded", e);
        }
    }

    @Override
    protected HubClient getHubClient() {
        return getHubConfig().newHubClient();
    }

    @Override
    protected HubConfigImpl getHubConfig() {
        return adminHubConfig;
    }

    @Override
    protected File getTestProjectDirectory() {
        return getHubProject().getProjectDir().toFile();
    }

    protected void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ex) {
            logger.warn("Caught unexpected InterruptedException while sleeping: " + ex.getMessage());
        }
    }

    @AfterEach
    protected void afterEachHubTestBaseTest(TestInfo testInfo) {
        final String testId = testInfo.getDisplayName();
        final String host = getHubConfig().getHost();
        logger.info("Finishing: " + testId);
        hubConfigInterceptor.returnHubConfig(Thread.currentThread().getName());
        logger.info("Returned HubConfig for host: " + host + "; test: " + testId);
    }

    /**
     * Invoked by the containing {@code BeanFactory} after it has set all bean properties
     * and satisfied {@link BeanFactoryAware}, {@code ApplicationContextAware} etc.
     * <p>This method allows the bean instance to perform validation of its overall
     * configuration and final initialization when all bean properties have been set.
     */
    @BeforeEach
    protected void beforeEachHubTestBaseTest(TestInfo testInfo) {
        final String testId = testInfo.getDisplayName();
        logger.info("Starting: " + testId);
        hubConfigInterceptor.borrowHubConfig(Thread.currentThread().getName());
        logger.info("Borrowed HubConfig for host: " + getHubConfig().getHost() + "; test: " + testId);

        Properties properties = hubConfigInterceptor.getHubConfigObjectFactory().getGradleProperties();

        boolean sslStaging = Boolean.parseBoolean(properties.getProperty("mlStagingSimpleSsl"));
        boolean sslJob = Boolean.parseBoolean(properties.getProperty("mlJobSimpleSsl"));
        boolean sslFinal = Boolean.parseBoolean(properties.getProperty("mlFinalSimpleSsl"));
        if (sslStaging && sslJob && sslFinal) {
            setSslRun(true);
        }

        // Need to use the host from the HubConfigImpl that we just obtained, not from properties
        host = getHubConfig().getHost();

        stagingPort = Integer.parseInt(properties.getProperty("mlStagingPort"));
        jobPort = Integer.parseInt(properties.getProperty("mlJobPort"));
        finalPort = Integer.parseInt(properties.getProperty("mlFinalPort"));
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");
        manageUser = properties.getProperty("mlManageUsername");
        managePassword = properties.getProperty("mlManagePassword");
        secUser = properties.getProperty("mlSecurityUsername");
        secPassword = properties.getProperty("mlSecurityPassword");
        flowRunnerUser = properties.getProperty("mlFlowOperatorUserName");
        flowRunnerPassword = properties.getProperty("mlFlowOperatorPassword");
        String isHostLB = properties.getProperty("mlIsHostLoadBalancer");
        if (isHostLB != null) {
            isHostLoadBalancer = Boolean.parseBoolean(isHostLB);
        }

        //TODO refactor to new JCL Security context
        String auth = properties.getProperty("mlStagingAuth");
        if (auth != null) {
            stagingAuthMethod = Authentication.valueOf(auth.toUpperCase());
        } else {
            stagingAuthMethod = Authentication.DIGEST;
        }
        auth = properties.getProperty("mlFinalAuth");
        if (auth != null) {
            finalAuthMethod = Authentication.valueOf(auth.toUpperCase());
        } else {
            finalAuthMethod = Authentication.DIGEST;
        }

        auth = properties.getProperty("mlJobAuth");
        if (auth != null) {
            jobAuthMethod = Authentication.valueOf(auth.toUpperCase());
        } else {
            jobAuthMethod = Authentication.DIGEST;
        }
        if (jobAuthMethod.equals(Authentication.CERTIFICATE)
            && stagingAuthMethod.equals(Authentication.CERTIFICATE)) {
            setCertAuth(true);
        }

        // Until we can get rid of all the state below, need to construct these objects as a flow-developer
        runAsFlowDeveloper();

        try {
            stagingClient = getClient(host, stagingPort, HubConfig.DEFAULT_STAGING_NAME, user, password, stagingAuthMethod);
            flowRunnerClient = getClient(host, stagingPort, HubConfig.DEFAULT_STAGING_NAME, flowRunnerUser, flowRunnerPassword, stagingAuthMethod);
            finalFlowRunnerClient = getClient(host, stagingPort, HubConfig.DEFAULT_FINAL_NAME, flowRunnerUser, flowRunnerPassword, stagingAuthMethod);
            stagingModulesClient = getClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, manageUser, managePassword, stagingAuthMethod);
            // NOTE finalClient must use staging port and final database to use DHF enode code.
            finalClient = getClient(host, stagingPort, HubConfig.DEFAULT_FINAL_NAME, user, password, finalAuthMethod);
            finalSchemasClient = getClient(host, stagingPort, HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, user, password, finalAuthMethod);
            stagingSchemasClient = getClient(host, stagingPort, HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, user, password, stagingAuthMethod);
            jobClient = getClient(host, jobPort, HubConfig.DEFAULT_JOB_NAME, user, password, jobAuthMethod);
            jobModulesClient = getClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, manageUser, managePassword, jobAuthMethod);
        } catch (Exception e) {
            throw new RuntimeException("Unable to create client objects: " + e.getMessage(), e);
        }
        stagingDocMgr = stagingClient.newDocumentManager();
        flowRunnerDocMgr = flowRunnerClient.newDocumentManager();
        finalDocMgr = finalClient.newDocumentManager();
        jobDocMgr = jobClient.newJSONDocumentManager();
        modMgr = stagingModulesClient.newDocumentManager();

        if (isSslRun() || isCertAuth()) {
            certInit();
        }
    }

    protected DatabaseClient getClient(String host, int port, String dbName, String user, String password, Authentication authMethod) {
        if (isHostLoadBalancer) {
            if (isCertAuth()) {
                return DatabaseClientFactory.newClient(
                    host, port, dbName,
                    new DatabaseClientFactory.CertificateAuthContext((flowRunnerUser.equals(user)) ? flowOperatorcertContext : flowDevelopercertContext, SSLHostnameVerifier.ANY),
                    DatabaseClient.ConnectionType.GATEWAY);
            } else if (isSslRun()) {
                switch (authMethod) {
                    case DIGEST:
                        return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.DigestAuthContext(user, password)
                                .withSSLHostnameVerifier(SSLHostnameVerifier.ANY)
                                .withSSLContext(SimpleX509TrustManager.newSSLContext(), new SimpleX509TrustManager()),
                            DatabaseClient.ConnectionType.GATEWAY);
                    case BASIC:
                        return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.BasicAuthContext(user, password).withSSLHostnameVerifier(SSLHostnameVerifier.ANY),
                            DatabaseClient.ConnectionType.GATEWAY);
                }
            } else {
                switch (authMethod) {
                    case DIGEST:
                        return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.DigestAuthContext(user, password), DatabaseClient.ConnectionType.GATEWAY);
                    case BASIC:
                        return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.BasicAuthContext(user, password), DatabaseClient.ConnectionType.GATEWAY);
                }
            }
        } else {
            if (isCertAuth()) {
                /*certContext = createSSLContext(getResourceFile("ssl/client-cert.p12"));
                flowDevelopercertContext = createSSLContext(getResourceFile("ssl/client-flow-developer.p12"));
                flowOperatorcertContext = createSSLContext(getResourceFile("ssl/client-flow-operator.p12"));*/
                return DatabaseClientFactory.newClient(
                    host, port, dbName,
                    new DatabaseClientFactory.CertificateAuthContext((flowRunnerUser.equals(user) ? flowOperatorcertContext : flowDevelopercertContext), SSLHostnameVerifier.ANY));
            } else if (isSslRun()) {
                switch (authMethod) {
                    case DIGEST:
                        return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.DigestAuthContext(user, password)
                            .withSSLHostnameVerifier(SSLHostnameVerifier.ANY)
                            .withSSLContext(SimpleX509TrustManager.newSSLContext(), new SimpleX509TrustManager()));
                    case BASIC:
                        return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.BasicAuthContext(user, password)
                            .withSSLHostnameVerifier(SSLHostnameVerifier.ANY)
                            .withSSLContext(SimpleX509TrustManager.newSSLContext(), new SimpleX509TrustManager()));
                }
            } else {
                switch (authMethod) {
                    case DIGEST:
                        return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.DigestAuthContext(user, password));
                    case BASIC:
                        return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.BasicAuthContext(user, password));
                }
            }
        }
        return null;  // unreachable
    }

    public static boolean isCertAuth() {
        return certAuth;
    }

    public void setCertAuth(boolean certAuth) {
        this.certAuth = certAuth;
    }

    public static boolean isSslRun() {
        return sslRun;
    }

    public void setSslRun(boolean sslRun) {
        this.sslRun = sslRun;
    }

    protected void enableDebugging() {
        LegacyDebugging.create(stagingClient).enable();
    }

    protected void disableDebugging() {
        LegacyDebugging.create(stagingClient).disable();
    }

    protected void enableTracing() {
        LegacyTracing.create(stagingClient).enable();
    }

    protected void disableTracing() {
        LegacyTracing.create(stagingClient).disable();
    }

    /**
     * Returns a HubConfigImpl with a username/password that is flow-developer/password, unless mlUsername and mlPassword
     * have been modified in the gradle.properties file for this project.
     *
     * @return
     */
    protected HubConfigImpl getDataHubAdminConfig() {
        if (isSslRun() || isCertAuth()) {
            certInit();
        }
        return runAsFlowDeveloper();
    }

    protected HubConfigImpl runAsFlowOperator() {
        return runAsUser(flowRunnerUser, flowRunnerPassword);
    }

    /**
     * The "user" and "password" properties are expected to be set via gradle.properties and, at least as of 5.3.0,
     * are expected to be for a "flow-developer" user.
     *
     * @return
     */
    protected HubConfigImpl runAsFlowDeveloper() {
        return runAsUser(user, password);
    }

    @Override
    protected HubConfigImpl runAsDataHubDeveloper() {
        if (isVersionCompatibleWith520Roles()) {
            return super.runAsDataHubDeveloper();
        }
        logger.warn("ML version is not compatible with 5.2.0 roles, so will run as flow-developer instead of data-hub-developer");
        return runAsFlowDeveloper();
    }

    @Override
    protected HubConfigImpl runAsDataHubOperator() {
        if (isVersionCompatibleWith520Roles()) {
            return super.runAsDataHubOperator();
        }
        logger.warn("ML version is not compatible with 5.2.0 roles, so will run as flow-operator instead of data-hub-operator");
        return runAsFlowOperator();
    }

    @Override
    protected HubConfigImpl runAsUser(String mlUsername, String mlPassword) {
        applyMlUsernameAndMlPassword(mlUsername, mlPassword);

        appConfig = adminHubConfig.getAppConfig();
        manageConfig = adminHubConfig.getManageConfig();
        manageClient = adminHubConfig.getManageClient();
        adminConfig = adminHubConfig.getAdminConfig();
        if (isCertAuth()) {
            appConfig.setAppServicesCertFile("src/test/resources/ssl/client-flow-operator.p12");
            adminHubConfig.setCertFile(DatabaseKind.STAGING, "src/test/resources/ssl/client-flow-operator.p12");
            adminHubConfig.setCertFile(DatabaseKind.FINAL, "src/test/resources/ssl/client-flow-operator.p12");
            adminHubConfig.setSslContext(DatabaseKind.JOB, flowOperatorcertContext);
            manageConfig.setSslContext(flowOperatorcertContext);
            adminConfig.setSslContext(flowOperatorcertContext);

            appConfig.setAppServicesCertPassword("abcd");
            appConfig.setAppServicesTrustManager((X509TrustManager) tmf.getTrustManagers()[0]);
            appConfig.setAppServicesSslHostnameVerifier(SSLHostnameVerifier.ANY);
            appConfig.setAppServicesSecurityContextType(SecurityContextType.CERTIFICATE);
            appConfig.setAppServicesPassword(null);

            adminHubConfig.setTrustManager(DatabaseKind.STAGING, (X509TrustManager) tmf.getTrustManagers()[0]);
            adminHubConfig.setCertPass(DatabaseKind.STAGING, "abcd");

            adminHubConfig.setTrustManager(DatabaseKind.FINAL, (X509TrustManager) tmf.getTrustManagers()[0]);
            adminHubConfig.setCertPass(DatabaseKind.FINAL, "abcd");

            manageConfig.setSecuritySslContext(certContext);
            manageConfig.setPassword(null);
            manageConfig.setSecurityPassword(null);

            adminConfig.setPassword(null);
        }
        // Re-initializes the Manage API connection
        manageClient.setManageConfig(manageConfig);

        // Turning off CMA for resources that have bugs in ML 9.0-7/8
        adminHubConfig.getAppConfig().getCmaConfig().setCombineRequests(false);
        adminHubConfig.getAppConfig().getCmaConfig().setDeployDatabases(false);
        adminHubConfig.getAppConfig().getCmaConfig().setDeployRoles(false);
        adminHubConfig.getAppConfig().getCmaConfig().setDeployUsers(false);

        return adminHubConfig;
    }

    public DataHub getDataHub() {
        return dataHub;
    }

    private void certInit() {
        adminHubConfig.setMlUsername(user);
        adminHubConfig.setMlPassword(password);

        appConfig = adminHubConfig.getAppConfig();
        manageConfig = adminHubConfig.getManageConfig();
        manageClient = adminHubConfig.getManageClient();
        adminConfig = adminHubConfig.getAdminConfig();

        if (isCertAuth()) {

            adminHubConfig.setSslHostnameVerifier(DatabaseKind.STAGING, SSLHostnameVerifier.ANY);
            adminHubConfig.setSslHostnameVerifier(DatabaseKind.FINAL, SSLHostnameVerifier.ANY);
            adminHubConfig.setSslHostnameVerifier(DatabaseKind.JOB, SSLHostnameVerifier.ANY);

            appConfig.setAppServicesCertFile("src/test/resources/ssl/client-flow-developer.p12");
            adminHubConfig.setCertFile(DatabaseKind.STAGING, "src/test/resources/ssl/client-flow-developer.p12");
            adminHubConfig.setCertFile(DatabaseKind.FINAL, "src/test/resources/ssl/client-flow-developer.p12");
            adminHubConfig.setSslContext(DatabaseKind.JOB, flowDevelopercertContext);
            manageConfig.setSslContext(flowDevelopercertContext);
            adminConfig.setSslContext(flowDevelopercertContext);

            appConfig.setAppServicesCertPassword("abcd");
            appConfig.setAppServicesTrustManager((X509TrustManager) tmf.getTrustManagers()[0]);
            appConfig.setAppServicesSslHostnameVerifier(SSLHostnameVerifier.ANY);
            appConfig.setAppServicesSecurityContextType(SecurityContextType.CERTIFICATE);
            appConfig.setAppServicesPassword(null);

            adminHubConfig.setTrustManager(DatabaseKind.STAGING, (X509TrustManager) tmf.getTrustManagers()[0]);
            adminHubConfig.setCertPass(DatabaseKind.STAGING, "abcd");

            adminHubConfig.setTrustManager(DatabaseKind.FINAL, (X509TrustManager) tmf.getTrustManagers()[0]);
            adminHubConfig.setCertPass(DatabaseKind.FINAL, "abcd");

            //manageConfig.setConfigureSimpleSsl(false);
            manageConfig.setSecuritySslContext(certContext);
            manageConfig.setPassword(null);
            manageConfig.setSecurityPassword(null);

            //adminConfig.setConfigureSimpleSsl(false);
            adminConfig.setPassword(null);

        }
        adminHubConfig.setAppConfig(appConfig);
        ((HubConfigImpl) adminHubConfig).setManageConfig(manageConfig);
        manageClient.setManageConfig(manageConfig);
        ((HubConfigImpl) adminHubConfig).setManageClient(manageClient);

        ((HubConfigImpl) adminHubConfig).setAdminConfig(adminConfig);
    }

    public void deleteProjectDir() {
        deleteTestProjectDirectory();
    }

    protected static File getResourceFile(String resourceName) {
        return new File(HubTestBase.class.getClassLoader().getResource(resourceName).getFile());
    }

    protected InputStream getResourceStream(String resourceName) {
        return HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
    }

    protected String getResource(String resourceName) {
        InputStream inputStream = null;
        String output = null;
        try {
            inputStream = getResourceStream(resourceName);
            output = IOUtils.toString(inputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            IOUtils.closeQuietly(inputStream);
        }
        return output;
    }

    protected String getModulesFile(String uri) {
        try {
            String contents = modMgr.read(uri).next().getContent(new StringHandle()).get();
            return contents.replaceFirst("(\\(:|//)\\s+cache\\sbuster:.+\\n", "");
        } catch (IllegalStateException e) {
            return null;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    protected Document getModulesDocument(String uri) {
        return modMgr.read(uri).next().getContent(new DOMHandle()).get();
    }

    protected Document getXmlFromResource(String resourceName) {
        InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
        return getXmlFromInputStream(inputStream);
    }

    protected Document getXmlFromInputStream(InputStream inputStream) {
        Document output = null;
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setIgnoringElementContentWhitespace(true);
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();

            output = builder.parse(inputStream);
        } catch (IOException | SAXException | ParserConfigurationException e) {
            throw new RuntimeException(e);
        } finally {
            IOUtils.closeQuietly(inputStream);
        }
        return output;
    }

    protected JsonNode getJsonFromResource(String resourceName) {
        InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
        try {
            return objectMapper.readTree(inputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected int getStagingDocCount() {
        return getStagingDocCount(null);
    }

    protected int getStagingDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_STAGING_NAME, collection);
    }

    protected int getFinalDocCount() {
        return getFinalDocCount(null);
    }

    protected int getFinalDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_FINAL_NAME, collection);
    }

    protected int getTracingDocCount() {
        return getTracingDocCount("trace");
    }

    protected int getTracingDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_JOB_NAME, collection);
    }

    protected int getJobDocCount() {
        return getJobDocCount("job");
    }

    protected int getJobDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_JOB_NAME, collection);
    }

    protected int getDocCount(String database, String collection) {
        int count = 0;
        String collectionName = "";
        if (collection != null) {
            collectionName = "'" + collection + "'";
        }
        EvalResultIterator resultItr = runInDatabase("xdmp:estimate(fn:collection(" + collectionName + "))", database);
        if (resultItr == null || !resultItr.hasNext()) {
            return count;
        }
        EvalResult res = resultItr.next();
        count = Math.toIntExact((long) res.getNumber());
        return count;
    }

    protected int getDocCountByQuery(String database, String query) {
        int count = 0;
        EvalResultIterator resultItr = runInDatabase("xdmp:estimate(cts:search(fn:collection()," + query + "))", database);
        if (resultItr == null || !resultItr.hasNext()) {
            return count;
        }
        EvalResult res = resultItr.next();
        count = Math.toIntExact((long) res.getNumber());
        return count;
    }

    protected JsonNode getQueryResults(String query, String database) {
        AbstractReadHandle res = runInDatabase(query, database, new JacksonHandle());
        return ((JacksonHandle) res).get();
    }

    /**
     * Excludes provenance documents, as they cannot be deleted by any of the users that run DHF tests.
     * Also excluding hub-core-artifact documents so that these do not need to be reloaded.
     *
     * @param databases
     */
    public void clearDatabases(String... databases) {
        ServerEvaluationCall eval = stagingClient.newServerEval();
        String installer =
            "declare variable $databases external;\n" +
                "for $database in fn:tokenize($databases, \",\")\n" +
                "return\n" +
                "  xdmp:eval('\n" +
                "    cts:uris((),(),cts:not-query(cts:collection-query((\"http://marklogic.com/provenance-services/record\", \"hub-core-artifact\")))) ! xdmp:document-delete(.)\n" +
                "  ',\n" +
                "  (),\n" +
                "  map:entry(\"database\", xdmp:database($database))\n" +
                "  )";
        eval.addVariable("databases", String.join(",", databases));
        EvalResultIterator result = eval.xquery(installer).eval();
        if (result.hasNext()) {
            logger.error(result.next().getString());
        }
    }


    protected void installStagingDoc(String uri, DocumentMetadataHandle meta, String resource) {
        FileHandle handle = new FileHandle(getResourceFile(resource));
        stagingDocMgr.write(uri, meta, handle);
    }

    protected void installFinalDoc(String uri, DocumentMetadataHandle meta, String resource) {
        FileHandle handle = new FileHandle(getResourceFile(resource));
        finalDocMgr.write(uri, meta, handle);
    }

    protected void installJobDoc(String uri, DocumentMetadataHandle meta, String resource) {
        FileHandle handle = new FileHandle(getResourceFile(resource));
        jobDocMgr.write(uri, meta, handle);
    }

    protected void installModules(Map<String, String> modules) {

        DocumentWriteSet writeSet = modMgr.newWriteSet();
        modules.forEach((String path, String localPath) -> {
            InputStreamHandle handle = new InputStreamHandle(HubTestBase.class.getClassLoader().getResourceAsStream(localPath));
            String ext = FilenameUtils.getExtension(path);
            switch (ext) {
                case "xml":
                    handle.setFormat(Format.XML);
                    break;
                case "json":
                    handle.setFormat(Format.JSON);
                    break;
                default:
                    handle.setFormat(Format.TEXT);
            }

            writeSet.add(path, getPermissionsMetaDataHandle(), handle);
        });
        modMgr.write(writeSet);
        writeSet.parallelStream().forEach((writeOp) -> {
            IOUtils.closeQuietly((InputStreamHandle) writeOp.getContent());
        });
        clearFlowCache();
    }

    protected void installModule(String path, String localPath) {
        InputStreamHandle handle = new InputStreamHandle(HubTestBase.class.getClassLoader().getResourceAsStream(localPath));
        String ext = FilenameUtils.getExtension(path);
        switch (ext) {
            case "xml":
                handle.setFormat(Format.XML);
                break;
            case "json":
                handle.setFormat(Format.JSON);
                break;
            default:
                handle.setFormat(Format.TEXT);
        }
        modMgr.write(path, getPermissionsMetaDataHandle(), handle);
        clearFlowCache();
        handle.close();
    }

    protected DocumentMetadataHandle getPermissionsMetaDataHandle() {
        DocumentMetadataHandle permissions = new DocumentMetadataHandle();
        DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();
        documentPermissionsParser.parsePermissions(getDataHubAdminConfig().getModulePermissions(), permissions.getPermissions());
        return permissions;
    }

    protected void clearFlowCache() {
        ServerEvaluationCall eval = stagingClient.newServerEval();
        String installer =
            "xdmp:invoke-function(function() {" +
                "  for $f in xdmp:get-server-field-names()[starts-with(., 'flow-cache-')] " +
                "  return xdmp:set-server-field($f, ())" +
                "}," +
                "<options xmlns=\"xdmp:eval\">" +
                "  <database>{xdmp:modules-database()}</database>" +
                "  <transaction-mode>update-auto-commit</transaction-mode>" +
                "</options>)";

        eval.xquery(installer).eval();
    }

    protected EvalResultIterator runInModules(String query) {
        return runInDatabase(query, HubConfig.DEFAULT_MODULES_DB_NAME);
    }

    protected EvalResultIterator runInDatabase(String query, String databaseName) {
        try {
            return getServerEval(databaseName).xquery(query).eval();
        } catch (FailedRequestException e) {
            logger.error("Failed run code: " + query, e);
            e.printStackTrace();
            throw e;
        }
    }

    protected AbstractReadHandle runInDatabase(String query, String databaseName, AbstractReadHandle handle) {
        try {
            return getServerEval(databaseName).xquery(query).eval(handle);
        } catch (FailedRequestException e) {
            logger.error("Failed run code: " + query, e);
            e.printStackTrace();
            throw e;
        }
    }

    private ServerEvaluationCall getServerEval(String databaseName) {
        return getClientByName(databaseName).newServerEval();
    }

    protected DatabaseClient getClientByName(String databaseName) {
        switch (databaseName) {
            case HubConfig.DEFAULT_FINAL_NAME:
                return finalClient;
            case HubConfig.DEFAULT_MODULES_DB_NAME:
                return stagingModulesClient;
            case HubConfig.DEFAULT_JOB_NAME:
                return jobClient;
            case HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME:
                return finalSchemasClient;
            case HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME:
                return stagingSchemasClient;
            default:
                return stagingClient;
        }
    }

    protected void allCombos(ComboListener listener) {
        CodeFormat[] codeFormats = new CodeFormat[]{CodeFormat.JAVASCRIPT, CodeFormat.XQUERY};
        DataFormat[] dataFormats = new DataFormat[]{DataFormat.JSON, DataFormat.XML};
        FlowType[] flowTypes = new FlowType[]{FlowType.INPUT, FlowType.HARMONIZE};
        Boolean[] useEses = new Boolean[]{false, true};
        for (CodeFormat codeFormat : codeFormats) {
            for (DataFormat dataFormat : dataFormats) {
                for (FlowType flowType : flowTypes) {
                    for (Boolean useEs : useEses) {
                        listener.onCombo(codeFormat, dataFormat, flowType, useEs);
                    }
                }
            }
        }
    }

    public String toJsonString(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public JsonNode outputToJson(List<String> stepOutput, int index, String field) throws Exception {
        JsonNode jsonOutput = objectMapper.readTree(stepOutput.toString());
        return jsonOutput.get(index).get(field);
    }

    protected void assertJsonEqual(String expected, String actual, boolean strict) {
        try {
            JSONAssert.assertEquals(expected, actual, false);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    protected void installHubModules() {
        logger.debug("Installing Data Hub modules into MarkLogic");
        List<Command> commands = new ArrayList<>();
        commands.add(new LoadHubModulesCommand(adminHubConfig));

        SimpleAppDeployer deployer = new SimpleAppDeployer(adminHubConfig.getManageClient(), adminHubConfig.getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(adminHubConfig.getAppConfig());
    }

    /**
     * This loads user artifacts as well, despite the name.
     *
     * @param hubConfig
     * @param force
     */
    protected void installUserModules(HubConfig hubConfig, boolean force) {
        installUserModulesAndArtifacts(hubConfig, force);
    }

    protected void installHubArtifacts(HubConfig hubConfig, boolean force) {
        List<Command> commands = new ArrayList<>();
        commands.add(new LoadHubArtifactsCommand(adminHubConfig));

        SimpleAppDeployer deployer = new SimpleAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());
    }

    public void clearUserModules() {
        dataHub.clearUserModules(Arrays.asList("marklogic-unit-test"));
    }

    protected String dhfCert() {
        return new String(
            "<certificate-template-properties xmlns=\"http://marklogic.com/manage\"> <template-name>dhf-cert</template-name><template-description>System Cert</template-description> <key-type>rsa</key-type><key-options/><req><version>0</version><subject><countryName>US</countryName><stateOrProvinceName>CA</stateOrProvinceName><commonName>*.marklogic.com</commonName><emailAddress>fbermude@marklogic.com</emailAddress><localityName>San Carlos</localityName><organizationName>MarkLogic</organizationName><organizationalUnitName>Engineering</organizationalUnitName></subject></req> </certificate-template-properties>");
    }

    private static SSLContext createSSLContext(File certFile) {
        String certPassword = "abcd";
        SSLContext sslContext = null;
        KeyStore keyStore = null;
        KeyManagerFactory keyManagerFactory = null;
        KeyManager[] keyMgr = null;
        try {
            keyManagerFactory = KeyManagerFactory.getInstance("SunX509");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("CertificateAuthContext requires KeyManagerFactory.getInstance(\"SunX509\")");
        }
        try {
            keyStore = KeyStore.getInstance("PKCS12");
        } catch (KeyStoreException e) {
            throw new IllegalStateException("CertificateAuthContext requires KeyStore.getInstance(\"PKCS12\")");
        }
        try {
            FileInputStream certFileStream = new FileInputStream(certFile);
            try {
                keyStore.load(certFileStream, certPassword.toCharArray());
            } finally {
                if (certFileStream != null)
                    certFileStream.close();
            }
            keyManagerFactory.init(keyStore, certPassword.toCharArray());
            keyMgr = keyManagerFactory.getKeyManagers();
            sslContext = SSLContext.getInstance("TLSv1.2");
        } catch (NoSuchAlgorithmException | KeyStoreException e) {
            throw new IllegalStateException("The certificate algorithm used or the Key store "
                + "Service provider Implementaion (SPI) is invalid. CertificateAuthContext "
                + "requires SunX509 algorithm and PKCS12 Key store SPI", e);
        } catch (CertificateException e) {
            throw new IllegalStateException(e);
        } catch (UnrecoverableKeyException e) {
            throw new IllegalStateException(e);
        } catch (FileNotFoundException e) {
            throw new IllegalStateException(e);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
        try {
            sslContext.init(keyMgr, tmf.getTrustManagers(), null);
        } catch (KeyManagementException e) {
            e.printStackTrace();
        }
        return sslContext;

    }

    private static void installCARootCertIntoStore(File caRootCert) {
        try (InputStream keyInputStream = new ByteArrayInputStream(FileUtils.readFileToByteArray(caRootCert))) {
            X509Certificate caCert = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(new BufferedInputStream(keyInputStream));
            tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            KeyStore ks = KeyStore.getInstance(KeyStore.getDefaultType());
            ks.load(null);
            ks.setCertificateEntry("caCert", caCert);
            tmf.init(ks);
        } catch (CertificateException e) {
            throw new DataHubConfigurationException(e);
        } catch (NoSuchAlgorithmException e) {
            throw new DataHubConfigurationException(e);
        } catch (KeyStoreException e) {
            throw new DataHubConfigurationException(e);
        } catch (IOException e) {
            throw new DataHubConfigurationException(e);
        }
    }

    protected String getTimezoneString() {
        StringHandle strHandle = new StringHandle();
        runInDatabase("sem:timezone-string(fn:current-dateTime())", HubConfig.DEFAULT_FINAL_NAME, strHandle);
        return strHandle.get();
    }

    /**
     * These assertions are made in several tests, so this method is in this class to avoid duplicating them.
     */
    protected void verifyCollectionCountsFromRunningTestFlow() {
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll"));
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-coll"));
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-tab-coll"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "json-coll"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "json-map"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map"));
    }

    /**
     * Convenience method for verifying that the test-data-hub-user user can't do something.
     *
     * @param r
     */
    protected void verifyTestUserIsForbiddenTo(Runnable r, String reason) {
        runAsTestUser();
        try {
            r.run();
            fail("Expected a failure because the user was forbidden to perform the given action");
        } catch (FailedRequestException ex) {
            assertEquals(403, ex.getServerStatusCode(), "MarkLogic was expected to throw a 403 Forbidden response for " +
                "the following reason: " + reason);
            assertEquals("Forbidden", ex.getServerStatus());
        }
    }

    protected ObjectNode getDatabaseProperties(String database) {
        DatabaseManager mgr = new DatabaseManager(adminHubConfig.getManageClient());
        try {
            return (ObjectNode) objectMapper.readTree(mgr.getPropertiesAsJson(database));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
