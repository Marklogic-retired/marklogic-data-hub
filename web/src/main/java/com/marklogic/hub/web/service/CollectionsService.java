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
package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CollectionsService {

    @Autowired
    private HubConfig hubConfig;

    public List<String> getCollections(String databaseName) {
        List<String> collectionList = new ArrayList<>();

        Collections collections = new Collections(hubConfig.newStagingClient());
        JsonNode collectionsNode = collections.getCollections(databaseName);

        collectionsNode.fieldNames().forEachRemaining(collection -> {
            // Exclude internal collections
            if (!collection.startsWith("http://marklogic.com/")) {
                collectionList.add(collection);
            }
        });

        return collectionList;
    }

    public class Collections extends ResourceManager {
        private static final String NAME = "ml:collections";

        private RequestParameters params;

        public Collections(DatabaseClient client) {
            super();
            client.init(NAME, this);
            params = new RequestParameters();
        }

        public JsonNode getCollections(String databaseName) {
            params.add("database", databaseName);

            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || !resultItr.hasNext()) {
                throw new RuntimeException("Unable to get collections");
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new JacksonHandle()).get();
        }
    }
}
