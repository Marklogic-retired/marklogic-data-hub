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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.*;
import com.marklogic.client.io.marker.AbstractReadHandle;
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.legacy.LegacyDebugging;
import com.marklogic.hub.legacy.LegacyTracing;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.test.AbstractHubTest;
import com.marklogic.hub.test.HubConfigInterceptor;
import com.marklogic.hub.util.ComboListener;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

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
     * Autowires in the HubConfig that we expect to be a proxy to enable parallel tests. Subclasses should use
     * getHubConfig() for access to this.
     */
    @Autowired
    private HubConfigImpl hubConfig;

    // This is set when getHubClient() is called, and it should never be accessed directly.
    private HubClient hubClient;

    @Autowired
    protected DataHubImpl dataHub;

    @Override
    protected HubClient getHubClient() {
        if (hubClient == null) {
            hubClient = getHubConfig().newHubClient();
        }
        return hubClient;
    }

    @Override
    protected HubConfigImpl getHubConfig() {
        return hubConfig;
    }

    @Override
    protected File getTestProjectDirectory() {
        return getHubProject().getProjectDir().toFile();
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
    }

    protected void enableDebugging() {
        LegacyDebugging.create(getHubClient().getStagingClient()).enable();
    }

    protected void disableDebugging() {
        LegacyDebugging.create(getHubClient().getStagingClient()).disable();
    }

    protected void enableTracing() {
        LegacyTracing.create(getHubClient().getStagingClient()).enable();
    }

    protected void disableTracing() {
        LegacyTracing.create(getHubClient().getStagingClient()).disable();
    }

    protected HubConfigImpl runAsFlowOperator() {
        runAsUser("flow-operator", "password");
        return getHubConfig();
    }

    /**
     * The "user" and "password" properties are expected to be set via gradle.properties and, at least as of 5.3.0,
     * are expected to be for a "flow-developer" user.
     *
     * @return
     */
    protected HubConfigImpl runAsFlowDeveloper() {
        runAsUser("flow-developer", "password");
        return getHubConfig();
    }

    @Override
    protected HubClient runAsDataHubDeveloper() {
        if (isVersionCompatibleWith520Roles()) {
            return super.runAsDataHubDeveloper();
        }
        logger.warn("ML version is not compatible with 5.2.0 roles, so will run as flow-developer instead of data-hub-developer");
        runAsFlowDeveloper();
        return getHubClient();
    }

    @Override
    protected HubClient runAsDataHubOperator() {
        if (isVersionCompatibleWith520Roles()) {
            return super.runAsDataHubOperator();
        }
        logger.warn("ML version is not compatible with 5.2.0 roles, so will run as flow-operator instead of data-hub-operator");
        runAsFlowOperator();
        return getHubClient();
    }

    @Override
    protected HubClient runAsUser(String mlUsername, String mlPassword) {
        hubClient = null;

        applyMlUsernameAndMlPassword(mlUsername, mlPassword);

        // Re-initializes the Manage API connection
        getHubConfig().getManageClient().setManageConfig(hubConfig.getManageConfig());

        // We don't want this enabled for tests as some tests will just run a single command, which may result in a
        // CMA config being constructed but not saved
        hubConfig.getAppConfig().getCmaConfig().setCombineRequests(false);

        return getHubClient();
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
        try {
            return new String(FileCopyUtils.copyToByteArray(new ClassPathResource(resourceName).getInputStream()));
        } catch (IOException ex) {
            throw new RuntimeException("Unable to read file from classpath: " + resourceName, ex);
        }
    }

    protected String getModulesFile(String uri) {
        try {
            String contents = getHubClient().getModulesClient().newDocumentManager().read(uri).next().getContent(new StringHandle()).get();
            return contents.replaceFirst("(\\(:|//)\\s+cache\\sbuster:.+\\n", "");
        } catch (IllegalStateException e) {
            return null;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
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
        return getDocCount(HubConfig.DEFAULT_JOB_NAME, "trace");
    }

    protected int getJobDocCount() {
        return getDocCount(HubConfig.DEFAULT_JOB_NAME, "job");
    }

    protected int getDocCount(String database, String collection) {
        String collectionName = "";
        if (collection != null) {
            collectionName = "'" + collection + "'";
        }
        String val = getClientByName(database).newServerEval().xquery("xdmp:estimate(fn:collection(" + collectionName + "))").evalAs(String.class);
        return Integer.parseInt(val);
    }

    protected void installStagingDoc(String uri, DocumentMetadataHandle meta, String resource) {
        getHubClient().getStagingClient().newDocumentManager().write(uri, meta, new FileHandle(getResourceFile(resource)));
    }

    protected void installFinalDoc(String uri, DocumentMetadataHandle meta, String resource) {
        getHubClient().getFinalClient().newDocumentManager().write(uri, meta, new FileHandle(getResourceFile(resource)));
    }

    protected void installJobDoc(String uri, DocumentMetadataHandle meta, String resource) {
        getHubClient().getJobsClient().newDocumentManager().write(uri, meta, new FileHandle(getResourceFile(resource)));
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
        getHubClient().getModulesClient().newDocumentManager().write(path, buildMetadataWithModulePermissions(), handle);
        clearFlowCache();
        handle.close();
    }

    protected DocumentMetadataHandle buildMetadataWithModulePermissions() {
        DocumentMetadataHandle permissions = new DocumentMetadataHandle();
        DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();
        documentPermissionsParser.parsePermissions(getHubConfig().getModulePermissions(), permissions.getPermissions());
        return permissions;
    }

    protected void clearFlowCache() {
        ServerEvaluationCall eval = getHubClient().getStagingClient().newServerEval();
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
            return getClientByName(databaseName).newServerEval().xquery(query).eval();
        } catch (FailedRequestException e) {
            throw new RuntimeException(e);
        }
    }

    protected AbstractReadHandle runInDatabase(String query, String databaseName, AbstractReadHandle handle) {
        try {
            return getClientByName(databaseName).newServerEval().xquery(query).eval(handle);
        } catch (FailedRequestException e) {
            throw new RuntimeException(e);
        }
    }

    protected DatabaseClient getClientByName(String databaseName) {
        HubClient hc = getHubClient();
        if (databaseName.equalsIgnoreCase(hc.getDbName(DatabaseKind.STAGING))) {
            return hc.getStagingClient();
        }
        if (databaseName.equalsIgnoreCase(hc.getDbName(DatabaseKind.FINAL))) {
            return hc.getFinalClient();
        }
        if (databaseName.equalsIgnoreCase(hc.getDbName(DatabaseKind.JOB))) {
            return hc.getJobsClient();
        }
        if (databaseName.equalsIgnoreCase(hc.getDbName(DatabaseKind.MODULES))) {
            return hc.getModulesClient();
        }
        if (databaseName.equalsIgnoreCase(hc.getDbName(DatabaseKind.STAGING_SCHEMAS))) {
            return getHubConfig().getAppConfig().newAppServicesDatabaseClient(databaseName);
        }
        if (databaseName.equalsIgnoreCase(hc.getDbName(DatabaseKind.FINAL_SCHEMAS))) {
            return getHubConfig().getAppConfig().newAppServicesDatabaseClient(databaseName);
        }
        throw new IllegalArgumentException("Doesn't support: " + databaseName);
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

    protected void assertJsonEqual(String expected, String actual, boolean strict) {
        try {
            JSONAssert.assertEquals(expected, actual, false);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    protected void installHubModules() {
        new LoadHubModulesCommand(getHubConfig()).execute(newCommandContext());
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

    protected void installHubArtifacts() {
        new LoadHubArtifactsCommand(getHubConfig()).execute(newCommandContext());
    }

    public void clearUserModules() {
        dataHub.clearUserModules(Arrays.asList("marklogic-unit-test"));
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
        DatabaseManager mgr = new DatabaseManager(hubConfig.getManageClient());
        try {
            return (ObjectNode) objectMapper.readTree(mgr.getPropertiesAsJson(database));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
