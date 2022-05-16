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

class Search {
  constructor() {

  }

  getSearchResults(searchParams) {
    return {
      "response": {
        "snippet-format": "snippet",
        "total": "0",
        "start": "1",
        "page-length": "10",
        "facet": []
      },
      "recordCount": {
        "total": 0
      }
    }
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
}

module.exports = Search;
