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

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.net.ssl.KeyManager;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.util.ComboListener;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.json.JSONException;
import org.skyscreamer.jsonassert.JSONAssert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
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
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.util.CertificateTemplateManagerPlus;
import com.marklogic.hub.util.Versions;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.resource.hosts.HostManager;
import com.marklogic.mgmt.resource.security.CertificateAuthorityManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import com.marklogic.rest.util.JsonNodeUtil;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE;


// FIXME remove deprecated methods
@SuppressWarnings(value="deprecation")
public class HubTestBase {

    // to speedup dev cycle, you can create a hub and set this to true.
    // for true setup/teardown, must be 'false'
    private static boolean isInstalled = false;
    private static int nInstalls = 0;

    static final protected Logger logger = LoggerFactory.getLogger(HubTestBase.class);

    public static final String PROJECT_PATH = "ye-olde-project";

    public  String host;
    public  int stagingPort;
    public  int finalPort;
    public  int jobPort;
    public  String user;
    public  String password;
    protected  Authentication stagingAuthMethod;
    private  Authentication finalAuthMethod;
    private  Authentication jobAuthMethod;
    public  DatabaseClient stagingClient = null;
    public  DatabaseClient stagingPrivilegedClient = null;
    // this is needed for some evals in the test suite that are not mainline tests.
    public  DatabaseClient stagingModulesClient = null;
    public  DatabaseClient finalClient = null;
    public  DatabaseClient finalModulesClient = null;
    public  DatabaseClient jobClient = null;
    public  DatabaseClient jobModulesClient = null;
    private  AdminConfig adminConfig = null;
    private  AdminManager adminManager = null;
    private  ManageConfig manageConfig = null;
    private  ManageClient manageClient = null;
    private  CertificateTemplateManagerPlus certManager;
    private  HashMap<File, String> serverFiles= new HashMap<File, String>();
    private  boolean sslRun = false;
    private  boolean certAuth = false;
    private  SSLContext certContext = null;
    private  Properties properties = new Properties();
    public  GenericDocumentManager stagingDocMgr;
    public  GenericDocumentManager finalDocMgr;
    public  JSONDocumentManager jobDocMgr;
    public  GenericDocumentManager traceDocMgr;
    public  GenericDocumentManager modMgr;
    public  String bootStrapHost = null;
	private  TrustManagerFactory tmf;
	private List<DatabaseClient> clients = new ArrayList<DatabaseClient>();
    private GenericDocumentManager getStagingMgr() {
        return stagingClient.newDocumentManager();
    }

    private GenericDocumentManager getModMgr() {
        return stagingModulesClient.newDocumentManager();
    }

    private GenericDocumentManager getFinalMgr() {
        return finalClient.newDocumentManager();
    }

    private JSONDocumentManager getJobMgr() {
        return jobClient.newJSONDocumentManager();
    }

    private GenericDocumentManager getTraceMgr() {
        return jobClient.newDocumentManager();
    }


    protected void basicSetup() {
        XMLUnit.setIgnoreWhitespace(true);
        createProjectDir();
    }

    protected void init() {
        try {
            Properties p = new Properties();
            p.load(new FileInputStream("gradle.properties"));
            properties.putAll(p);
        }
        catch (IOException e) {
            System.err.println("Properties file not loaded.");
        }

        // try to load the local environment overrides file
        try {
            Properties p = new Properties();
            p.load(new FileInputStream("gradle-local.properties"));
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
        finalPort = Integer.parseInt(properties.getProperty("mlFinalPort"));
        jobPort = Integer.parseInt(properties.getProperty("mlJobPort"));
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");

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
        && finalAuthMethod.equals(Authentication.CERTIFICATE) && stagingAuthMethod.equals(Authentication.CERTIFICATE)) {
        	setCertAuth(true);
        	try {
        		installCARootCertIntoStore(getResourceFile("ssl/ca-cert.crt"));
    		}
        	catch (Exception e) {
        	    throw new DataHubConfigurationException("Root ca lot loaded", e);
        	}
        }

        try {
        	stagingClient = getClient(host, stagingPort, HubConfig.DEFAULT_STAGING_NAME, user, password, stagingAuthMethod);
            stagingPrivilegedClient = getHubConfig().newStagingManageClient();
            stagingModulesClient  = getClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, stagingAuthMethod);
            finalClient = getClient(host, finalPort, HubConfig.DEFAULT_FINAL_NAME, user, password, finalAuthMethod);
            finalModulesClient  = getClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, finalAuthMethod);
            jobClient = getClient(host, jobPort, HubConfig.DEFAULT_JOB_NAME, user, password, jobAuthMethod);
            jobModulesClient  = getClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, jobAuthMethod);
        }
        catch(Exception e) {
        	System.err.println("client objects not created.");
        	e.printStackTrace();
        }
        stagingDocMgr = getStagingMgr();
        finalDocMgr = getFinalMgr();
        jobDocMgr = getJobMgr();
        traceDocMgr = getTraceMgr();
        modMgr = getModMgr();
    }

    protected DatabaseClient getClient(String host, int port, String dbName, String user,String password, Authentication authMethod) throws Exception {
    	if(isCertAuth()) {
    		certContext = createSSLContext(getResourceFile("ssl/client-cert.p12"));
    		return DatabaseClientFactory.newClient(host, port, dbName, new DatabaseClientFactory.CertificateAuthContext(certContext,SSLHostnameVerifier.ANY));
    	}
    	else if(isSslRun()) {
    		return DatabaseClientFactory.newClient(host, port, dbName, user, password, authMethod, SimpleX509TrustManager.newSSLContext(),SSLHostnameVerifier.ANY);
    	}
    	else {
    		return DatabaseClientFactory.newClient(host, port, dbName, user, password, authMethod);
    	}
    }

    public HubTestBase() {
        init();
    }


	public boolean isCertAuth() {
		return certAuth;
	}

	public void setCertAuth(boolean certAuth) {
		this.certAuth = certAuth;
	}

	public boolean isSslRun() {
		return sslRun;
	}


	public void setSslRun(boolean sslRun) {
		this.sslRun = sslRun;
	}

    protected void enableDebugging() {
        Debugging.create(stagingClient).enable();
    }

    protected void disableDebugging() {
        Debugging.create(stagingClient).disable();
    }

    protected void enableTracing() {
        ManageClient manageClient = ((HubConfigImpl)getHubConfig()).getManageClient();
        String resp = manageClient.getJson("/manage/v2/hosts?format=json");
        JsonNode actualObj = null;
		try {
			actualObj = new ObjectMapper().readTree(resp);
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		JsonNode nameNode = actualObj.path("host-default-list").path("list-items");
		List<String> hosts = nameNode.findValuesAsText("nameref");
        hosts.forEach(serverHost ->
		{
			try {
				DatabaseClient client = getClient(serverHost, stagingPort, HubConfig.DEFAULT_STAGING_NAME, user, password, stagingAuthMethod);
				Tracing.create(client).enable();
				clients.add(client);
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		});
    }

    protected void disableTracing() {
        clients.forEach(client ->
		{
			Tracing.create(client).disable();
			client.newServerEval().xquery("xquery version \"1.0-ml\";\n" +
					"import module namespace hul = \"http://marklogic.com/data-hub/hub-utils-lib\" at \"/MarkLogic/data-hub-framework/impl/hub-utils-lib.xqy\";\n" +
					"hul:invalidate-field-cache(\"tracing-enabled\")").eval();

		});
    }

    protected HubConfig getHubConfig() {
        return getHubConfig(PROJECT_PATH);
    }

    public DataHub getDataHub() {
        return DataHub.create(getHubConfig());
    }

    protected HubConfig getHubConfig(String projectDir) {
    	HubConfig hubConfig = HubConfigBuilder.newHubConfigBuilder(projectDir)
            .withPropertiesFromEnvironment()
            .build();
        hubConfig.setPort(DatabaseKind.STAGING, stagingPort);
        hubConfig.setPort(DatabaseKind.FINAL, finalPort);
        hubConfig.setPort(DatabaseKind.JOB, jobPort);
        hubConfig.getAppConfig().setAppServicesUsername(user);
        hubConfig.getAppConfig().setAppServicesPassword(password);
        hubConfig.getAppConfig().setHost(host);
        if(isSslRun()) {
        	hubConfig.getAppConfig().setSimpleSslConfig();
        }
        if(isCertAuth()) {
        	AppConfig appConfig = hubConfig.getAppConfig();
        	appConfig.setRestSslContext(certContext);
        	appConfig.setRestSecurityContextType(SecurityContextType.CERTIFICATE);

        	appConfig.setAppServicesSslContext(certContext);
        	appConfig.setHost(bootStrapHost);
        	appConfig.setAppServicesSecurityContextType(SecurityContextType.CERTIFICATE);
        	hubConfig.setAppConfig(appConfig);

        	hubConfig.setSslContext(DatabaseKind.STAGING,certContext);
        	hubConfig.setSslContext(DatabaseKind.FINAL,certContext);
        	hubConfig.setSslContext(DatabaseKind.JOB,certContext);
        	hubConfig.setSslHostnameVerifier(DatabaseKind.STAGING,SSLHostnameVerifier.ANY);
        	hubConfig.setSslHostnameVerifier(DatabaseKind.FINAL,SSLHostnameVerifier.ANY);
        	hubConfig.setSslHostnameVerifier(DatabaseKind.JOB,SSLHostnameVerifier.ANY);

        }
        if(adminConfig != null) {
        	((HubConfigImpl)hubConfig).setAdminConfig(adminConfig);
        	((HubConfigImpl)hubConfig).setAdminManager(adminManager);
        }
        if(manageConfig != null) {
        	((HubConfigImpl)hubConfig).setManageConfig(manageConfig);
        	manageClient = new ManageClient(manageConfig);
        	((HubConfigImpl)hubConfig).setManageClient(manageClient);
        }
        return hubConfig;
    }

    public void createProjectDir() {
        try {
            File projectDir = new File(PROJECT_PATH);
            if (!projectDir.isDirectory() || !projectDir.exists()) {
                getDataHub().initProject();
            }

            Path devProperties = Paths.get(".").resolve("gradle.properties");
            Path projectProperties = projectDir.toPath().resolve("gradle.properties");
            FileUtils.copyFile(devProperties.toFile(), projectProperties.toFile());
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteProjectDir() {
        if (new File(PROJECT_PATH).exists()) {
            try {
                FileUtils.forceDelete(new File(PROJECT_PATH));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }
    protected File getResourceFile(String resourceName) {
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
        catch(Exception e) {}
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
        return Integer.parseInt(new Versions(getHubConfig()).getMarkLogicVersion().substring(0, 1));
    }

    public void clearDatabases(String... databases) {
        ServerEvaluationCall eval = stagingPrivilegedClient.newServerEval();
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
                .withPermission("data-hub-role", DocumentMetadataHandle.Capability.EXECUTE, UPDATE, READ);
            writeSet.add(path, permissions, handle);
        });
        modMgr.write(writeSet);
        clearFlowCache();
    }

    protected void installModule(String path, String localPath) {

        InputStreamHandle handle = new InputStreamHandle(HubTestBase.class.getClassLoader().getResourceAsStream(localPath));
        String ext = FilenameUtils.getExtension(path);
        DocumentMetadataHandle permissions = new DocumentMetadataHandle()
            .withPermission("data-hub-role", DocumentMetadataHandle.Capability.EXECUTE, UPDATE, READ);
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

    protected void installHubModules() {
        logger.debug("Installing Data Hub Framework modules into MarkLogic");

        HubConfigImpl hubConfig = (HubConfigImpl) getHubConfig();

        List<Command> commands = new ArrayList<>();
        commands.add(new LoadHubModulesCommand(hubConfig));

        SimpleAppDeployer deployer = new SimpleAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());
    }

    protected void installUserModules(HubConfig hubConfig, boolean force) {
        logger.debug("Installing user modules into MarkLogic");

        List<Command> commands = new ArrayList<>();
        LoadUserModulesCommand loadUserModulesCommand = new LoadUserModulesCommand(hubConfig);
        loadUserModulesCommand.setForceLoad(force);
        commands.add(loadUserModulesCommand);

        SimpleAppDeployer deployer = new SimpleAppDeployer(((HubConfigImpl)hubConfig).getManageClient(), ((HubConfigImpl)hubConfig).getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());
    }

	protected  void sslSetup()  {
		manageClient = ((HubConfigImpl)getHubConfig()).getManageClient();
		adminConfig = ((HubConfigImpl)getHubConfig()).getAdminConfig();
		adminManager = new com.marklogic.mgmt.admin.AdminManager(adminConfig);

		HostManager hm = new HostManager(manageClient);
		bootStrapHost = hm.getHostNames().get(0);

		certManager = new CertificateTemplateManagerPlus(manageClient);
		certManager.save(dhfCert());

	    String cacert = null;
			try {
				cacert = FileUtils.readFileToString(getResourceFile("ssl/ca-cert.crt"));
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		CertificateAuthorityManager cam = new CertificateAuthorityManager(manageClient);
		cam.create(cacert);
		try {
			certManager.setCertificatesForTemplate("dhf-cert");
		}
		catch(IOException e) {
			System.err.println("Unable to associate cert to template");
			e.printStackTrace();
		}

	    ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();
	    ArrayNode certnode = node.arrayNode();
	    certnode.add(cacert);
	    node.put("ssl-certificate-template", "dhf-cert");
	    node.put("ssl-allow-sslv3", "true");
	    node.put("ssl-allow-tls", "true");
	    node.put("ssl-disable-sslv3", "false");
	    node.put("ssl-disable-tlsv1", "false");
	    node.put("ssl-disable-tlsv1-1", "false");
	    node.put("ssl-disable-tlsv1-2", "false");
	    if(isCertAuth()) {
	    	node.put("authentication", "certificate");
	       	node.put("ssl-client-certificate-pem", certnode );
	    }
	    try {
			FileUtils.writeStringToFile(new File(System.getProperty("java.io.tmpdir")+"/ssl-server.json"), node.toString());
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		List<File> files = new ArrayList<>();
		files.add(new File(System.getProperty("java.io.tmpdir")+"/ssl-server.json"));
		File file = getResourceFile("ml-config/servers");
		Path serverPath = file.toPath();
		try {
			Files.list(serverPath).forEach(filePath ->
				{	File server = filePath.toFile();
					files.add(server);
					try {
						ObjectNode serverFiles = (ObjectNode) JsonNodeUtil.mergeJsonFiles(files);
						FileUtils.writeStringToFile(server, serverFiles.toString());
					} catch (IOException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				});
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}


	    Path localPath = getResourceFile("scaffolding/gradle-local_properties").toPath();
		String localProps = null;
	    localProps = new String("mlJobSimpleSsl=true\n" +
		    		"mlFinalSimpleSsl=true\n" +
		    		"mlStagingSimpleSsl=true\n" +
		            "mlAdminScheme=https\n" +
		            "mlManageScheme=https\n" +
		            "mlAdminSimpleSsl=true\n" +
		            "mlManageSimpleSsl=true\n" +
		            "mlAppServicesSimpleSsl=true");
	    if(isCertAuth()) {
	    	localProps = new String("mlStagingAuth=certificate\n" +
	    			"mlFinalAuth=certificate\n" +
	    			"mlHost="+bootStrapHost+"\n"+
	    			"mlAdminScheme=https\n" +
	   	            "mlManageScheme=https\n" +
	    			"mlJobAuth=certificate");
	    }
	    try {
			FileUtils.writeStringToFile(localPath.toFile(), localProps);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	    manageClient.putJson("/manage/v2/servers/Admin/properties?group-id=Default", node.toString());
	    manageClient.putJson("/manage/v2/servers/App-Services/properties?group-id=Default", node.toString());
	    manageClient.putJson("/manage/v2/servers/Manage/properties?group-id=Default", node.toString());

        adminConfig.setScheme("https");
        adminConfig.setConfigureSimpleSsl(true);

        manageConfig = ((HubConfigImpl)getHubConfig()).getManageConfig();
        manageConfig.setScheme("https");
        manageConfig.setConfigureSimpleSsl(true);


        if(isCertAuth()) {
        	adminConfig.setConfigureSimpleSsl(false);
        	adminConfig.setSslContext(certContext);
        	adminConfig.setHost(bootStrapHost);
        	adminConfig.setPassword(null);

        	manageConfig.setConfigureSimpleSsl(false);
        	manageConfig.setSslContext(certContext);
        	manageConfig.setHost(bootStrapHost);
        	manageConfig.setPassword(null);
        }
        adminManager = new com.marklogic.mgmt.admin.AdminManager(adminConfig);
	}

	public  void sslCleanup() {
	    Path localPath = getResourceFile("scaffolding/gradle-local_properties").toPath();
	    String localProps = new String("# Put your overrides from gradle.properties here\n" +
	    		"# Don't check this in to version control\n" +
	    		"");
	    try {
			FileUtils.writeStringToFile(localPath.toFile(), localProps);
		} catch (IOException e2) {
			// TODO Auto-generated catch block
			e2.printStackTrace();
		}

		serverFiles.entrySet().stream().forEach(e -> {
			try {
				FileUtils.writeStringToFile(e.getKey(), e.getValue());
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		});

		ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();

	    node.put("ssl-certificate-template", (String)null);
	    node.put("ssl-client-certificate-authorities", (String)null );
	    node.put("authentication", "digest");

		try {
			manageClient.putJson("/manage/v2/servers/Admin/properties?group-id=Default", node.toString());
	        manageClient.putJson("/manage/v2/servers/App-Services/properties?group-id=Default", node.toString());
	        manageClient.putJson("/manage/v2/servers/Manage/properties?group-id=Default", node.toString());
		}
		catch(Exception e) {
			e.printStackTrace();
		}

        adminConfig = ((HubConfigImpl)getHubConfig()).getAdminConfig();
        adminConfig.setScheme("http");
        adminConfig.setConfigureSimpleSsl(false);
        adminConfig.setSslContext(null);
        adminConfig.setPassword(password);
        adminManager = new com.marklogic.mgmt.admin.AdminManager(adminConfig);

        manageConfig = ((HubConfigImpl)getHubConfig()).getManageConfig();
        manageConfig.setScheme("http");
        manageConfig.setConfigureSimpleSsl(false);
        manageConfig.setPassword(password);
        manageConfig.setSslContext(null);
        manageConfig.setHost("localhost");
        manageClient = new com.marklogic.mgmt.ManageClient(manageConfig);
		certManager = new CertificateTemplateManagerPlus(manageClient);
		try {
			certManager.delete(dhfCert());
		}
		catch(Exception e) {
			e.printStackTrace();
		}
		FileUtils.deleteQuietly(new File("gradle-local.properties"));
	}

	private String dhfCert() {
		return new String(
				"<certificate-template-properties xmlns=\"http://marklogic.com/manage\"> <template-name>dhf-cert</template-name><template-description>System Cert</template-description> <key-type>rsa</key-type><key-options/><req><version>0</version><subject><countryName>US</countryName><stateOrProvinceName>CA</stateOrProvinceName><commonName>*.marklogic.com</commonName><emailAddress>fbermude@marklogic.com</emailAddress><localityName>San Carlos</localityName><organizationName>MarkLogic</organizationName><organizationalUnitName>Engineering</organizationalUnitName></subject></req> </certificate-template-properties>");
	}

	private SSLContext createSSLContext(File certFile) throws Exception{
		String certPassword = "abcd";
	    SSLContext sslContext = null;
	      KeyStore keyStore = null;
	      KeyManagerFactory keyManagerFactory = null;
	      KeyManager[] keyMgr = null;
	      try {
	        keyManagerFactory = KeyManagerFactory.getInstance("SunX509");
	      } catch (NoSuchAlgorithmException e) {
	        throw new IllegalStateException(
	          "CertificateAuthContext requires KeyManagerFactory.getInstance(\"SunX509\")");
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
	      }
	      sslContext.init(keyMgr, tmf.getTrustManagers(), null);
	      return sslContext;
	}

	private void installCARootCertIntoStore(File caRootCert) {
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

}


