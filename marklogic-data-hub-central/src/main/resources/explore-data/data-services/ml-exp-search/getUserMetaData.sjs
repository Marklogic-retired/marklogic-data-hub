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

let userMetadata = {};
const metaDocUri = "/user-meta-data/".concat(user).concat(".json").toString();
const docExists = fn.docAvailable(metaDocUri);

function getUserMetaData() {
  if(docExists) {
    const metaDoc = cts.doc(metaDocUri).toObject();
    getRecentRecordVisits(metaDoc);
    getRecentSearches(metaDoc);
  }
  return userMetadata;
}

function getRecentRecordVisits(metaDoc) {
  userMetadata["recentVisits"] = []
  const recentVisits = metaDoc.recentVisits;
  let recentlyVisitedDocUris = Object.keys(recentVisits).sort((uri1,uri2) => {
    const timeDiff = xs.dateTime(recentVisits[uri1]).subtract(recentVisits[uri2]);
    if(xs.dateTime(recentVisits[uri1]).ge(recentVisits[uri2])) {
      return -1;
    } else if(xs.dateTime(recentVisits[uri1]).lt(recentVisits[uri2])) {
      return 1;
    } else {
      return 0;
    }
  });
  recentlyVisitedDocUris.forEach(uri => userMetadata["recentVisits"].push(configurableSearch.getDocument(uri.toString())));
}

function getRecentSearches(metaDoc) {
  let recentSearches = metaDoc["recentSearches"];
  let recentSearchStrings = Object.keys(recentSearches).sort((search1,search2) => {
    if(xs.dateTime(recentSearches[search1]["timeStamp"]).gt(recentSearches[search2]["timeStamp"])) {
      return -1;
    } else if(xs.dateTime(recentSearches[search1]["timeStamp"]).lt(recentSearches[search2]["timeStamp"])) {
      return 1;
    } else {
      return 0;
    }
  });

  userMetadata["recentSearches"] = recentSearchStrings.map(searchString => recentSearches[searchString]);
}

getUserMetaData();
