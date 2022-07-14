package com.marklogic.gradle.task
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction


class UnmergeRecordTask extends HubTask  {

    @TaskAction
    void unmergeRecord() {
        def propName = "mergeURI";
        def propName2 = "removeURIs";
        def mergeURI = project.hasProperty(propName) ? project.property(propName) : null;
        if(mergeURI == null) throw new GradleException("mergeURI is a required parameter. Supply the parameter with -PmergeURI=URI")
        def retainAuditTrail = project.hasProperty('retainAuditTrail') ? project.property('retainAuditTrail').asBoolean() : Boolean.TRUE
        def blockFutureMerges = project.hasProperty('blockFutureMerges') ? project.property('blockFutureMerges').asBoolean() : Boolean.TRUE
        def removeURIs = project.hasProperty("removeURIs") ? project.property(propName2) : null;
        if(removeURIs == null) throw new GradleException("removeURIs is a required parameter. Supply the parameter with -PremoveURIs=URI");
        println "mergeURI: " + mergeURI
        println "retainAuditTrail: " + retainAuditTrail
        println "blockFutureMerges: " + blockFutureMerges
        println "removeURIs: " + removeURIs

        def unmergeResponse =  getMasteringManager().unmergeRecord(mergeURI, retainAuditTrail, blockFutureMerges, Arrays.asList(removeURIs.split(',')));

        println unmergeResponse.toString()
    }
}
