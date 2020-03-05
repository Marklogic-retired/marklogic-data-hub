/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.oneui.managers;

import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.oneui.models.Document;
import com.marklogic.hub.oneui.models.SearchQuery;
import com.marklogic.hub.oneui.util.SearchHelper;

import java.util.Optional;


public class SearchManager {

    private SearchHelper searchHelper;

    public SearchManager(HubConfig hubConfig) {
        searchHelper = new SearchHelper(hubConfig);
    }

    public StringHandle search(SearchQuery searchQuery) {
        return searchHelper.search(searchQuery);
    }

    public Optional<Document> getDocument(String docUri) {
        Optional<Document> doc = searchHelper.getDocument(docUri);
        return doc;
    }
}
