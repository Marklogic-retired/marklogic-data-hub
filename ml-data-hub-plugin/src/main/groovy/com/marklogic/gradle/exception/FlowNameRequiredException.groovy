package com.marklogic.gradle.exception

import org.gradle.api.GradleException

class FlowNameRequiredException extends GradleException {
    FlowNameRequiredException() {
        super("flowName property is required. Supply the parameter with -PflowName=Yourentity")
    }
}
