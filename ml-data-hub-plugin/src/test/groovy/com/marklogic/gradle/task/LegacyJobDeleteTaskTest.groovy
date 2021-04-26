/*
 * Copyright (c) 2021 MarkLogic Corporation
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
import com.marklogic.mgmt.resource.databases.DatabaseManager
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*
import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class LegacyJobDeleteTaskTest extends BaseTest {
    private final int JOB_COUNT = 3

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        //Deleting prov documents as admin user since no other users have rights to do so and
        // not deleting them messes up with count assertions in this test suite
        new DatabaseManager(hubConfig().getManageClient()).clearDatabase(HubConfig.DEFAULT_JOB_NAME)

        println(runTask('hubCreateHarmonizeFlow', '-PentityName=test-entity', '-PflowName=test-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
        println(runTask('hubDeployUserModules'))

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME)
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("test-entity");
        installStagingDoc("/employee1.xml", meta, new File("src/test/resources/run-flow-test/employee1.xml").text)
        installStagingDoc("/employee2.xml", meta, new File("src/test/resources/run-flow-test/employee2.xml").text)
        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")
        addJobDocs();

    }

    def setup() {
        propertiesFile.delete()
        createFullPropertiesFile()

        for (int i = 0; i < JOB_COUNT; i++) {
            println(runTask('hubRunLegacyFlow', '-PentityName=test-entity', '-PflowName=test-harmonize-flow', '-i'))
        }
    }

    def cleanup() {
        clearDatabases(HubConfig.DEFAULT_JOB_NAME)
    }

    def getJobIds() {
        EvalResultIterator resultItr = runInDatabase("cts:values(cts:element-reference(xs:QName(\"jobId\")),(),(),cts:collection-query(\"job\"))", HubConfig.DEFAULT_JOB_NAME)
        if (resultItr == null || ! resultItr.hasNext()) {
            throw new Exception("Did not find any job IDs")
        }
        return resultItr
    }

    def "delete Job and Batch documents when running hubDeleteLegacyJobs task"() {
        when:
        String jobId = "10584668255644629399"
        int jobsCount = getDocCount(HubConfig.DEFAULT_JOB_NAME, "Jobs")
        int batchCount = getDocCount(HubConfig.DEFAULT_JOB_NAME, "Batch")

        def result = runTask('hubDeleteLegacyJobs', '-PjobIds=' + jobId)

        then:
        result.task(":hubDeleteLegacyJobs").outcome == SUCCESS
        getDocCount(HubConfig.DEFAULT_JOB_NAME, "Jobs") == 2
        getDocCount(HubConfig.DEFAULT_JOB_NAME, "Batch") == 0

    }

    def "delete one job"() {
        when:
        EvalResultIterator resultItr = getJobIds()
        EvalResult res = resultItr.next()
        String jobId = res.getString()

        def result = runTask('hubDeleteLegacyJobs', '-PjobIds=' + jobId)

        then:
        result.task(":hubDeleteLegacyJobs").outcome == SUCCESS
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

        def result = runTask('hubDeleteLegacyJobs', '-PjobIds=' + jobIds)

        then:
        result.task(":hubDeleteLegacyJobs").outcome == SUCCESS
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
        def result = runTask('hubDeleteLegacyJobs')

        then:
        result.task(":hubDeleteLegacyJobs").outcome == SUCCESS
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
        def result = runTask('hubDeleteLegacyJobs')

        then:
        result.task(":hubDeleteLegacyJobs").outcome == SUCCESS
        getDocCount(HubConfig.DEFAULT_JOB_NAME, null) == JOB_COUNT
    }

    def "delete with missing job id"() {

        when:
        def result = runFailTask('hubDeleteLegacyJobs')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('jobIds property is required')
        result.task(":hubDeleteLegacyJobs").outcome == FAILED
        getDocCount(HubConfig.DEFAULT_JOB_NAME, null) == JOB_COUNT
    }

    private void addJobDocs() {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("Jobs");
        meta.getCollections().add("Job");
        meta.getPermissions().add("flow-developer-role", READ, UPDATE, EXECUTE);
        installJobDoc("/jobs/1442529761390935690.json", meta, "job-test/job1.json");
        installJobDoc("/jobs/10584668255644629399.json", meta, "job-test/job2.json");
        installJobDoc("/jobs/1552529761390935680.json", meta, "job-test/job3.json");


        DocumentMetadataHandle meta1 = new DocumentMetadataHandle();
        meta1.getCollections().add("Batch");
        meta1.getCollections().add("Jobs");
        meta1.getPermissions().add("flow-developer-role", READ, UPDATE, EXECUTE);
        installJobDoc("/jobs/batches/11368953415268525918.json", meta1, "job-test/batch1.json");
        installJobDoc("/jobs/batches/11345653515268525918.json", meta1, "job-test/batch2.json");

    }
}
