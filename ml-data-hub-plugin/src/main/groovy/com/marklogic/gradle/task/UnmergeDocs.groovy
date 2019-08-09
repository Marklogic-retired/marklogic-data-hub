package com.marklogic.gradle.task


import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class UnmergeDocs extends HubTask  {
    @TaskAction
    void unmergeDocs() {
        def propName = "mergeURI"
        def mergeURI = project.hasProperty(propName) ? project.property(propName) : null
        if (mergeURI == null) {
            throw new GradleException("mergeURI is a required parameter. Supply the parameter with -PmergeURI=URI")
        }
        def retainAuditTrail = project.hasProperty('retainAuditTrail') ? project.property('retainAuditTrail').asBoolean() : Boolean.TRUE
        def blockFutureMerges = project.hasProperty('blockFutureMerges') ? project.property('blockFutureMerges').asBoolean() : Boolean.TRUE
        println "mergeURI: " + mergeURI
        println "retainAuditTrail: " + retainAuditTrail
        println "blockFutureMerges: " + blockFutureMerges

        def unmergeResponse = getMasteringManager().unmerge(mergeURI, retainAuditTrail, blockFutureMerges);
        println unmergeResponse.toString()
    }
}
