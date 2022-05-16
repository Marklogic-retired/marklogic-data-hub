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
const parser = require('/explore-data/third-party/fast-xml-parser/parser.js');

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

    if(sortCriteria && sortCriteria.entityType && sortCriteria.property) {
      sortCriteria.order = sortCriteria.order ? sortCriteria.order : "descending";
      searchConstraint.push("sort:" + sortCriteria.entityType + "_" + sortCriteria.property + "_" + sortCriteria.order);
    }

    searchConstraint = searchConstraint.join(" AND ");
    let searchResponse = searchImpl.getSearchResults(searchConstraint, start, pageLength);
    if(searchResponse instanceof XMLNode) {
      searchResponse = this.transformXmlToJson(searchResponse);
    }
    let results = searchResponse["response"]["result"];
    if(results) {
      if(!Array.isArray(results)) {
        results = [results];
      }
      results.forEach(result => {
        if(result["extracted"]["#text"]) {
          let extractedObj = JSON.parse(result["extracted"]["#text"])[0];
          let entityType = Object.keys(extractedObj)[0];
          result["extracted"][entityType] = extractedObj[entityType];
          delete result["extracted"]["#text"];
        }
        result["entityType"] = Object.keys(result["extracted"])[1];
      });
    }
    searchResponse["recordCount"] = this.getRecordCount(entityTypeIds);
    return searchResponse;
  }

  getSnippetResults(searchResults) {

  }

  getPrimaryKeyForAResult() {

  }

  getDocument(uri) {
    let result = cts.doc(uri);
    if(result instanceof XMLDocument) {
      result = this.transformXmlToJson(result);
    } else {
      result = result.toObject();
    }
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

  getMetrics(metricTypes) {
    const metrics = {};
    metricTypes["metrics"].forEach(metricType => {
        metrics[metricType["type"]] = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;
      }
    );
    return metrics;
  }

  transformXmlToJson(xmlNode) {
    const options = {
      attributeNamePrefix: "",
      attrNodeName: false, //default is 'false'
      textNodeName: "#text",
      ignoreAttributes: false,
      ignoreNameSpace: true,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: false,
      trimValues: true,
      cdataTagName: "__cdata", //default is 'false'
      cdataPositionChar: "\\c",
      localeRange: "", //To support non english character in tag/attribute values.
      parseTrueNumberOnly: false
    };
    const serializeOptions = {indent: 'no'};
    return parser.parse(xdmp.quote(xmlNode, serializeOptions), options);
  }
}

module.exports = Search;
