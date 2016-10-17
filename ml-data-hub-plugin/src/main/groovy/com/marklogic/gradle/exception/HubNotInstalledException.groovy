package com.marklogic.gradle.exception;

import org.gradle.api.GradleException;

class HubNotInstalledException extends GradleException {
    HubNotInstalledException() {
        super("The Data Hub is not installed in MarkLogic. Please run gradle mlDeploy")
    }
}
