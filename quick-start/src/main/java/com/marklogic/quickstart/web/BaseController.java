package com.marklogic.quickstart.web;

import org.springframework.beans.factory.annotation.Autowired;

import com.marklogic.quickstart.exception.NotAuthorizedException;
import com.marklogic.quickstart.model.EnvironmentConfig;

public class BaseController {
    @Autowired
    EnvironmentConfig envConfig;

    protected void requireAuth() {
        if (!envConfig.isInitialized) {
            throw new NotAuthorizedException();
        }
    }
}
