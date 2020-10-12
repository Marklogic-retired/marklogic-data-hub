package com.marklogic.gradle.task

import com.marklogic.hub.impl.DataHubImpl

class ClearUserModulesTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        println "Clearing user modules. This requires a user with at least 'data-hub-developer' role."
        new DataHubImpl(getProject().property("hubConfig")).clearUserModules()
        println "Finished clearing user modules."
    }

}
