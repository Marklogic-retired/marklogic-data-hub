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

// No privilege required: this is currently a prototype effort

const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

var userConfig = fn.head(xdmp.fromJSON(userConfig));

const databases = [...new Set([config.STAGINGDATABASE, config.FINALDATABASE])];
databases.forEach(db => {
  hubUtils.writeDocument(
    "/data-hub-user-config.json",
    userConfig,
    [xdmp.permission("data-hub-common", "read"), xdmp.permission("data-hub-common-writer", "update")],
    consts.USER_CONFIG_COLLECTION,
    db);
});
