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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.*;
import com.marklogic.hub.flow.FlowCacheInvalidator;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.databases.DatabaseManager;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class HubTestBase {
    static final protected Logger logger = LoggerFactory.getLogger(HubTestBase.class);

    public static final String PROJECT_PATH = "ye-olde-project";
    public static String host;
    public static int stagingPort;
    public static int finalPort;
    public static int tracePort;
    public static int jobPort;
    public static String user;
    public static String password;
    public static Authentication stagingAuthMethod;
    public static Authentication finalAuthMethod;
    public static Authentication traceAuthMethod;
    public static Authentication jobAuthMethod;
    public static DatabaseClient stagingClient = null;
    public static DatabaseClient stagingModulesClient = null;
    public static DatabaseClient finalClient = null;
    public static DatabaseClient finalModulesClient = null;
    public static DatabaseClient traceClient = null;
    public static DatabaseClient traceModulesClient = null;
    public static DatabaseClient jobClient = null;
    public static DatabaseClient jobModulesClient = null;
    private static FlowCacheInvalidator invalidator = null;
    private static Properties properties = new Properties();
    private static boolean initialized = false;
    public static XMLDocumentManager stagingDocMgr = getStagingMgr();
    public static XMLDocumentManager finalDocMgr = getFinalMgr();
    public static JSONDocumentManager jobDocMgr = getJobMgr();
    public static GenericDocumentManager modMgr = getModMgr();

    private static boolean isInstalled = false;

    private static XMLDocumentManager getStagingMgr() {
        if (!initialized) {
            init();
        }
        return stagingClient.newXMLDocumentManager();
    }

    private static GenericDocumentManager getModMgr() {
        if (!initialized) {
            init();
        }
        return stagingModulesClient.newDocumentManager();
    }

    private static XMLDocumentManager getFinalMgr() {
        if (!initialized) {
            init();
        }
        return finalClient.newXMLDocumentManager();
    }

    private static JSONDocumentManager getJobMgr() {
        if (!initialized) {
            init();
        }
        return jobClient.newJSONDocumentManager();
    }

    private static void init() {
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
            System.err.println("gradle-local.roperties file not loaded.");
        }

        host = properties.getProperty("mlHost");
        stagingPort = Integer.parseInt(properties.getProperty("mlStagingPort"));
        finalPort = Integer.parseInt(properties.getProperty("mlFinalPort"));
        tracePort = Integer.parseInt(properties.getProperty("mlTracePort"));
        jobPort = Integer.parseInt(properties.getProperty("mlJobPort"));
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");

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

        auth = properties.getProperty("mlTraceAuth");
        if (auth != null) {
            traceAuthMethod = Authentication.valueOf(auth.toUpperCase());
        }
        else {
            traceAuthMethod = Authentication.DIGEST;
        }

        auth = properties.getProperty("mlJobAuth");
        if (auth != null) {
            jobAuthMethod = Authentication.valueOf(auth.toUpperCase());
        }
        else {
            jobAuthMethod = Authentication.DIGEST;
        }

        stagingClient = DatabaseClientFactory.newClient(host, stagingPort, user, password, stagingAuthMethod);
        stagingModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, stagingAuthMethod);
        finalClient = DatabaseClientFactory.newClient(host, finalPort, user, password, finalAuthMethod);
        finalModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, finalAuthMethod);
        traceClient = DatabaseClientFactory.newClient(host, tracePort, user, password, traceAuthMethod);
        traceModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, traceAuthMethod);
        jobClient = DatabaseClientFactory.newClient(host, jobPort, user, password, jobAuthMethod);
        jobModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, jobAuthMethod);
        invalidator = new FlowCacheInvalidator(stagingClient);
    }

    public HubTestBase() {

    }

    protected static void enableDebugging() {
        new Debugging(stagingClient).enable();
    }

    protected static void enableTracing() {
        new Tracing(stagingClient).enable();
    }

    protected static HubConfig getHubConfig() {
        return getHubConfig(PROJECT_PATH);
    }

    protected static DataHub getDataHub() {
        return new DataHub(getHubConfig());
    }

    protected static HubConfig getHubConfig(String projectDir) {
        HubConfig hubConfig = new HubConfig(projectDir);
        hubConfig.host = host;
        hubConfig.stagingPort = stagingPort;
        hubConfig.finalPort = finalPort;
        hubConfig.tracePort = tracePort;
        hubConfig.jobPort = jobPort;
        hubConfig.setUsername(user);
        hubConfig.setPassword(password);
        return hubConfig;
    }

    protected static void installHub() throws IOException {
        File projectDir = new File(PROJECT_PATH);
        if (!projectDir.isDirectory() || !projectDir.exists()) {
            getDataHub().initProject();
        }

        if (!isInstalled) {
            getDataHub().install();
            isInstalled = true;
        }
    }

    protected static void uninstallHub() throws IOException {
        getDataHub().uninstall();
        FileUtils.deleteDirectory(new File(PROJECT_PATH));
        isInstalled = false;
    }

    protected static String getResource(String resourceName) throws IOException {
        try {
            InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
            return IOUtils.toString(inputStream);
        }
        catch(IOException e) {
            e.printStackTrace();
            throw e;
        }
    }

    protected static String getModulesFile(String uri) {
        return modMgr.read(uri).next().getContent(new StringHandle()).get();
    }

    protected static Document getModulesDocument(String uri) {
        return modMgr.read(uri).next().getContent(new DOMHandle()).get();
    }

    protected static Document getXmlFromResource(String resourceName) throws IOException, ParserConfigurationException, SAXException {
        InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setIgnoringElementContentWhitespace(true);
        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();

        return builder.parse(inputStream);
    }

    protected static JsonNode getJsonFromResource(String resourceName) throws IOException {
        InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
        ObjectMapper om = new ObjectMapper();
        return om.readTree(inputStream);
    }

    protected static int getStagingDocCount() {
        return getDocCount(HubConfig.DEFAULT_STAGING_NAME);
    }

    protected static int getFinalDocCount() {
        return getDocCount(HubConfig.DEFAULT_FINAL_NAME);
    }

    protected static int getTracingDocCount() {
        return getDocCount(HubConfig.DEFAULT_TRACE_NAME);
    }

    protected static int getDocCount(String database) {
        int count = 0;
        EvalResultIterator resultItr = runInDatabase("xdmp:estimate(fn:doc())", database);
        if (resultItr == null || ! resultItr.hasNext()) {
            return count;
        }
        EvalResult res = resultItr.next();
        count = Math.toIntExact((long) res.getNumber());
        return count;
    }

    protected static void installStagingDoc(String uri, String doc) {
        stagingDocMgr.write(uri, new StringHandle(doc));
    }

    protected static void clearDb(String dbName) {
        ManageClient client = getHubConfig().newManageClient();
        DatabaseManager databaseManager = new DatabaseManager(client);
        databaseManager.clearDatabase(dbName);
    }

    public static void clearDatabases(String... databases) {
        List<Thread> threads = new ArrayList<>();
        ManageClient client = getHubConfig().newManageClient();
        DatabaseManager databaseManager = new DatabaseManager(client);
        for (String database: databases) {
            Thread thread = new Thread(() -> databaseManager.clearDatabase(database));
            threads.add(thread);
            thread.start();
        }
        threads.forEach((Thread thread) -> {
            try {
                thread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
    }


    protected static void installStagingDoc(String uri, DocumentMetadataHandle meta, String doc) {
        stagingDocMgr.write(uri, meta, new StringHandle(doc));
    }

    protected static void installFinalDoc(String uri, String doc) {
        finalDocMgr.write(uri, new StringHandle(doc));
    }

    protected static void installFinalDoc(String uri, DocumentMetadataHandle meta, String doc) {
        finalDocMgr.write(uri, meta, new StringHandle(doc));
    }

    protected static void installModules(Map<String, String> modules) {

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
            writeSet.add(path, handle);
        });
        modMgr.write(writeSet);

        invalidator.invalidateCache();
    }

    protected static void installModule(String path, String localPath) {

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

        modMgr.write(path, handle);

        FlowCacheInvalidator invalidator = new FlowCacheInvalidator(stagingClient);
        invalidator.invalidateCache();
    }

    protected static EvalResultIterator runInModules(String query) {
        return runInDatabase(query, HubConfig.DEFAULT_MODULES_DB_NAME);
    }

    protected static EvalResultIterator runInDatabase(String query, String databaseName) {
        ServerEvaluationCall eval = stagingClient.newServerEval();
        String installer =
            "xdmp:invoke-function(function() {" +
            query +
            "}," +
            "<options xmlns=\"xdmp:eval\">" +
            "  <database>{xdmp:database(\"" + databaseName + "\")}</database>" +
            "  <transaction-mode>update-auto-commit</transaction-mode>" +
            "</options>)";
        try {
            return eval.xquery(installer).eval();
        }
        catch(FailedRequestException e) {
            logger.error("Failed run code: " + query, e);
            e.printStackTrace();
            throw e;
        }
    }

    protected static void uninstallModule(String path) {
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
    }

    protected static String genModel(String modelName) {
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

}
