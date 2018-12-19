package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class HubUpdateIndexesTask extends HubTask {

    @TaskAction
    void updateIndexes() {
        println "Updating the indexes on each application database"
        getDataHub().updateIndexes()
        println "Finished updating indexes"
    }

}
