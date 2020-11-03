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
package com.marklogic.hub.collector.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.DiskQueue;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.Map;

public class CollectorImpl implements Collector {

    private HubClient hubClient;
    private String sourceDatabase;

    /**
     * @param hubClient
     * @param sourceDatabase Determines what database will be queried; the HTTP request will still go to the staging
     *                       server
     */
    public CollectorImpl(HubClient hubClient, String sourceDatabase) {
        this.hubClient = hubClient;
        this.sourceDatabase = sourceDatabase;
    }

    @Override
    public DiskQueue<String> run(String flow, String step, Map<String, Object> options) {
        final DatabaseClient stagingClient = hubClient.getStagingClient();

        try {
            String uriString = String.format(
                "%s://%s:%d/v1/internal/hubcollector5?flow-name=%s&database=%s&step=%s",
                stagingClient.getSecurityContext().getSSLContext() != null ? "https" : "http",
                stagingClient.getHost(),
                stagingClient.getPort(),
                URLEncoder.encode(flow, "UTF-8"),
                URLEncoder.encode(this.sourceDatabase, "UTF-8"),
                URLEncoder.encode(step, "UTF-8")
            );
            if (options != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                uriString += "&options=" + URLEncoder.encode(objectMapper.writeValueAsString(options), "UTF-8");
            }

            /**
             * The underlying OkHttpClient is used for performance reasons, as trying to invoke a REST extension or
             * invoking /v1/eval results in far worse performance. See the comments in DHFPROD-4533 for more information.
             */
            OkHttpClient ok = (OkHttpClient) stagingClient.getClientImplementation();
            Request request = new Request.Builder().url(uriString).get().build();

            Response response = ok.newCall(request).execute();
            if (response.isSuccessful()) {
                return readItems(response);
            } else {
                throw new RuntimeException(String.format("Unable to collect items to process for flow %s and step %s; cause: %s", flow, step, response.body().string()));
            }
        } catch (IOException ex) {
            throw new RuntimeException(String.format("Unexpected IO exception when collecting items to process for flow %s and step %s; cause: %s", flow, step, ex));
        }
    }

    private DiskQueue<String> readItems(Response response) throws IOException {
        DiskQueue<String> results = new DiskQueue<>(5000);
        try (BufferedReader reader = new BufferedReader(response.body().charStream())) {
            String line;
            while ((line = reader.readLine()) != null) {
                results.add(line);
            }
        }
        return results;
    }
}
