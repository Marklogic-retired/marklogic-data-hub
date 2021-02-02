/*
 * Copyright (c) 2021 MarkLogic Corporation
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
package com.marklogic.hub.collector;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;



import java.util.Map;

/**
 * Manages config and client for the collector, as well as runs the collector for the associated entity and flow
 */
public interface Collector {

    /**
     * Obtains and grabs a list of uris that match the collector code
     * @param flow - name of which flow
     * @param step - step of the flow
     * @param options - options Map for running the step
     * @return a list of uris as strings in a diskqueue object
     */
    DiskQueue<String> run(String flow, String step, Map<String, Object> options);
}
