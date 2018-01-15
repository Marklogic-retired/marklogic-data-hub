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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.*;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.skyscreamer.jsonassert.JSONAssert;
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
import java.nio.file.Path;
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
    private static Properties properties = new Properties();
    private static boolean initialized = false;
    public static GenericDocumentManager stagingDocMgr = getStagingMgr();
    public static GenericDocumentManager finalDocMgr = getFinalMgr();
    public static JSONDocumentManager jobDocMgr = getJobMgr();
    public static GenericDocumentManager traceDocMgr = getTraceMgr();
    public static GenericDocumentManager modMgr = getModMgr();

    private static boolean isInstalled = false;

    private static GenericDocumentManager getStagingMgr() {
        if (!initialized) {
            init();
        }
        return stagingClient.newDocumentManager();
    }

    private static GenericDocumentManager getModMgr() {
        if (!initialized) {
            init();
        }
        return stagingModulesClient.newDocumentManager();
    }

    private static GenericDocumentManager getFinalMgr() {
        if (!initialized) {
            init();
        }
        return finalClient.newDocumentManager();
    }

    private static JSONDocumentManager getJobMgr() {
        if (!initialized) {
            init();
        }
        return jobClient.newJSONDocumentManager();
    }

    private static GenericDocumentManager getTraceMgr() {
        if (!initialized) {
            init();
        }
        return traceClient.newDocumentManager();
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
            System.err.println("gradle-local.properties file not loaded.");
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

        stagingClient = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_STAGING_NAME, user, password, stagingAuthMethod);
        stagingModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, stagingAuthMethod);
        finalClient = DatabaseClientFactory.newClient(host, finalPort, HubConfig.DEFAULT_FINAL_NAME, user, password, finalAuthMethod);
        finalModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, finalAuthMethod);
        traceClient = DatabaseClientFactory.newClient(host, tracePort, HubConfig.DEFAULT_TRACE_NAME, user, password, traceAuthMethod);
        traceModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, traceAuthMethod);
        jobClient = DatabaseClientFactory.newClient(host, jobPort, HubConfig.DEFAULT_JOB_NAME, user, password, jobAuthMethod);
        jobModulesClient  = DatabaseClientFactory.newClient(host, stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, user, password, jobAuthMethod);
    }

    public HubTestBase() {

    }

    protected static void enableDebugging() {
        new Debugging(stagingClient).enable();
    }

    protected static void disableDebugging() {
        new Debugging(stagingClient).disable();
    }

    protected static void enableTracing() {
        new Tracing(stagingClient).enable();
    }

    protected static void disableTracing() {
        new Tracing(stagingClient).disable();
    }

    protected static HubConfig getHubConfig() {
        return getHubConfig(PROJECT_PATH);
    }

    protected static DataHub getDataHub() {
        return new DataHub(getHubConfig());
    }

    protected static HubConfig getHubConfig(String projectDir) {
        HubConfig hubConfig = HubConfig.hubFromEnvironment(projectDir, "local");
        hubConfig.stagingPort = stagingPort;
        hubConfig.finalPort = finalPort;
        hubConfig.tracePort = tracePort;
        hubConfig.jobPort = jobPort;
        hubConfig.getAppConfig().setAppServicesUsername(user);
        hubConfig.getAppConfig().setAppServicesPassword(password);
        return hubConfig;
    }

    public static void createProjectDir() {
        try {
            File projectDir = new File(PROJECT_PATH);
            if (!projectDir.isDirectory() || !projectDir.exists()) {
                getDataHub().initProject();
            }
            String properties = "mlUsername=admin\nmlPassword=admin";
            if (properties != null) {
                Path gradle_properties = projectDir.toPath().resolve("gradle.properties");
                String fileContents = FileUtils.readFileToString(gradle_properties.toFile());
                fileContents += properties;
                FileUtils.writeStringToFile(gradle_properties.toFile(), fileContents);
            }
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected static void installHub() {
        createProjectDir();
        if (!isInstalled) {
            getDataHub().install();
            isInstalled = true;
        }
    }

    protected static void deleteProjectDir() {
        try {
            FileUtils.deleteDirectory(new File(PROJECT_PATH));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected static void uninstallHub() {
        createProjectDir();
        getDataHub().uninstall();
        deleteProjectDir();
        isInstalled = false;
    }

    protected static File getResourceFile(String resourceName) {
        return new File(HubTestBase.class.getClassLoader().getResource(resourceName).getFile());
    }

    protected static InputStream getResourceStream(String resourceName) {
        return HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
    }

    protected static String getResource(String resourceName) {
        try {
            InputStream inputStream = getResourceStream(resourceName);
            return IOUtils.toString(inputStream);
        }
        catch(IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected static String getModulesFile(String uri) {
        try {
            String contents = modMgr.read(uri).next().getContent(new StringHandle()).get();
            return contents.replaceFirst("(\\(:|//)\\s+cache\\sbuster:.+\\n", "");
        }
        catch(Exception e) {}
        return null;
    }

    protected static Document getModulesDocument(String uri) {
        return modMgr.read(uri).next().getContent(new DOMHandle()).get();
    }

    protected static Document getXmlFromResource(String resourceName) {
        InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
        return getXmlFromInputStream(inputStream);
    }

    protected static Document getXmlFromInputStream(InputStream inputStream) {
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

    protected static JsonNode getJsonFromResource(String resourceName) {
        InputStream inputStream = HubTestBase.class.getClassLoader().getResourceAsStream(resourceName);
        ObjectMapper om = new ObjectMapper();
        try {
            return om.readTree(inputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected static int getStagingDocCount() {
        return getStagingDocCount(null);
    }

    protected static int getStagingDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_STAGING_NAME, collection);
    }

    protected static int getFinalDocCount() {
        return getFinalDocCount(null);
    }
    protected static int getFinalDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_FINAL_NAME, collection);
    }

    protected static int getTracingDocCount() {
        return getTracingDocCount(null);
    }
    protected static int getTracingDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_TRACE_NAME, collection);
    }

    protected static int getJobDocCount() {
        return getJobDocCount(null);
    }
    protected static int getJobDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_JOB_NAME, collection);
    }

    protected static int getDocCount(String database, String collection) {
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

    protected static int getMlMajorVersion() {
        return Integer.parseInt(getDataHub().getMarkLogicVersion().substring(0, 1));
    }

    public static void clearDatabases(String... databases) {
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


    protected static void installStagingDoc(String uri, DocumentMetadataHandle meta, String resource) {
        FileHandle handle = new FileHandle(getResourceFile(resource));
        stagingDocMgr.write(uri, meta, handle);
    }

    protected static void installFinalDoc(String uri, DocumentMetadataHandle meta, String resource) {
        FileHandle handle = new FileHandle(getResourceFile(resource));
        finalDocMgr.write(uri, meta, handle);
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
            case HubConfig.DEFAULT_TRACE_NAME:
                eval = traceClient.newServerEval();
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

    protected static void allCombos(ComboListener listener) {
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
}
