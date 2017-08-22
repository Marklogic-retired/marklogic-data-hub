package com.marklogic.gradle.task

import com.marklogic.client.DatabaseClient
import com.marklogic.client.DatabaseClientFactory
import com.marklogic.client.FailedRequestException
import com.marklogic.client.document.DocumentManager
import com.marklogic.client.eval.EvalResult
import com.marklogic.client.eval.EvalResultIterator
import com.marklogic.client.eval.ServerEvaluationCall
import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.client.io.Format
import com.marklogic.client.io.InputStreamHandle
import com.marklogic.client.io.StringHandle
import com.marklogic.hub.HubConfig
import com.marklogic.mgmt.ManageClient
import com.marklogic.mgmt.databases.DatabaseManager
import org.apache.commons.io.FilenameUtils
import org.apache.commons.io.IOUtils
import org.custommonkey.xmlunit.XMLUnit
import org.gradle.testkit.runner.BuildResult
import org.gradle.testkit.runner.GradleRunner
import org.junit.Rule
import org.junit.rules.TemporaryFolder
import org.w3c.dom.Document
import org.xml.sax.SAXException
import spock.lang.Specification

import javax.xml.parsers.DocumentBuilder
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.parsers.ParserConfigurationException

class BaseTest extends Specification {

    public static boolean makeProperties = true;

    static final TemporaryFolder testProjectDir = new TemporaryFolder()
    static File buildFile
    static File propertiesFile

    static BuildResult runTask(String... task) {
        return GradleRunner.create()
            .withProjectDir(testProjectDir.root)
            .withArguments(task)
            .withDebug(true)
            .withPluginClasspath()
            .build()
    }

    BuildResult runFailTask(String... task) {
        return GradleRunner.create()
            .withProjectDir(testProjectDir.root)
            .withArguments(task)
            .withDebug(true)
            .withPluginClasspath().buildAndFail()
    }

    static HubConfig hubConfig() {
        HubConfig hubConfig = new HubConfig(testProjectDir.root.toString())
        hubConfig.username = "admin"
        hubConfig.password = "admin"
        hubConfig.adminUsername = "admin"
        hubConfig.adminPassword = "admin"
        return hubConfig
    }
    static DatabaseClient stagingClient() {

        return hubConfig().newStagingClient()
    }

    static DatabaseClient finalClient() {
        return hubConfig().newFinalClient()
    }

    void installStagingDoc(String uri, DocumentMetadataHandle meta, String doc) {
        stagingClient().newDocumentManager().write(uri, meta, new StringHandle(doc))
    }


    void installFinalDoc(String uri, DocumentMetadataHandle meta, String doc) {
        finalClient().newDocumentManager().write(uri, meta, new StringHandle(doc))
    }

    static void installModule(String path, String localPath) {

        InputStreamHandle handle = new InputStreamHandle(new File("src/test/resources/" + localPath).newInputStream())
        String ext = FilenameUtils.getExtension(path)
        switch(ext) {
            case "xml":
                handle.setFormat(Format.XML)
                break
            case "json":
                handle.setFormat(Format.JSON)
                break
            default:
                handle.setFormat(Format.TEXT)
        }

        HubConfig hubConfig = hubConfig()
        DocumentManager modMgr = DatabaseClientFactory.newClient(hubConfig.host, hubConfig.stagingPort, HubConfig.DEFAULT_MODULES_DB_NAME, "admin", "admin", DatabaseClientFactory.Authentication.DIGEST).newDocumentManager()
        modMgr.write(path, handle);
    }


    void clearDatabases(String... databases) {
        List<Thread> threads = new ArrayList<>()
        ManageClient client = hubConfig().newManageClient()
        DatabaseManager databaseManager = new DatabaseManager(client)
        for (String database: databases) {
            Thread thread = new Thread({ -> databaseManager.clearDatabase(database) })
            threads.add(thread)
            thread.start()
        }
        threads.forEach({thread ->
            try {
                thread.join()
            } catch (InterruptedException e) {
                e.printStackTrace()
            }
        })
    }

    protected Document getXmlFromResource(String resourceName) throws IOException, ParserConfigurationException, SAXException {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance()
        factory.setIgnoringElementContentWhitespace(true)
        factory.setNamespaceAware(true)
        DocumentBuilder builder = factory.newDocumentBuilder()
        return builder.parse(new File("src/test/resources/" + resourceName).getAbsoluteFile())
    }

    static int getStagingDocCount() {
        return getStagingDocCount(null)
    }

    static int getStagingDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_STAGING_NAME, collection)
    }

    static int getFinalDocCount() {
        return getFinalDocCount(null)
    }
    static int getFinalDocCount(String collection) {
        return getDocCount(HubConfig.DEFAULT_FINAL_NAME, collection)
    }

    static int getDocCount(String database, String collection) {
        int count = 0
        String collectionName = ""
        if (collection != null) {
            collectionName = "'" + collection + "'"
        }
        EvalResultIterator resultItr = runInDatabase("xdmp:estimate(fn:collection(" + collectionName + "))", database)
        if (resultItr == null || ! resultItr.hasNext()) {
            return count
        }
        EvalResult res = resultItr.next()
        count = Math.toIntExact((long) res.getNumber())
        return count
    }

    static EvalResultIterator runInDatabase(String query, String databaseName) {
        ServerEvaluationCall eval
        switch(databaseName) {
            case HubConfig.DEFAULT_STAGING_NAME:
                eval = stagingClient().newServerEval()
                break
            case HubConfig.DEFAULT_FINAL_NAME:
                eval = finalClient().newServerEval()
                break
//            case HubConfig.DEFAULT_MODULES_DB_NAME:
//                eval = stagingModulesClient.newServerEval()
//                break
//            case HubConfig.DEFAULT_TRACE_NAME:
//                eval = traceClient.newServerEval()
//                break
//            default:
//                eval = stagingClient.newServerEval()
//                break
        }
        try {
            return eval.xquery(query).eval()
        }
        catch(FailedRequestException e) {
            e.printStackTrace()
            throw e
        }
    }

    static void createBuildFile() {
        String version = new HubConfig(testProjectDir.toString()) .getJarVersion()
        buildFile = testProjectDir.newFile('build.gradle')
        buildFile << """
            plugins {
                id 'com.marklogic.ml-data-hub' version '${version}'
            }
        """
    }

    static void createFullPropertiesFile() {
        propertiesFile = testProjectDir.newFile('gradle.properties')
        propertiesFile << """
            mlHost=localhost
            mlAppName=data-hub

            mlUsername=admin
            mlPassword=admin

            mlManageUsername=admin
            mlManagePassword=admin

            mlAdminUsername=admin
            mlAdminPassword=admin


            mlStagingAppserverName=data-hub-STAGING
            mlStagingPort=8010
            mlStagingDbName=data-hub-STAGING
            mlStagingForestsPerHost=4
            mlStagingAuth=digest


            mlFinalAppserverName=data-hub-FINAL
            mlFinalPort=8011
            mlFinalDbName=data-hub-FINAL
            mlFinalForestsPerHost=4
            mlFinalAuth=digest

            mlTraceAppserverName=data-hub-TRACING
            mlTracePort=8012
            mlTraceDbName=data-hub-TRACING
            mlTraceForestsPerHost=1
            mlTraceAuth=digest

            mlJobAppserverName=data-hub-JOBS
            mlJobPort=8013
            mlJobDbName=data-hub-JOBS
            mlJobForestsPerHost=1
            mlJobAuth=digest

            mlModulesDbName=data-hub-MODULES
            mlTriggersDbName=data-hub-TRIGGERS
            mlSchemasDbName=data-hub-SCHEMAS
        """
    }

    def setupSpec() {
        XMLUnit.setIgnoreWhitespace(true)
        testProjectDir.create()
        createBuildFile()
        createFullPropertiesFile()
    }
}
