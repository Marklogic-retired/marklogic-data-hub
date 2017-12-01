package com.marklogic.gradle.exception

import org.gradle.api.GradleException

class JobIdsRequiredException extends GradleException {
    JobIdsRequiredException() {
        super("jobIds property is required. Supply a comma-separated list with -PjobIds=jobids")
    }
}
