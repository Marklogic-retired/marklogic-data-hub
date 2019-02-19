/*
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

const Jobs = require("/data-hub/5/impl/jobs.sjs");
const HubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const Flow = require("/data-hub/5/impl/flow.sjs");
const Step = require("/data-hub/5/impl/step.sjs");
const Prov = require("/data-hub/5/impl/prov.sjs");
const Debug = require("/data-hub/5/impl/debug.sjs");
const defaultConfig = require("/com.marklogic.hub/config.sjs");
const _requireCache = {};

class DataHub {

  constructor(config = null){
    if(!config) {
      config = defaultConfig;
    }
    this.config = config;
    this.hubUtils = new HubUtils(config);
    this.flow = new Flow(config);
    this.process = new Step(config);
    this.jobs = new Jobs(config);
    this.prov = new Prov(config);
    this.debug = new Debug(config);
  }
  getConfig() {
    return this.hubUtils.getConfig();
  }

}

module.exports = DataHub;
