/*
 * Copyright 2012-2016 MarkLogic Corporation
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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
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
import com.marklogic.client.io.*;
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.job.impl.JobMonitorImpl;
import com.marklogic.hub.legacy.LegacyDebugging;
import com.marklogic.hub.legacy.LegacyTracing;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.impl.*;
import com.marklogic.hub.legacy.impl.LegacyFlowManagerImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.ComboListener;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.json.JSONException;
import org.skyscreamer.jsonassert.JSONAssert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.annotation.PostConstruct;
import javax.net.ssl.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;


@SuppressWarnings("deprecation")
@Component
public class HubTestBase {

    public static final String PROJECT_PATH = "ye-olde-project";
    @Autowired
    protected ApplicationContext context;

    @Autowired
    protected HubConfigImpl adminHubConfig;

    //@Autowired
    //protected HubConfigImpl hubConfig;

    @Autowired
    protected DataHubImpl dataHub;

    @Autowired
    protected HubProjectImpl project;

    @Autowired
    protected Versions versions;

    @Autowired
    protected LoadHubModulesCommand loadHubModulesCommand;

    @Autowired
    protected LoadUserModulesCommand loadUserModulesCommand;

    @Autowired
    protected LoadUserArtifactsCommand loadUserArtifactsCommand;

    @Autowired
    protected Scaffolding scaffolding;

    @Autowired
    protected MappingManager mappingManager;

    @Autowired
    protected StepManager stepManager;

    @Autowired
    protected LegacyFlowManagerImpl fm;

    @Autowired
    protected JobMonitorImpl jobMonitor;

    // to speedup dev cycle, you can create a hub and set this to true.
    // for true setup/teardown, must be 'false'
    private static boolean isInstalled = false;
    private static int nInstalls = 0;

    static final protected Logger logger = LoggerFactory.getLogger(HubTestBase.class);


    public  String host;
    public  int stagingPort;
    public int finalPort;
    public  int jobPort;
    public  String user;
    public  String password;
    public  String manageUser;
    public  String managePassword;
    public  String secUser;
    public  String secPassword;
    public static String flowRunnerUser;
    public static String flowRunnerPassword;
    protected  Authentication stagingAuthMethod;
    private  Authentication jobAuthMethod;
    protected  Authentication finalAuthMethod;
    public  DatabaseClient stagingClient = null;
    public  DatabaseClient flowRunnerClient = null;
    // this is needed for some evals in the test suite that are not mainline tests.
    public  DatabaseClient stagingModulesClient = null;
    public  DatabaseClient finalSchemasClient = null;
    public  DatabaseClient finalClient = null;
    public  DatabaseClient finalFlowRunnerClient = null;
    public  DatabaseClient jobClient = null;
    public  DatabaseClient jobModulesClient = null;
    public Boolean isHostLoadBalancer = false;
    private AppConfig appConfig = null;
    private  AdminConfig adminConfig = null;
    private  ManageConfig manageConfig = null;
    private  ManageClient manageClient = null;
    private  static boolean sslRun = false;
    private  static boolean certAuth = false;
    public static SSLContext certContext;
    static SSLContext datahubadmincertContext;
    static SSLContext flowRunnercertContext;
    private  Properties properties = new Properties();
    public  GenericDocumentManager stagingDocMgr;
    public  GenericDocumentManager flowRunnerDocMgr;
    public  GenericDocumentManager finalDocMgr;
    public  JSONDocumentManager jobDocMgr;
    public  GenericDocumentManager modMgr;
    public  String bootStrapHost = null;
    static TrustManagerFactory tmf;
    
    static {
        try {
            installCARootCertIntoStore(getResourceFile("ssl/ca-cert.crt"));
            certContext = createSSLContext(getResourceFile("ssl/client-cert.p12"));
            datahubadmincertContext = createSSLContext(getResourceFile("ssl/client-hub-admin-user.p12"));
            flowRunnercertContext = createSSLContext(getResourceFile("ssl/client-data-hub-user.p12"));
            System.setProperty("hubProjectDir", PROJECT_PATH);
        } catch (Exception e) {
            throw new DataHubConfigurationException("Root ca lot loaded", e);
        }
    }



    protected void basicSetup() {
        XMLUnit.setIgnoreWhitespace(true);
        createProjectDir();
    }

    @PostConstruct
    protected void init() {
        //dataHub.initProject();
        createProjectDir();
        adminHubConfig.createProject(PROJECT_PATH);
        if(! project.isInitialized()) {
            adminHubConfig.initHubProject();
        }
        // note the app config loads dhf defaults from classpath
        try {
            Properties p = new Properties();
            InputStream p2 = new FileInputStream("gradle.properties");
            p.load(p2);
            properties.putAll(p);
            p2.close();
        }
        catch (IOException e) {
            System.err.println("Properties file not loaded.");
        }

        // try to load the local environment overrides file
        try {
            Properties p = new Properties();
            InputStream is = new FileInputStream("gradle-local.properties");
            p.load(is);
            properties.putAll(p);
        }
        catch (IOException e) {
            System.err.println("gradle-local.properties file not loaded.");
        }
        boolean sslStaging = Boolean.parseBoolean(properties.getProperty("mlStagingSimpleSsl"));
        boolean sslJob = Boolean.parseBoolean(properties.getProperty("mlJobSimpleSsl"));
        boolean sslFinal = Boolean.parseBoolean(properties.getProperty("mlFinalSimpleSsl"));
        if(sslStaging && sslJob && sslFinal){
            setSslRun(true);
        }

        host = properties.getProperty("mlHost");
        stagingPort = Integer.parseInt(properties.getProperty("mlStagingPort"));
        jobPort = Integer.parseInt(properties.getProperty("mlJobPort"));
        finalPort = Integer.parseInt(properties.getProperty("mlFinalPort"));
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");
        manageUser = properties.getProperty("mlManageUsername");
        managePassword = properties.getProperty("mlManagePassword");
        secUser = properties.getProperty("mlSecurityUsername");
        secPassword = properties.getProperty("mlSecurityPassword");
        flowRunnerUser = properties.getProperty("mlHubUserName");
        flowRunnerPassword = properties.getProperty("mlHubUserPassword");
        String isHostLB = properties.getProperty("mlIsHostLoadBalancer");
        if (isHostLB != null) {
            isHostLoadBalancer = Boolean.parseBoolean(isHostLB);
        }


        //TODO refactor to new JCL Security context
        String auth = properties.getProperty("mlStagingAuth");
        if (auth != null) {
            stagingAuthMethod = Authentication.valueOf(auth.toUpperCase());
        }
        else {
            stagingAuthMethod = Authentication.DIGEST;
        }
        auth = properties.getProperty("mlFinalAuth");
        if (auth != null) {
            finalAuthMethod = Authentication.valueOf(auth.toUpperCase());
        }
        else {
            finalAuthMethod = Authentication.DIGEST;
        }

        auth = properties.getProperty("mlJobAuth");
        if (auth != null) {
            jobAuthMethod = Authentication.valueOf(auth.toUpperCase());
        }
        else {
            jobAuthMethod = Authentication.DIGEST;
        }
        if(jobAuthMethod.equals(Authentication.CERTIFICATE)
        && stagingAuthMethod.equals(Authentication.CERTIFICATE)) {
            setCertAuth(true);
        }
               
        try {
            stagingClient = getClient(host, stagingPort, HubConfig.DEFAULT_STAGING_NAME, user, password, stagingAuthMethod);
            flowRunnerClient = getClient(host, stagingPort, HubConfig.DEFAULT_STAGING_NAME, flowRunnerUser, flowRunnerPassword, stagingAuthMethod);
            finalFlowRunnerClient = getClient(host, stagingPort, HubConfig.DEFAULT_FINAL_NAME, flowRunnerUser, flowRunnerPassword, stagingAuthMethod);
            stagingModulesClient  = getClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, manageUser, managePassword, stagingAuthMethod);
            // NOTE finalClient must use staging port and final database to use DHF enode code.
            finalClient = getClient(host, stagingPort, HubConfig.DEFAULT_FINAL_NAME, user, password, finalAuthMethod);
            finalSchemasClient = getClient(host, stagingPort, HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, user, password, finalAuthMethod);
            jobClient = getClient(host, jobPort, HubConfig.DEFAULT_JOB_NAME, user, password, jobAuthMethod);
            jobModulesClient  = getClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, manageUser, managePassword, jobAuthMethod);
        }
        catch(Exception e) {
            System.err.println("client objects not created.");
            e.printStackTrace();
        }
        stagingDocMgr = stagingClient.newDocumentManager();
        flowRunnerDocMgr = flowRunnerClient.newDocumentManager();
        finalDocMgr = finalClient.newDocumentManager();
        jobDocMgr = jobClient.newJSONDocumentManager();
        modMgr = stagingModulesClient.newDocumentManager();

        adminHubConfig.refreshProject();
        if(isSslRun() || isCertAuth()) {
            certInit();
        }
    }

    protected DatabaseClient getClient(String host, int port, String dbName, String user,String password, Authentication authMethod) throws Exception {
        if (isHostLoadBalancer) {
            if (isCertAuth()) {
                return DatabaseClientFactory.newClient(
                    host, port, dbName,
                    new DatabaseClientFactory.CertificateAuthContext((user == flowRunnerUser) ? flowRunnercertContext : datahubadmincertContext, SSLHostnameVerifier.ANY),
                    DatabaseClient.ConnectionType.GATEWAY);
            } else if (isSslRun()) {
                switch (authMethod) {
                    case DIGEST: return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.DigestAuthContext(user, password)
                            .withSSLHostnameVerifier(SSLHostnameVerifier.ANY)
                            .withSSLContext(SimpleX509TrustManager.newSSLContext(), new SimpleX509TrustManager()),
                        DatabaseClient.ConnectionType.GATEWAY);
                    case BASIC: return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.BasicAuthContext(user, password).withSSLHostnameVerifier(SSLHostnameVerifier.ANY),
                        DatabaseClient.ConnectionType.GATEWAY);
                }
            } else {
                switch (authMethod) {
                    case DIGEST: return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.DigestAuthContext(user, password), DatabaseClient.ConnectionType.GATEWAY);
                    case BASIC: return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.BasicAuthContext(user, password), DatabaseClient.ConnectionType.GATEWAY);
                }
            }
        } else {
            if (isCertAuth()) {
                /*certContext = createSSLContext(getResourceFile("ssl/client-cert.p12"));
                datahubadmincertContext = createSSLContext(getResourceFile("ssl/client-hub-admin-user.p12"));
                flowRunnercertContext = createSSLContext(getResourceFile("ssl/client-data-hub-user.p12"));*/
                return DatabaseClientFactory.newClient(
                    host, port, dbName,
                    new DatabaseClientFactory.CertificateAuthContext((user == flowRunnerUser) ? flowRunnercertContext : datahubadmincertContext, SSLHostnameVerifier.ANY));
            } else if (isSslRun()) {
                switch (authMethod) {
                    case DIGEST: return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.DigestAuthContext(user, password)
                            .withSSLHostnameVerifier(SSLHostnameVerifier.ANY)
                            .withSSLContext(SimpleX509TrustManager.newSSLContext(), new SimpleX509TrustManager()));
                    case BASIC: return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.BasicAuthContext(user, password)
                            .withSSLHostnameVerifier(SSLHostnameVerifier.ANY)
                            .withSSLContext(SimpleX509TrustManager.newSSLContext(), new SimpleX509TrustManager()));
                }
            } else {
                switch (authMethod) {
                    case DIGEST: return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.DigestAuthContext(user, password));
                    case BASIC: return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.BasicAuthContext(user, password));
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

    protected HubConfig getHubAdminConfig(String projectDir) {
        if (isSslRun() || isCertAuth()) {
            certInit();
        }
        adminHubConfig.setMlUsername(user);
        adminHubConfig.setMlPassword(password);
        wireClients();
        return adminHubConfig;
    }

    protected HubConfigImpl getHubAdminConfig() {
        if (isSslRun() || isCertAuth()) {
            certInit();
        }
        adminHubConfig.setMlUsername(user);
        adminHubConfig.setMlPassword(password);
        wireClients();
        return adminHubConfig;
    }

    protected HubConfigImpl getHubFlowRunnerConfig() {
        adminHubConfig.setMlUsername(flowRunnerUser);
        adminHubConfig.setMlPassword(flowRunnerPassword);
        appConfig = adminHubConfig.getAppConfig();
        manageConfig = ((HubConfigImpl)adminHubConfig).getManageConfig();
        manageClient = ((HubConfigImpl)adminHubConfig).getManageClient();
        adminConfig = ((HubConfigImpl)adminHubConfig).getAdminConfig();
        if(isCertAuth()) {
            appConfig.setAppServicesCertFile("src/test/resources/ssl/client-data-hub-user.p12");
            adminHubConfig.setCertFile(DatabaseKind.STAGING, "src/test/resources/ssl/client-data-hub-user.p12");
            adminHubConfig.setCertFile(DatabaseKind.FINAL, "src/test/resources/ssl/client-data-hub-user.p12");
            adminHubConfig.setSslContext(DatabaseKind.JOB,flowRunnercertContext);
            manageConfig.setSslContext(flowRunnercertContext);
            adminConfig.setSslContext(flowRunnercertContext);   
                     
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
        ((HubConfigImpl)adminHubConfig).setManageConfig(manageConfig);
        manageClient.setManageConfig(manageConfig);
        ((HubConfigImpl)adminHubConfig).setManageClient(manageClient);
        ((HubConfigImpl)adminHubConfig).setAdminConfig(adminConfig);
        wireClients();
        return adminHubConfig;
    }

    public DataHub getDataHub() {
        return dataHub;
    }


    public void createProjectDir() {
        createProjectDir(PROJECT_PATH);
    }

    // this method creates a project dir and copies the gradle.properties in.
    public void createProjectDir(String projectDirName) {
        try {
            File projectDir = new File(projectDirName);
            if (!projectDir.isDirectory() || !projectDir.exists()) {
                projectDir.mkdirs();                
            }
                    
            // force module loads for new test runs.
            File timestampDirectory = new File(projectDir + "/.tmp");
            if ( timestampDirectory.exists() ) {
                FileUtils.forceDelete(timestampDirectory);
            }
            File finalTimestampDirectory = new File( "build/ml-javaclient-util");
            if ( finalTimestampDirectory.exists() ) {
                FileUtils.forceDelete(finalTimestampDirectory);
            }
            Path devProperties = Paths.get(".").resolve("gradle.properties");
            Path projectProperties = projectDir.toPath().resolve("gradle.properties");
            Files.copy(devProperties, projectProperties, REPLACE_EXISTING);

        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
        // note at this point the properties from the project have not been  read.  maybe
        // props reading should be in this directory...
    }
    private void certInit() {
        adminHubConfig.setMlUsername(user);
        adminHubConfig.setMlPassword(password);
                
        appConfig = adminHubConfig.getAppConfig();
        manageConfig = ((HubConfigImpl)adminHubConfig).getManageConfig();
        manageClient = ((HubConfigImpl)adminHubConfig).getManageClient();
        adminConfig = ((HubConfigImpl)adminHubConfig).getAdminConfig();

        if(isCertAuth()) {
            
            adminHubConfig.setSslHostnameVerifier(DatabaseKind.STAGING,SSLHostnameVerifier.ANY);
            adminHubConfig.setSslHostnameVerifier(DatabaseKind.FINAL,SSLHostnameVerifier.ANY);
            adminHubConfig.setSslHostnameVerifier(DatabaseKind.JOB,SSLHostnameVerifier.ANY);
            
            appConfig.setAppServicesCertFile("src/test/resources/ssl/client-hub-admin-user.p12");
            adminHubConfig.setCertFile(DatabaseKind.STAGING, "src/test/resources/ssl/client-hub-admin-user.p12");
            adminHubConfig.setCertFile(DatabaseKind.FINAL, "src/test/resources/ssl/client-hub-admin-user.p12");
            adminHubConfig.setSslContext(DatabaseKind.JOB,datahubadmincertContext);
            manageConfig.setSslContext(datahubadmincertContext);
            adminConfig.setSslContext(datahubadmincertContext);
            
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
        ((HubConfigImpl)adminHubConfig).setManageConfig(manageConfig);
        manageClient.setManageConfig(manageConfig);
        ((HubConfigImpl)adminHubConfig).setManageClient(manageClient);

        ((HubConfigImpl)adminHubConfig).setAdminConfig(adminConfig);
        wireClients();
    }
    
    public void deleteProjectDir() {
        if (new File(PROJECT_PATH).exists()) {
            try {
                FileUtils.forceDelete(new File(PROJECT_PATH));
            } catch (IOException e) {
                logger.warn("Unable to delete the project directory", e);
            }
        }
    }
    protected static File getResourceFile(String resourceName) {
        return new File(HubTestBase.class.getClassLoader().getResource(resourceName).getFile());
    }

    protected InputStream getResourceStream(String resourceName) {
        return HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
    }

    protected String getResource(String resourceName) {
        try {
            InputStream inputStream = getResourceStream(resourceName);
            return IOUtils.toString(inputStream);
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected String getModulesFile(String uri) {
        try {
            String contents = modMgr.read(uri).next().getContent(new StringHandle()).get();
            return contents.replaceFirst("(\\(:|//)\\s+cache\\sbuster:.+\\n", "");
        }
        catch (IllegalStateException e){
            return null;
        }
        catch(Exception e) {
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
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setIgnoringElementContentWhitespace(true);
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();

            return builder.parse(inputStream);
        } catch (IOException | SAXException | ParserConfigurationException e) {
            throw new RuntimeException(e);
        }
    }

    protected JsonNode getJsonFromResource(String resourceName) {
        InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
        ObjectMapper om = new ObjectMapper();
        try {
            return om.readTree(inputStream);
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
        if (resultItr == null || ! resultItr.hasNext()) {
            return count;
        }
        EvalResult res = resultItr.next();
        count = Math.toIntExact((long) res.getNumber());
        return count;
    }

    protected int getTelemetryInstallCount(){
        int count = 0;
        EvalResultIterator resultItr = runInDatabase("xdmp:feature-metric-status()/*:feature-metrics/*:features/*:feature[@name=\"datahub.core.install.count\"]/data()", stagingClient.getDatabase());
        if (resultItr == null || ! resultItr.hasNext()) {
            return count;
        }
        EvalResult res = resultItr.next();
        count = Math.toIntExact(Integer.parseInt(res.getString()));
        return count;
    }

    protected int getMlMajorVersion() {
        return Integer.parseInt(versions.getMarkLogicVersion().substring(0, 1));
    }

    public void clearDatabases(String... databases) {
        ServerEvaluationCall eval = stagingClient.newServerEval();
        String installer =
            "declare variable $databases external;\n" +
            "for $database in fn:tokenize($databases, \",\")\n" +
            "return\n" +
            "  xdmp:eval('\n" +
            "    cts:uris() ! xdmp:document-delete(.)\n" +
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
            switch(ext) {
                case "xml":
                    handle.setFormat(Format.XML);
                    break;
                case "json":
                    handle.setFormat(Format.JSON);
                    break;
                default:
                    handle.setFormat(Format.TEXT);
            }
            DocumentMetadataHandle permissions = new DocumentMetadataHandle()
                .withPermission(getHubAdminConfig().getHubRoleName(), DocumentMetadataHandle.Capability.EXECUTE, UPDATE, READ);
            writeSet.add(path, permissions, handle);
        });
        modMgr.write(writeSet);
        clearFlowCache();
    }

    protected void installModule(String path, String localPath) {
        InputStreamHandle handle = new InputStreamHandle(HubTestBase.class.getClassLoader().getResourceAsStream(localPath));
        String ext = FilenameUtils.getExtension(path);
        DocumentMetadataHandle permissions = new DocumentMetadataHandle()
            .withPermission(getHubAdminConfig().getHubRoleName(), DocumentMetadataHandle.Capability.EXECUTE, UPDATE, READ);
        switch(ext) {
        case "xml":
            handle.setFormat(Format.XML);
            break;
        case "json":
            handle.setFormat(Format.JSON);
            break;
        default:
            handle.setFormat(Format.TEXT);
        }
        modMgr.write(path, permissions, handle);
        clearFlowCache();
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
        ServerEvaluationCall eval;
        switch(databaseName) {
            case HubConfig.DEFAULT_STAGING_NAME:
                eval = stagingClient.newServerEval();
                break;
            case HubConfig.DEFAULT_FINAL_NAME:
                eval = finalClient.newServerEval();
                break;
            case HubConfig.DEFAULT_MODULES_DB_NAME:
                eval = stagingModulesClient.newServerEval();
                break;

            case HubConfig.DEFAULT_JOB_NAME:
                eval = jobClient.newServerEval();
                break;
            case HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME:
                eval = finalSchemasClient.newServerEval();
                break;
            default:
                eval = stagingClient.newServerEval();
                break;
        }
        try {
            return eval.xquery(query).eval();
        }
        catch(FailedRequestException e) {
            logger.error("Failed run code: " + query, e);
            e.printStackTrace();
            throw e;
        }
    }

    protected void uninstallModule(String path) {
        ServerEvaluationCall eval = stagingClient.newServerEval();
        String installer =
            "xdmp:invoke-function(function() {" +
            "  xdmp:document-delete(\"" + path + "\")" +
            "}," +
            "<options xmlns=\"xdmp:eval\">" +
            "  <database>{xdmp:modules-database()}</database>" +
            "  <transaction-mode>update-auto-commit</transaction-mode>" +
            "</options>)";

        eval.xquery(installer).eval();
        clearFlowCache();
    }

    protected String genModel(String modelName) {
        return "{\n" +
            "  \"info\": {\n" +
            "    \"title\": \"" + modelName + "\",\n" +
            "    \"version\": \"0.0.1\",\n" +
            "    \"baseUri\": \"\",\n" +
            "    \"description\":\"\"\n" +
            "  },\n" +
            "  \"definitions\": {\n" +
            "    \"" + modelName + "\": {\n" +
            "      \"properties\": {\n" +
            "        \"id\": {\n" +
            "          \"datatype\": \"iri\",\n" +
            "          \"description\":\"A unique identifier.\"\n" +
            "        }\n" +
            "      },\n" +
            "      \"primaryKey\": \"id\",\n" +
            "      \"required\": []\n" +
            "    }\n" +
            "  }\n" +
            "}";
    }

    protected void allCombos(ComboListener listener) {
        CodeFormat[] codeFormats = new CodeFormat[] { CodeFormat.JAVASCRIPT, CodeFormat.XQUERY };
        DataFormat[] dataFormats = new DataFormat[] { DataFormat.JSON, DataFormat.XML };
        FlowType[] flowTypes = new FlowType[] { FlowType.INPUT, FlowType.HARMONIZE };
        Boolean[] useEses = new Boolean[] { false, true };
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
            return new ObjectMapper().writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    protected void assertJsonEqual(String expected, String actual, boolean strict) {
        try {
            JSONAssert.assertEquals(expected, actual, false);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    //installHubModules(), installUserModules() and clearUserModules() must be run as 'hub-admin-user'.
    protected void installHubModules() {
        logger.debug("Installing Data Hub Framework modules into MarkLogic");
        List<Command> commands = new ArrayList<>();
        commands.add(loadHubModulesCommand);

        SimpleAppDeployer deployer = new SimpleAppDeployer(adminHubConfig.getManageClient(), adminHubConfig.getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(adminHubConfig.getAppConfig());
    }

    protected void installUserModules(HubConfig hubConfig, boolean force) {
        logger.debug("Installing user modules into MarkLogic");
        List<Command> commands = new ArrayList<>();
        loadUserModulesCommand.setForceLoad(force);
        commands.add(loadUserModulesCommand);

        LoadModulesCommand loadModulesCommand = new LoadModulesCommand();
        commands.add(loadModulesCommand);

        loadUserArtifactsCommand.setForceLoad(force);
        commands.add(loadUserArtifactsCommand);

        SimpleAppDeployer deployer = new SimpleAppDeployer(((HubConfigImpl)hubConfig).getManageClient(), ((HubConfigImpl)hubConfig).getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());
    }

    public void clearUserModules() {
        getDataHub().clearUserModules();
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
        }
        catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("CertificateAuthContext requires KeyManagerFactory.getInstance(\"SunX509\")");
        }
        try {
            keyStore = KeyStore.getInstance("PKCS12");
        }
        catch (KeyStoreException e) {
            throw new IllegalStateException("CertificateAuthContext requires KeyStore.getInstance(\"PKCS12\")");
        }
        try {
            FileInputStream certFileStream = new FileInputStream(certFile);
            try {
                keyStore.load(certFileStream, certPassword.toCharArray());
            }
            finally {
              if (certFileStream != null)
                certFileStream.close();
            }
            keyManagerFactory.init(keyStore, certPassword.toCharArray());
            keyMgr = keyManagerFactory.getKeyManagers();
            sslContext = SSLContext.getInstance("TLSv1.2");
          }
        catch (NoSuchAlgorithmException | KeyStoreException e) {
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
        try (InputStream keyInputStream =  new ByteArrayInputStream(FileUtils.readFileToByteArray(caRootCert)))
        {
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

    protected void debugOutput(Document xmldoc) {
        debugOutput(xmldoc, System.out);
    }

    protected void debugOutput(Document xmldoc, OutputStream os) {
        try {
            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            transformer.transform(new DOMSource(xmldoc), new StreamResult(os));
        } catch (TransformerException e) {
            throw new DataHubConfigurationException(e);
        }
    }

    protected void writeProp(String key, String value) {
        try {
            File gradleProperties = new File(PROJECT_PATH, "gradle.properties");
            Properties props = new Properties();
            FileInputStream fis = new FileInputStream(gradleProperties);
            props.load(fis);
            fis.close();
            props.put(key, value);
            FileOutputStream fos = new FileOutputStream(gradleProperties);
            props.store(fos, "");
            fos.close();
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected void deleteProp(String key) {
        try {
            File gradleProperties = new File(PROJECT_PATH, "gradle.properties");
            Properties props = new Properties();
            FileInputStream fis = new FileInputStream(gradleProperties);
            props.load(fis);
            fis.close();
            props.remove(key);
            FileOutputStream fos = new FileOutputStream(gradleProperties);
            props.store(fos, "");
            fos.close();
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }
    
    
    public void wireClients() {        
        fm.setupClient();
        dataHub.wireClient();
        versions.setupClient();
        jobMonitor.setupClient();

    }
    //Use this method sparingly as it slows down the test
    public void resetProperties() {
        Field[] fields = HubConfigImpl.class.getDeclaredFields();
        Set<String> s =  Stream.of("hubProject", "environment", "flowManager", 
                "dataHub", "versions", "logger", "objmapper", "projectProperties", "jobMonitor").collect(Collectors.toSet());

        for(Field f : fields){
            if(! s.contains(f.getName())) {
                ReflectionUtils.makeAccessible(f);
                ReflectionUtils.setField(f, adminHubConfig, null);                
            }
            
        }
    }
}
