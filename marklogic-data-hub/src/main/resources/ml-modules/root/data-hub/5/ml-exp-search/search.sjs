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
const searchImpl = require("/data-hub/5/ml-exp-search/search-impl.xqy");

class Search {
  constructor() {

  }

  getSearchResults(searchParams) {
    const searchText = searchParams.searchText;

    let entityTypeIds = searchParams.entityTypeIds;
    entityTypeIds = entityTypeIds.map(i => 'Collection:' + i);
    const collectionConstraint = entityTypeIds.join(" ");

    let facets = searchParams.selectedFacets;
    let keys = Object.keys(facets);
    let constraintArr = [];
    keys.forEach(key => constraintArr.push(facets[key].map(value => key+':' + '"' + value + '"').join(" OR ")))
    const facetConstraint = constraintArr.map(constraint => "(" + constraint + ")").join(" AND ");

    let searchConstraint = [];
    if(searchText != "" || searchText) {
      searchConstraint.push(searchText)
    }
    if(collectionConstraint != "" || collectionConstraint) {
      searchConstraint.push(collectionConstraint)
    }
    if(facetConstraint != "" || facetConstraint) {
      searchConstraint.push(facetConstraint)
    }
    searchConstraint = searchConstraint.join(" AND ");
    return searchImpl.getSearchResults(searchConstraint);
  }

  getSnippetResults(searchResults) {

  }

  getPrimaryKeyForAResult() {

  }

  getDocument() {

  }

  getEntityModels() {

  }

  getEntityModel(modelName) {

  }
}

module.exports = Search;
