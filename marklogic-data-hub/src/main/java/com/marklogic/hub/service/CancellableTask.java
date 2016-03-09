package com.marklogic.hub.service;

import org.apache.http.concurrent.BasicFuture;

public interface CancellableTask {

    void run(BasicFuture<?> resultFuture);
    
    void cancel(BasicFuture<?> resultFuture);
}
