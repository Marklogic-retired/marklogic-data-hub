/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.legacy;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.legacy.impl.LegacyTracingImpl;

/**
 * Enables or disables tracing in the DHF for the specified database using the supplied client.
 *
 * Please keep tracing disabled against a production environment.
 */
public interface LegacyTracing {
    /**
     * Creates and returns a tracing object
     * @param client - the databaseclient that will be used
     * @return the LegacyTracing object
     */
    static LegacyTracing create(DatabaseClient client){
        return new LegacyTracingImpl(client);
    };

    /**
     * Enables tracing
     */
    void enable();

    /**
     * Disables tracing
     */
    void disable();

    /**
     * Determines if the hub has tracing enabled or not
     *
     * @return - true if enabled, false otherwise
     */
    boolean isEnabled();
}
