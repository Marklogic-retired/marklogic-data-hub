package com.marklogic.gradle.exception

import org.gradle.api.GradleException

class EntityNameRequiredException extends GradleException {
    EntityNameRequiredException() {
        super("entityName property is required. Supply the parameter with -PentityName=Yourentity")
    }
}
