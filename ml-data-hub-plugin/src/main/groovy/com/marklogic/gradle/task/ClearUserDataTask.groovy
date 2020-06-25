package com.marklogic.gradle.task

import com.marklogic.hub.impl.DataHubImpl

class ClearUserDataTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        println "Clearing user data. This requires a user with sufficient privileges for clearing the staging, final, and jobs databases."
        new DataHubImpl(getProject().property("hubConfig").newHubClient()).clearUserData()
        println "Finished clearing user data"
    }

}
