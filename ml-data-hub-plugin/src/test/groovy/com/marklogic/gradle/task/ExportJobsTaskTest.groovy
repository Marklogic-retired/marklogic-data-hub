package com.marklogic.gradle.task

import com.marklogic.client.eval.EvalResult
import com.marklogic.client.eval.EvalResultIterator
import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.hub.HubConfig

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class ExportJobsTaskTest extends BaseTest {
    private final int JOB_COUNT = 3

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        runTask('mlUndeploy', '-Pconfirm=true')
        println(runTask('mlDeploy', '-i').getOutput())

        println(runTask('hubCreateHarmonizeFlow', '-PentityName=test-entity', '-PflowName=test-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy').getOutput())
        println(runTask('mlReLoadModules'))

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME)
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("test-entity");
        installStagingDoc("/employee1.xml", meta, new File("src/test/resources/run-flow-test/employee1.xml").text)
        installStagingDoc("/employee2.xml", meta, new File("src/test/resources/run-flow-test/employee2.xml").text)
        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")

    }

    def setup() {
        propertiesFile.delete()
        createFullPropertiesFile()
        clearDatabases(HubConfig.DEFAULT_JOB_NAME, HubConfig.DEFAULT_TRACE_NAME)


        for (int i = 0; i < JOB_COUNT; i++) {
            println(runTask('hubRunFlow', '-PentityName=test-entity', '-PflowName=test-harmonize-flow', '-i'))
        }
    }

    def cleanupSpec() {
        runTask('mlUndeploy', '-Pconfirm=true')
    }

    def getJobIds() {
        EvalResultIterator resultItr = runInDatabase("cts:values(cts:element-reference(xs:QName(\"jobId\")))", HubConfig.DEFAULT_JOB_NAME)
        if (resultItr == null || ! resultItr.hasNext()) {
            throw new Exception("Did not find any job IDs")
        }
        return resultItr
    }

    def "export one job"() {
        when:
        def filename = 'testExportJobs.zip'
        EvalResultIterator resultItr = getJobIds()
        EvalResult res = resultItr.next()
        String jobId = res.getString()

        def result = runTask('hubExportJobs', '-PjobIds=' + jobId, '-Pfilename=' + filename)

        then:
        result.output.contains(jobId)
        result.output.contains(filename)
        result.task(":hubExportJobs").outcome == SUCCESS
        def zipFile = testProjectDir.newFile(filename)
        zipFile.exists()
        zipFile.delete()
    }

    def "export all jobs"() {
        when:
        def filename = 'testExportJobs.zip'
        def result = runTask('hubExportJobs', '-Pfilename=' + filename)

        then:
        result.output.contains("all jobs")
        result.output.contains(filename)
        result.task(":hubExportJobs").outcome == SUCCESS
        def zipFile = testProjectDir.newFile(filename)
        zipFile.exists()
        zipFile.delete()
    }

}
