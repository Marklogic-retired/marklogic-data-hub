/**
  Copyright 2012-2019 MarkLogic Corporation

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
const config = require("/com.marklogic.hub/config.sjs");

class HubUtils {
  constructor() {
    this.config = config;
  }
  writeDocument(docUri, job, collections){
    xdmp.eval('xdmp.documentInsert("' + docUri + '",' + 'job,' + '{permissions:xdmp.defaultPermissions(),collections:[' + collections +']})',
    {
    job: job,
    docUri:docUri,
    collections:collections
    },
    {
     database: xdmp.database(config.JOBDATABASE),
     commit: 'auto',
     update: 'true',
     ignoreAmps: true
    })
  }
  deleteDocument(docUri){
    xdmp.eval('xdmp.documentDelete("' + docUri + '")',
    {
      docUri:docUri
    },
    {
      database: xdmp.database(config.JOBDATABASE),
      commit: 'auto',
      update: 'true',
      ignoreAmps: true
    })
  }
}

module.exports = HubUtils;
