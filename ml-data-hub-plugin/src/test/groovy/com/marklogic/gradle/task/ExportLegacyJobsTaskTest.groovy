/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.gradle.task

import com.marklogic.client.eval.EvalResult
import com.marklogic.client.eval.EvalResultIterator
import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.hub.HubConfig

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class ExportLegacyJobsTaskTest extends BaseTest {
    private final static int JOB_COUNT = 3

    private final static String FILENAME = 'testExportJobs.zip'

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        // this will be relatively fast (idempotent) for already-installed hubs
        println(runTask('hubInstallModules', '-i').getOutput())
        println(runTask('mlLoadModules', '-i').getOutput())

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME)
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("test-entity");
        installStagingDoc("/employee1.xml", meta, new File("src/test/resources/run-flow-test/employee1.xml").text)
        installStagingDoc("/employee2.xml", meta, new File("src/test/resources/run-flow-test/employee2.xml").text)
        println(runTask('mlReLoadModules'))

        println(runTask('hubCreateHarmonizeFlow', '-PentityName=test-entity', '-PflowName=test-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
        println(runTask('mlReLoadModules'))

        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")

    }

    def setup() {
        propertiesFile.delete()
        createFullPropertiesFile()
        clearDatabases(HubConfig.DEFAULT_JOB_NAME)


        for (int i = 0; i < JOB_COUNT; i++) {
            println(runTask('hubRunLegacyFlow', '-PentityName=test-entity', '-PflowName=test-harmonize-flow', '-i'))
        }
    }

    def cleanupSpec() {
        //runTask('mlUndeploy', '-Pconfirm=true')
    }

    def cleanup() {
        def exportFile = testProjectDir.newFile(FILENAME)
        if (exportFile.exists()) {
            exportFile.delete()
        }
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
        EvalResultIterator resultItr = getJobIds()
        EvalResult res = resultItr.next()
        String jobId = res.getString()

        def result = runTask('hubExportLegacyJobs', '-PjobIds=' + jobId, '-Pfilename=' + FILENAME)

        then:
        result.output.contains(jobId)
        result.output.contains(FILENAME)
        result.task(":hubExportLegacyJobs").outcome == SUCCESS
        def zipFile = testProjectDir.getRoot().toPath().resolve(FILENAME).toFile()
        zipFile.exists()
        zipFile.delete()
    }

    def "export all jobs"() {
        when:
        def result = runTask('hubExportLegacyJobs', '-Pfilename=' + FILENAME)

        then:
        result.output.contains("all jobs")
        result.output.contains(FILENAME)
        result.task(":hubExportLegacyJobs").outcome == SUCCESS
        def zipFile = testProjectDir.getRoot().toPath().resolve(FILENAME).toFile()
        zipFile.exists()
        zipFile.delete()
    }

}
