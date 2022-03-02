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
const searchImpl = require("/explore-data/ml-search-lib/search-impl.xqy");
const json = require('/MarkLogic/json/json.xqy');

class Search {
  constructor() {

  }

  getSearchResults(searchParams) {
    const searchText = searchParams.searchText;

    let entityTypeIds = searchParams.entityTypeIds;
    let collections = entityTypeIds.map(i => 'Collection:' + i);
    const collectionConstraint = "(" + collections.join(" OR ") + ")";

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

    let searchResponse = searchImpl.getSearchResults(searchConstraint, entityTypeIds[0]).toObject();
    let results = searchResponse["response"]["result"];
    for(let result of results) {
      let jsonObject = result["extracted"][entityTypeIds[0]];
      this.fixArrayIssue(jsonObject);
    }
    return searchResponse;
  }

  getSnippetResults(searchResults) {

  }

  getPrimaryKeyForAResult() {

  }

  getDocument(uri) {
    let result = searchImpl.transformXmlToJsonFromDocUri(uri).toObject();
    this.fixArrayIssue(result);
    result["uri"] = uri;
    return result;
  }

  getEntityModels() {

  }

  getEntityModel(modelName) {

  }

  fixArrayIssue(jsonObject) {
    const keys = Object.keys(jsonObject);
    for(let key of keys) {
      if(Array.isArray(jsonObject[key])) {
        if(jsonObject[key].length == 1) {
          jsonObject[key] = jsonObject[key][0];
        }

        if(Array.isArray(jsonObject[key])) {
          for(var obj of jsonObject[key]) {
            this.fixArrayIssue(obj)
          }
        } else {
          this.fixArrayIssue(jsonObject[key]);
        }
      }
    }
  }
}

module.exports = Search;
