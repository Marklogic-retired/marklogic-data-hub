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
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class JobDeleteTaskTest extends BaseTest {
    private final static int JOB_COUNT = 3

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        //runTask('mlUndeploy', '-Pconfirm=true')
        //println(runTask('mlDeploy', '-i').getOutput())

        println(runTask('hubCreateHarmonizeFlow', '-PentityName=test-entity', '-PflowName=test-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
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
        clearDatabases(HubConfig.DEFAULT_JOB_NAME)


        for (int i = 0; i < JOB_COUNT; i++) {
            println(runTask('hubRunLegacyFlow', '-PentityName=test-entity', '-PflowName=test-harmonize-flow', '-i'))
        }
    }

    def cleanupSpec() {
        //runTask('mlUndeploy', '-Pconfirm=true')
    }

    def getJobIds() {
        EvalResultIterator resultItr = runInDatabase("cts:values(cts:element-reference(xs:QName(\"jobId\")))", HubConfig.DEFAULT_JOB_NAME)
        if (resultItr == null || ! resultItr.hasNext()) {
            throw new Exception("Did not find any job IDs")
        }
        return resultItr
    }

    def "delete one job"() {
        when:
        EvalResultIterator resultItr = getJobIds()
        EvalResult res = resultItr.next()
        String jobId = res.getString()

        def result = runTask('hubDeleteJobs', '-PjobIds=' + jobId)

        then:
        result.task(":hubDeleteJobs").outcome == SUCCESS
        getDocCount(HubConfig.DEFAULT_JOB_NAME, null) == JOB_COUNT - 1
    }

    def "delete multiple jobs"() {
        when:
        EvalResultIterator resultItr = getJobIds()
        EvalResult res = resultItr.next()
        String firstJobId = res.getString()
        if (!resultItr.hasNext()) {
            throw new Exception("Did not find enough job IDs to run multiple job delete test")
        }
        res = resultItr.next()
        String jobIds = firstJobId + ',' + res.getString()

        def result = runTask('hubDeleteJobs', '-PjobIds=' + jobIds)

        then:
        result.task(":hubDeleteJobs").outcome == SUCCESS
        getDocCount(HubConfig.DEFAULT_JOB_NAME, null) == JOB_COUNT - 2
    }

    def "delete with empty string job id"() {
        given:
        propertiesFile << """
            ext {
                jobIds=
            }
        """

        when:
        def result = runTask('hubDeleteJobs')

        then:
        result.task(":hubDeleteJobs").outcome == SUCCESS
        getDocCount(HubConfig.DEFAULT_JOB_NAME, null) == JOB_COUNT
    }

    def "delete with invalid job id"() {
        given:
        propertiesFile << """
            ext {
                jobIds=no-such-id
            }
        """

        when:
        def result = runTask('hubDeleteJobs')

        then:
        result.task(":hubDeleteJobs").outcome == SUCCESS
        getDocCount(HubConfig.DEFAULT_JOB_NAME, null) == JOB_COUNT
    }

    def "delete with missing job id"() {

        when:
        def result = runFailTask('hubDeleteJobs')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('jobIds property is required')
        result.task(":hubDeleteJobs").outcome == FAILED
        getDocCount(HubConfig.DEFAULT_JOB_NAME, null) == JOB_COUNT
    }
}
