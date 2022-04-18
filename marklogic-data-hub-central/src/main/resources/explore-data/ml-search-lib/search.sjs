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
    const start = searchParams.start ? searchParams.start : 1
    const pageLength = searchParams.pageLength ? searchParams.pageLength : 10
    const sortCriteria = searchParams.sort;
    let entityTypeIds = searchParams.entityTypeIds;
    let collections = entityTypeIds.map(i => 'Collection:' + i);
    const collectionConstraint = "(" + collections.join(" OR ") + ")";

    let facets = searchParams.selectedFacets;
    let keys = Object.keys(facets);
    let constraintArr = [];
    keys.forEach(key => {
      if(Array.isArray(facets[key])) {
        if(xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "date", facets[key][0])) {
          facets[key] = facets[key].map(date => xdmp.parseDateTime("[Y0001]-[M01]-[D01]", date))
        }
        constraintArr.push(facets[key].map(value => key+':' + '"' + value + '"').join(" OR "));
      } else {
        let minVal = facets[key]["min"];
        let maxVal = facets[key]["max"];
        let minValConstraint = "";
        let maxValConstraint = "";

        if(minVal && xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "date", minVal)) {
          minVal = xdmp.parseDateTime("[Y0001]-[M01]-[D01]", minVal);
        }
        if(maxVal && xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "date", maxVal)) {
          maxVal = xdmp.parseDateTime("[Y0001]-[M01]-[D01]", maxVal);
        }

        if(minVal) {
          minValConstraint = key + ' GE ' + '"' + minVal + '"';
        }
        if(maxVal) {
          maxValConstraint = key + ' LE ' + '"' + maxVal + '"';
        }

        if(minValConstraint && maxValConstraint) {
          constraintArr.push(minValConstraint.concat(' AND ').concat(maxValConstraint));
        } else if(minValConstraint && !maxValConstraint) {
          constraintArr.push(minValConstraint);
        } else {
          constraintArr.push(maxValConstraint);
        }
      }
    });
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

    if(sortCriteria) {
      searchConstraint.push("sort:" + sortCriteria.entityType + "_" + sortCriteria.property + "_" + sortCriteria.order);
    }

    searchConstraint = searchConstraint.join(" AND ");
    const xpath = "$result/search:result/search:extracted/*[" + entityTypeIds.map(val => "name()='".concat(val).concat("'")).join(" or ") + "]//*/name(.)";
    let searchResponse = searchImpl.getSearchResults(searchConstraint, xpath, start, pageLength).toObject();
    let results = searchResponse["response"]["result"];
    if(results) {
      results.forEach(result => {
        result["entityType"] = Object.keys(result["extracted"])[1];
        entityTypeIds.forEach(entityTypeId => {
          let jsonObject = result["extracted"][entityTypeId];
          if(jsonObject) {
            this.fixArrayIssue(jsonObject);
          }
        })
      })
      results["recordCount"] = this.getRecordCount(entityTypeIds);
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
    result["entityType"] = Object.keys(result)[0];
    result["uri"] = uri;
    return result;
  }

  getEntityModels() {
    let entityModels = {}
    entityModels["entityTypeNames"] = ["person", "organization"];
    return entityModels;
  }

  getEntityModel(modelName) {

  }

  getRecordCount(entityModelNames) {
    const recordCount = {};
    entityModelNames.forEach(entityModelName =>
      recordCount[entityModelName] = fn.count(cts.uris("", null, cts.collectionQuery(entityModelName)))
    );
    recordCount["total"] = Object.values(recordCount).reduce((a, b) => a + b);
    return recordCount;
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
