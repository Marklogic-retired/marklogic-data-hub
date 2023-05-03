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
// must keep as sjs to be compatible with MLCP, otherwise we get the following error: XDMP-NOEXECUTE: var xform = require(transformModule)[transformFunction]; -- Document is not of executable mimetype. URI: /data-hub/5/transforms/mlcp-flow-transform.mjs
// also, emptySequence is declared prior to mjsProxy so type checking by MLCP isn't corrupted
const emptySequence = Sequence.from([]);
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const mlcpTransform = mjsProxy.requireMjsModule("/data-hub/5/transforms/mlcp-flow-transform.mjs");


function transform(content, context = {}) {
  const result = mlcpTransform.transform(content, context);
  // server bug requires an empty sequence constructed in SJS to be returned instead of the empty sequence from mjs
  return fn.empty(result) ? emptySequence: result;
}

module.exports = {transform};