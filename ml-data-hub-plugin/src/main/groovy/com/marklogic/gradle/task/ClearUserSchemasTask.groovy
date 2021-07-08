package com.marklogic.gradle.task

import com.marklogic.hub.impl.DataHubImpl

class ClearUserSchemasTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        println "Clearing user schemas in staging and final schemas databases."
        new DataHubImpl(getProject().property("hubConfig")).clearUserSchemas()
        println "Finished clearing user schemas"
    }

}
