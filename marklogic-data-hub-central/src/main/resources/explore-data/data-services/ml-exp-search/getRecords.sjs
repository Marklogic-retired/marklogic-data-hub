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
var recordIds;
recordIds = recordIds.toObject();
const ConfigurableSearch = require("/explore-data/search-lib/configurable-search-lib.sjs");
const configurableSearch = new ConfigurableSearch();

const documents = [];
const uris = recordIds["uris"];
uris.forEach(recordId => documents.push(configurableSearch.getDocument(recordId.toString(), recordIds.userid)));

documents;
