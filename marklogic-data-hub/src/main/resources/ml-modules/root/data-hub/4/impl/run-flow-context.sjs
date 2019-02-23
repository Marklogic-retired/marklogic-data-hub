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

const consts = require('/data-hub/4/impl/consts.sjs');
const hul = require('/data-hub/4/impl/hub-utils-lib.xqy');
const ns = {hub: "http://marklogic.com/data-hub"};

let internalContexts = {
  globalContext: {},
  itemContext: {}
}

function setGlobalContext(context) {
  internalContexts.globalContext = context;
}

function getGlobalContext() {
  return internalContexts.globalContext;
}

function withFlow(flow) {
  let gc = getGlobalContext();
  if (gc.flow && gc['flow-type'] && gc['data-format']) {
    return gc;
  }
  gc.flow = flow;
  gc['flow-type'] = flow.type;
  gc['data-format'] = flow.dataFormat;
  return gc;
}

function withJobId(jobId) {
  let gc = getGlobalContext();
  gc['job-id'] = jobId;
  return gc;
}

function withDataFormat(dataFormat) {
  let gc = getGlobalContext();
  gc['data-format'] = dataFormat;
  return gc;
}

function withTargetDatabase(targetDatabase) {
  let gc = getGlobalContext();
  gc['target-database'] = targetDatabase;
  return gc;
}

function withModuleUri(moduleUri) {
  let gc = getGlobalContext();
  gc['module-uri'] = moduleUri;
  return gc;
}

function withCodeFormat(codeFormat) {
  let gc = getGlobalContext();
  gc['code-format'] = codeFormat;
  return gc;
}

function setItemContext(context) {
  internalContexts.itemContext = context;
}

function getItemContext() {
  return internalContexts.itemContext;
}

function newItemContext() {
  return {};
}

function withId(ic, identifier) {
  ic.identifier = identifier;
  return ic;
}

function withContent(ic, content) {
  ic.content = content;
  return ic;
}

function withOptions(ic, options) {
  ic.options = options;
  return ic;
}

function withTrace(ic, trace) {
  ic.trace = trace;
  return ic;
}

function getFlow() {
  return getGlobalContext().flow;
}

function getFlowName() {
  return getFlow().name;
}

function getFlowType() {
  return getGlobalContext()['flow-type'];
}

function getModuleUri() {
  return getGlobalContext()['module-uri'];
}

function getCodeFormat() {
  return getGlobalContext()['code-format'];
}

function getTargetDatabase() {
  return getGlobalContext()['target-database'];
}

function getDataFormat() {
  return getGlobalContext()['data-format'];
}

function isJson() {
  return getDataFormat() == consts.JSON;
}

function getJobId() {
  return getGlobalContext()['job-id'];
}

function getId(ic) {
  return ic.identifier;
}

function getContent(ic) {
  return ic.content;
}

function getOptions(ic) {
  return ic.options;
}

function getTrace(ic) {
  return ic.trace;
}

module.exports = {
  setGlobalContext: setGlobalContext,
  getGlobalContext: getGlobalContext,
  withFlow: withFlow,
  withJobId: withJobId,
  withDataFormat: withDataFormat,
  withTargetDatabase: withTargetDatabase,
  withModuleUri: withModuleUri,
  withCodeFormat: withCodeFormat,
  setItemContext: setItemContext,
  getItemContext: getItemContext,
  newItemContext: newItemContext,
  withId: withId,
  withContent: withContent,
  withOptions: withOptions,
  withTrace: withTrace,
  getFlow: getFlow,
  getFlowName: getFlowName,
  getFlowType: getFlowType,
  getModuleUri: getModuleUri,
  getCodeFormat: getCodeFormat,
  getTargetDatabase: getTargetDatabase,
  getDataFormat: getDataFormat,
  isJson: isJson,
  getJobId: getJobId,
  getId: getId,
  getContent: getContent,
  getOptions: getOptions,
  getTrace: getTrace
};
