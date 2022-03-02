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
var user;

const ConfigurableSearch = require("/explore-data/search-lib/configurable-search-lib.sjs");
const configurableSearch = new ConfigurableSearch();

let recentlyVisitedRecords = [];
const uri = "/user-meta-data/".concat(user).concat(".json").toString();
let userMetaDataDoc = cts.doc(uri);

if(userMetaDataDoc) {
  userMetaDataDoc = userMetaDataDoc.toObject();
  const recentlyVisited = userMetaDataDoc.recentlyVisitedRecords;
  let recentlyVisitedDocUris = Object.keys(recentlyVisited).sort((uri1,uri2) => {
    const timeDiff = xs.dateTime(recentlyVisited[uri1]).subtract(recentlyVisited[uri2]);
    if(xs.dateTime(recentlyVisited[uri1]).ge(recentlyVisited[uri2])) {
      return -1;
    } else if(xs.dateTime(recentlyVisited[uri1]).lt(recentlyVisited[uri2])) {
      return 1;
    } else {
      return 0;
    }
  });
  recentlyVisitedDocUris.forEach(uri => recentlyVisitedRecords.push(configurableSearch.getDocument(uri.toString())));
}

recentlyVisitedRecords;
