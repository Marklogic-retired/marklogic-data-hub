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

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;

public class HubTestBase {
    static final private Logger logger = LoggerFactory.getLogger(HubTestBase.class);

    public static String host;
    public static int port;
    public static String user;
    public static String password;
    public static Authentication authMethod;
    public static DatabaseClient client = null;
    private static Properties properties = new Properties();
    public static XMLDocumentManager docMgr = init();

    public static Properties getProperties() {
        return properties;
    }

    private static XMLDocumentManager init() {
        try {
            Properties p = new Properties();
            p.load(new FileInputStream("gradle.properties"));
            properties.putAll(p);
        }
        catch (IOException e) {
            System.err.println("Properties file not loaded.");
            System.exit(1);
        }

        // try to load the local environment overrides file
        try {
            Properties p = new Properties();
            p.load(new FileInputStream("gradle-local.properties"));
            properties.putAll(p);
        }
        catch (IOException e) {
            System.err.println("Properties file not loaded.");
            System.exit(1);
        }

        host = properties.getProperty("mlHost");
        port = Integer.parseInt(properties.getProperty("mlRestPort"));
        user = properties.getProperty("mlUsername");
        password = properties.getProperty("mlPassword");
        authMethod = Authentication.valueOf(properties.getProperty("auth").toUpperCase());

        client = DatabaseClientFactory.newClient(host, port, user, password, authMethod);
        return client.newXMLDocumentManager();
    }

    public HubTestBase() {

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
        catch(Exception e) {
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

    protected static void installDoc(String uri, String doc) {
        docMgr.write(uri, new StringHandle(doc));
    }

    protected static void installDoc(String uri, DocumentMetadataHandle meta, String doc) {
        docMgr.write(uri, meta, new StringHandle(doc));
    }

    protected static void installModule(String path, String module) {
        ServerEvaluationCall eval = client.newServerEval();
        String installer =
            "xdmp:invoke-function(function() {" +
            "  xdmp:document-insert(\"" + path + "\", " + module + ")" +
            "}," +
            "<options xmlns=\"xdmp:eval\">" +
            "  <database>{xdmp:modules-database()}</database>" +
            "  <transaction-mode>update-auto-commit</transaction-mode>" +
            "</options>)";
        try {
            eval.xquery(installer).eval();
        }
        catch(FailedRequestException e) {
            logger.error("Failed to install module: " + path, e);
            System.out.println(installer);
            e.printStackTrace();
            throw e;
        }
    }

    protected static void uninstallModule(String path) {
        ServerEvaluationCall eval = client.newServerEval();
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
