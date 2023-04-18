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

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const merger = mjsProxy.requireMjsModule("/data-hub/5/mastering/merging/merger.mjs");

function get(context, params) {}

function post(context, params, input) {
  return merger.manualMerge(context, params, input);
}

function put(context, params, input) {
}

function deleteFunction(context, params) {
  return merger.manualUnmerge(context, params);
}

exports.GET = get;
exports.POST =  post;
exports.PUT = put;
exports.DELETE =  deleteFunction;