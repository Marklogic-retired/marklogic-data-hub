package com.marklogic.gradle.task

import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.TaskOutcome
import org.gradle.testkit.runner.UnexpectedBuildSuccess
import org.junit.Assert

import java.nio.file.Paths

class ManualMergeUnmergeTaskTest extends BaseTest{

    String URIs = "/person-1.json,/person-1-1.json,/person-1-2.json"
    String query = "cts:uris((),(),cts:and-query((cts:collection-query('sm-person-merged'),cts:collection-query('sm-person-mastered'))))"

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        copyResourceToFile("master-test/person.entity.json", Paths.get(testProjectDir.root.toString(),"entities", "person.entity.json").toFile())
        copyResourceToFile("master-test/myNewFlow.flow.json", Paths.get(testProjectDir.root.toString(),"flows","myNewFlow.flow.json").toFile())
        copyResourceToFile("master-test/person-1.json", Paths.get(testProjectDir.root.toString(),"input","person-1.json").toFile())
        copyResourceToFile("master-test/person-1-1.json", Paths.get(testProjectDir.root.toString(),"input","person-1-1.json").toFile())
        copyResourceToFile("master-test/person-1-2.json", Paths.get(testProjectDir.root.toString(),"input","person-1-2.json").toFile())
        copyResourceToFile("master-test/person-1.mapping.json", Paths.get(testProjectDir.root.toString(),"mappings","person","person-1.mapping.json").toFile())
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        runTask('hubDeployUserArtifacts')
        runTask('hubDeployUserModules')
    }

    def setup() {

    }

    def cleanup() {
        String query = "cts:uris((),(),cts:or-query((cts:collection-query('mapping'), cts:collection-query('master'), cts:collection-query('sm-person-auditing'), cts:collection-query('http://marklogic.com/semantics#default-graph')))) ! xdmp:document-delete(.)"
        runInDatabase(query, HubConfig.DEFAULT_FINAL_NAME)
    }

    def "Verify manual merge with no flowName param"() {
        when:
        def result = runFailTask('hubMergeEntities', '-PmergeURIs=testURI')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains("flowName is a required parameter")

    }

    def "Verify manual merge with no mergeURIs param"() {
        when:
        def result = runFailTask('hubMergeEntities', '-PflowName=testFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains("mergeURIs is a required parameter")
    }

    def "Verify manual unmerge with no mergeURI param"() {
        when:
        def result = runFailTask('hubUnmergeEntities')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains("mergeURI is a required parameter")
    }

    def "Verify blockFutureMerges doesnt apply to manual merge"() {
        given:
        manualMergeUnmerge()
        String mergedANDMastered = "fn:count("+query+")"


        when:
        def result = runTask('hubMergeEntities', '-PmergeURIs='+URIs, '-PflowName=myNewFlow', '-PstepNumber=3')

        then:
        result.task(':hubMergeEntities').outcome == TaskOutcome.SUCCESS
        getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-archived") == 3
        //4 auditing docs are created after manualMergeUnmerge() is called. So 4 + 1
        getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-auditing") == 5
        runInDatabase(mergedANDMastered, HubConfig.DEFAULT_FINAL_NAME).next().getNumber() == 1

    }

    def "Verify blockFutureMerges for regular mastering"() {
        //When unmerged with blockFutureMerges=true, future attempts of
        // regular mastering/merge on those documents should be blocked
        given:
        manualMergeUnmerge()
        String mergedANDMastered = "fn:count("+query+")"

        when:
        def result = runTask('hubRunFlow', '-PflowName=myNewFlow', '-Psteps=3')

        then:
        result.task(':hubRunFlow').outcome == TaskOutcome.SUCCESS
        //4 auditing docs are created after manualMergeUnmerge() is called. Blocked merges causes it to not add auditing document
        getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-auditing") == 4
        //1 The merged document is achived since the merges were blocked by the unmerge
        getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-archived") == 1
        runInDatabase(mergedANDMastered, HubConfig.DEFAULT_FINAL_NAME).next().getNumber() == 0
    }

    def "Verify manual merge with preview"() {
        //Should return merged doc as response and not save in DB
        given:
        runTask('hubRunFlow', '-PflowName=myNewFlow', '-Psteps=1,2')

        when:
        def result = runTask('hubMergeEntities', '-PmergeURIs='+URIs, '-PflowName=myNewFlow', '-PstepNumber=3', '-Ppreview=true')

        then:
        result.task(':hubMergeEntities').outcome == TaskOutcome.SUCCESS
        //Verifies that merged document was not written to the database
        runInDatabase(query, HubConfig.DEFAULT_FINAL_NAME).hasNext() == false
        //Verifies that merged document is returned in the response body
        result.output.contains("/com.marklogic.smart-mastering/merged/")
    }

    def "Verify manual merge with step option override"() {
        //Should override step options
        given:
        runTask('hubRunFlow', '-PflowName=myNewFlow', '-Psteps=1,2')

        when:
        def result = runTask('hubMergeEntities', '-PmergeURIs='+URIs, '-PflowName=myNewFlow', '-PstepNumber=3', '-Poptions={"collections": ["master", "myMaster"]}')

        then:
        result.task(':hubMergeEntities').outcome == TaskOutcome.SUCCESS
        //3 original docs + 1 mastered + 1 audit
        getDocCount(HubConfig.DEFAULT_FINAL_NAME, "myMaster") == 5
    }

    def manualMerge() {
        runTask('hubRunFlow', '-PflowName=myNewFlow', '-Psteps=1,2')

        def result = runTask('hubMergeEntities', '-PmergeURIs='+URIs, '-PflowName=myNewFlow', '-PstepNumber=3')

        Assert.assertEquals(TaskOutcome.SUCCESS, result.task(':hubMergeEntities').outcome)
        Assert.assertEquals(3, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-archived"))
        Assert.assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-auditing"))
        //1 document with collections mastered and merged
        Assert.assertEquals(1, runInDatabase("fn:count("+query+")", HubConfig.DEFAULT_FINAL_NAME).next().getNumber())
    }

    def manualMergeUnmerge() {
        manualMerge()
        String mergeURI = runInDatabase(query, HubConfig.DEFAULT_FINAL_NAME).next().getString()

        def result = runTask('hubUnmergeEntities', "-PmergeURI="+mergeURI, "-PretainAuditTrail=true", "-PblockFutureMerges=true")

        Assert.assertEquals(TaskOutcome.SUCCESS, result.task(':hubUnmergeEntities').outcome)
        //After unmerge, the 1 merged document will be archived
        Assert.assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-archived"))
        Assert.assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-merged"))
        //auditing doc is created for as many unmerged documents. So 1(from merge) + 3(from unmerge)
        Assert.assertEquals(4, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-auditing"))
        //3 original documents will get mastered collection
        Assert.assertEquals(3, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "sm-person-mastered"))
    }
}
