package com.marklogic.gradle.task

import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.UnexpectedBuildFailure

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.EXECUTE
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class ClearDatabaseTaskTest extends BaseTest {
    int hubCoreCount;
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def setup(){
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME)
        hubCoreCount = getDocCount("data-hub-STAGING","hub-core-artifact")

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("Jobs")
        meta.getPermissions().add("data-hub-developer", READ, UPDATE, EXECUTE)
        installJobDoc("/jobs/1442529761390935690.json", meta, "job-test/job1.json")
        getDocCount("data-hub-JOBS", null) == 1
    }


    def "clear staging db"() {

        when:
        def result = runTask('mlClearDatabase', '-Pdatabase=data-hub-STAGING', '-Pconfirm=true')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":mlClearDatabase").outcome == SUCCESS
        getDocCount("data-hub-STAGING", null) == hubCoreCount
    }

    def "clear final db"() {

        when:
        def result = runTask('mlClearDatabase', '-Pdatabase=data-hub-FINAL', '-Pconfirm=true')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":mlClearDatabase").outcome == SUCCESS
        getDocCount("data-hub-FINAL", null) == hubCoreCount
    }

    def "clear jobs db"() {

        when:
        def result = runTask('mlClearDatabase', '-Pdatabase=data-hub-JOBS', '-Pconfirm=true')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":mlClearDatabase").outcome == SUCCESS
        getDocCount("data-hub-JOBS", null) == 0
    }


}
