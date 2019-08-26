/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.explorer.util;

import com.marklogic.client.DatabaseClient;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;

/**
 * Used as a holder for databaseClient objects.
 * Being session scoped allows to hold separate databaseClient objects for each session.
 * Cleans up by releasing the connection when the session is destroyed.
 */
@Component
@Scope(proxyMode = ScopedProxyMode.TARGET_CLASS, value = "session")
public class DatabaseClientHolder {

    private DatabaseClient databaseClient;

    public DatabaseClient getDatabaseClient() {
        return databaseClient;
    }

    public void setDatabaseClient(DatabaseClient databaseClient) {
        this.databaseClient = databaseClient;
    }

    @PreDestroy
    public void cleanUp() {
        if (databaseClient != null) {
            databaseClient.release();
        }
    }
}
