package com.marklogic.quickstart.web;

import com.marklogic.client.helper.LoggingObject;
import com.marklogic.quickstart.exception.NotAuthorizedException;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.springframework.beans.factory.annotation.Autowired;

public class BaseController extends LoggingObject {
    @Autowired
    EnvironmentConfig envConfig;

    protected void requireAuth() {
        if (!envConfig.isInitialized()) {
            throw new NotAuthorizedException();
        }
    }
}
