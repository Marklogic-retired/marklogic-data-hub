package com.marklogic.gradle.exception

import org.gradle.api.GradleException

class EntityAlreadyPresentException extends GradleException {
    EntityAlreadyPresentException() {
        super("Entity not created. Entity with the same name is already present.")
    }
}
