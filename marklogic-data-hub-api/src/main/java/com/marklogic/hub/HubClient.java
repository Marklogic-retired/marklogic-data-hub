/*
 * Copyright (c) 2020 MarkLogic Corporation
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
import com.marklogic.hub.impl.HubClientImpl;
import com.marklogic.mgmt.ManageClient;

public interface HubClient {

    static HubClient withHubClientConfig(HubClientConfig hubClientConfig) {
        return new HubClientImpl(hubClientConfig);
    }

    /**
     * @return the name of the MarkLogic user associated with this client
     */
    String getUsername();

    DatabaseClient getStagingClient();

    DatabaseClient getFinalClient();

    DatabaseClient getJobsClient();

    DatabaseClient getModulesClient();

    String getDbName(DatabaseKind kind);

    /**
     * Needed for operations that happen outside of a deployment, such as clearing user data or updating indexes.
     *
     * @return
     */
    ManageClient getManageClient();
}
