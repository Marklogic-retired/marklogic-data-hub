package com.marklogic.gradle.exception

import org.gradle.api.GradleException

class FlowAlreadyPresentException extends GradleException {
    FlowAlreadyPresentException() {
        super("Flow not created. Flow with the same name is already present.")
    }
}
