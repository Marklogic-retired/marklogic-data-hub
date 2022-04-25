/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';
const Search = require("/explore-data/ml-search-lib/search.sjs");

class ConfigurableSearch extends Search {
  constructor() {
    super();
  }

  getSearchResults(searchParams) {
    return super.getSearchResults(searchParams);
  }

  getSnippetResults(searchResults) {
    return super.getSnippetResults(searchResults);
  }

  getDocument(uri) {
   return super.getDocument(uri);
  }

  getEntityModels() {
    return super.getEntityModels();
  }

  getEntityModel(modelName) {
    return super.getEntityModel(modelName);
  }

  getRecordCount(entityModelNames) {
    return super.getRecordCount(entityModelNames);
  }

  getMetrics(metricTypes) {
    return super.getMetrics(metricTypes);
  }
}

module.exports = ConfigurableSearch;
