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
const parser = require('/explore-data/third-party/fast-xml-parser/parser.js');
const searchImpl = require("/explore-data/ml-search-lib/search-impl.xqy");

class Search {
  constructor() {

  }

  // This function has minimal search capability to return all the data from content database with only collection facets
  getSearchResults(searchParams) {
    const start = searchParams.start ? searchParams.start : 1
    const pageLength = searchParams.pageLength ? searchParams.pageLength : 10

    const searchConstraint = this.buildSearchQuery(searchParams);
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
        if(result["extracted"]) {
          if(result["extracted"]["#text"]) {
            let extractedObj = JSON.parse(result["extracted"]["#text"])[0];
            let entityType = Object.keys(extractedObj)[0];
            result["extracted"][entityType] = extractedObj[entityType];
            delete result["extracted"]["#text"];
          }
          result["entityType"] = Object.keys(result["extracted"])[1];
        }
      });
    }
    searchResponse["recordCount"] = {"total": searchResponse["response"]["total"]};
    return searchResponse;
  }

  getSnippetResults(searchResults) {
    return {}
  }

  getPrimaryKeyForAResult() {
    return {}
  }

  getDocument(uri) {
    return {}
  }

  getEntityModels() {
    return {}
  }

  getEntityModel(modelName) {
    return {}
  }

  getRecordCount(entityModelNames) {
    return {}
  }

  getMetrics(metricTypes) {
    return {}
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

  buildSearchQuery(searchParams) {
    const searchText = searchParams.searchText;
    const sortCriteria = searchParams.sort;

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

    if(facetConstraint != "" || facetConstraint) {
      searchConstraint.push(facetConstraint)
    }

    if(sortCriteria && sortCriteria.entityType && sortCriteria.property) {
      sortCriteria.order = sortCriteria.order ? sortCriteria.order : "descending";
      searchConstraint.push("sort:" + sortCriteria.entityType + "_" + sortCriteria.property + "_" + sortCriteria.order);
    }

    searchConstraint = searchConstraint.join(" AND ");
    return searchConstraint;
  }
}

module.exports = Search;
