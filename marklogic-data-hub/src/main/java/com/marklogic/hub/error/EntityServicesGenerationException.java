package com.marklogic.hub.error;

import com.marklogic.hub.entity.Entity;

public class EntityServicesGenerationException  extends RuntimeException {

    public EntityServicesGenerationException() {
        super();
    }

    public EntityServicesGenerationException(String message) {
        super(message);
    }

    public EntityServicesGenerationException(String message, Throwable e) { super(message, e); }
}
