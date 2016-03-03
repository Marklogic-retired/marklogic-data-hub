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
import com.marklogic.client.admin.ExtensionLibrariesManager;
import com.marklogic.client.admin.ExtensionLibraryDescriptor;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;

public class HubTestBase {
    static final private Logger logger = LoggerFactory.getLogger(HubTestBase.class);

    public static String host;
    public static int stagingPort;
    public static int finalPort;
    public static String user;
    public static String password;
    public static Authentication authMethod;
    public static DatabaseClient stagingClient = null;
    public static DatabaseClient finalClient = null;
    private static Properties properties = new Properties();
    private static boolean initialized = false;
    public static XMLDocumentManager stagingDocMgr = getStagingMgr();
    public static XMLDocumentManager finalDocMgr = getFinalMgr();

    public static Properties getProperties() {
        return properties;
    }

    private static XMLDocumentManager getStagingMgr() {
        if (!initialized) {
            init();
        }
        return stagingClient.newXMLDocumentManager();
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
        stagingPort = Integer.parseInt(properties.getProperty("mlStagingRestPort"));
        finalPort = Integer.parseInt(properties.getProperty("mlFinalRestPort"));
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");
        authMethod = Authentication.valueOf(properties.getProperty("auth").toUpperCase());

        stagingClient = DatabaseClientFactory.newClient(host, stagingPort, user, password, authMethod);
        finalClient = DatabaseClientFactory.newClient(host, finalPort, user, password, authMethod);
    }

    public HubTestBase() {

    }

    protected static HubConfig getHubConfig(String pluginDir) {
        HubConfig config = new HubConfig(pluginDir);
        config.setHost(host);
        config.setStagingPort(stagingPort);
        config.setFinalPort(finalPort);
        config.setAdminUsername(user);
        config.setAdminPassword(password);
        return config;
    }

    protected static void installHub() throws IOException {
        new DataHub(host, stagingPort, finalPort, user, password).install();
    }

    protected static void uninstallHub() throws IOException {
        new DataHub(host, stagingPort, finalPort, user, password).uninstall();
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

    protected static Document getXmlFromResource(String resourceName) throws IOException, ParserConfigurationException, SAXException {
        InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();

        factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();

        return builder.parse(inputStream);
    }

    protected static int getStagingDocCount() {
        return getDocCount("data-hub-in-a-box-STAGING");
    }

    protected static int getFinalDocCount() {
        return getDocCount("data-hub-in-a-box-FINAL");
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
        ExtensionLibrariesManager libsMgr = stagingClient
                .newServerConfigManager().newExtensionLibrariesManager();

        ExtensionLibraryDescriptor moduleDescriptor = new ExtensionLibraryDescriptor();
        moduleDescriptor.setPath(path);

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

        libsMgr.write(moduleDescriptor, handle);
    }

    protected static EvalResultIterator runInModules(String query) {
        return runInDatabase(query, "data-hub-in-a-box-modules");
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
