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

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;

public class HubTestBase {
    static final private Logger logger = LoggerFactory.getLogger(HubTestBase.class);

    public static final String PLUGIN_PATH = "./ye-olde-plugins";
    public static String host;
    public static int stagingPort;
    public static int finalPort;
    public static int tracePort;
    public static String user;
    public static String password;
    public static Authentication authMethod;
    public static DatabaseClient stagingClient = null;
    public static DatabaseClient stagingModulesClient = null;
    public static DatabaseClient finalClient = null;
    public static DatabaseClient finalModulesClient = null;
    public static DatabaseClient traceClient = null;
    public static DatabaseClient traceModulesClient = null;
    private static Properties properties = new Properties();
    private static boolean initialized = false;
    public static XMLDocumentManager stagingDocMgr = getStagingMgr();
    public static XMLDocumentManager finalDocMgr = getFinalMgr();
    public static GenericDocumentManager modMgr = getModMgr();

    public static Properties getProperties() {
        return properties;
    }

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
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");
        authMethod = Authentication.valueOf(properties.getProperty("auth").toUpperCase());

        stagingClient = DatabaseClientFactory.newClient(host, stagingPort, user, password, authMethod);
        stagingModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, authMethod);
        finalClient = DatabaseClientFactory.newClient(host, finalPort, user, password, authMethod);
        finalModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, authMethod);
        traceClient = DatabaseClientFactory.newClient(host, tracePort, user, password, authMethod);
        traceModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, authMethod);

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
        return getHubConfig(PLUGIN_PATH);
    }

    protected static HubConfig getHubConfig(String pluginDir) {
        HubConfig hubConfig = new HubConfig(pluginDir);
        hubConfig.host = host;
        hubConfig.stagingPort = stagingPort;
        hubConfig.finalPort = finalPort;
        hubConfig.tracePort = tracePort;
        hubConfig.adminUsername = user;
        hubConfig.adminPassword = password;
        return hubConfig;
    }

    protected static void installHub() throws IOException {
        new DataHub(getHubConfig()).install();
    }

    protected static void uninstallHub() throws IOException {
        new DataHub(getHubConfig()).uninstall();
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

    protected static int getStagingDocCount() {
        return getDocCount(HubConfig.DEFAULT_STAGING_NAME);
    }

    protected static int getFinalDocCount() {
        return getDocCount(HubConfig.DEFAULT_FINAL_NAME);
    }

    protected static int getTracingDocCount() {
        return getDocCount(HubConfig.DEFAULT_TRACING_NAME);
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

    protected static void installStagingDoc(String uri, DocumentMetadataHandle meta, String doc) {
        stagingDocMgr.write(uri, meta, new StringHandle(doc));
    }

    protected static void installFinalDoc(String uri, String doc) {
        finalDocMgr.write(uri, new StringHandle(doc));
    }

    protected static void installFinalDoc(String uri, DocumentMetadataHandle meta, String doc) {
        finalDocMgr.write(uri, meta, new StringHandle(doc));
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
            System.out.println(installer);
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
}
