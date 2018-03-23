/*
 * Copyright 2012-2018 MarkLogic Corporation
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

package com.marklogic.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.impl.DebuggingImpl;

public interface Debugging {

    /**
     * Creates and returns a debugging object
     * @param client - the databaseclient that will be used
     * @return the debugging object
     */
    static Debugging create(DatabaseClient client){
        return new DebuggingImpl(client);
    }

    /**
     * Enables debugging
     */
    void enable();

    /**
     * Disables debugging
     */
    void disable();

    /**
     * Determines if the hub has debugging enabled or not
     *
     * @return - true if enabled, false otherwise
     */
    boolean isEnabled();
}
