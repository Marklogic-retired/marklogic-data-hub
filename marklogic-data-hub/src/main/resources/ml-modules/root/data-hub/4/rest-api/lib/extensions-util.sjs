/*
 * Copyright 2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const arrayKeys = new Set(['input-types', 'acceptTypes']);

function getExtName(extName, modPath) {
  if (extName !== void 0 && extName !== null) {
    return extName;
  }
  return modPath.replace(/^\/[^\/]+\/([^\/]+)\/.*$/, '$1');
}
function hyphenToCamel(hychar) {
  return hychar.charAt(1).toUpperCase();
}
function camelToHyphen(cap) {
  return cap.charAt(0).concat('-', cap.charAt(1).toLowerCase());
}
function contextMapping(context) {
  const mappedKeys = {};
  const mappedContext = {};
  const keyRegEx = /-[a-z]/g;
  for (const key of Object.keys(context)) {
    const mappedKey = key.replace(keyRegEx, hyphenToCamel);
    mappedKeys[mappedKey] = key;
    const val = context[key];
    mappedContext[mappedKey] =
      (val instanceof Sequence) ? val.toArray() :
      arrayKeys.has(key)        ? [val] :
      val;
  }
  return {keys: mappedKeys, context: mappedContext};
}
function paramMapping(params) {
  for (const key of Object.keys(params)) {
    const val = params[key];
    if (val instanceof Sequence) {
      params[key] = val.toArray();
    }
  }
  return params;
}
function makeResult(result) {
  if (result instanceof Document) {
    return result;
  } else if (result instanceof Node) {
    const builder = new NodeBuilder();
    builder.startDocument();
    builder.addNode(result);
    builder.endDocument();
    return builder.toNode();
  } else if (result === void 0 || result === null) {
    return null;
  }
  return xdmp.toJSON(result);
}
function makeOutput(mapping, results) {
  const mappedKeys    = mapping.keys;
  const mappedContext = mapping.context;
  const context       = {};
  const mappedKeyRegEx = /[a-z][A-Z](?=[a-z])/g;
  for (const mappedKey of Object.keys(mappedContext)) {
    let key = mappedKeys[mappedKey]
    if (key === void 0) {
      key = mappedKey.replace(mappedKeyRegEx, camelToHyphen);
    }
    const val = mappedContext[mappedKey];
    context[key] = Array.isArray(val) ? Sequence.from(val) : val;
  }
  const resultNodes =
    (results instanceof Sequence) ? Sequence.from(results.toArray().map(result => makeResult(result))) :
    makeResult(results);
  const output = (results === void 0) ?
    {context: context} :
    {context: context, result: resultNodes};
  return output;
}
function callExtension(func, context, params, input) {
  const mapping = contextMapping(context);
  return makeOutput(mapping, func(mapping.context, params, input));
}
function getExtension(extName, modPath, funcName) {
  let mod = null;
  try {
    mod = require(modPath);
  } catch(e) {
    fn.error(null, 'RESTAPI-INVALIDREQ',
      `cannot read module ${modPath} for extension ${getExtName(extName, modPath)}`);
  }
  const func = mod[funcName];
  if (func === void 0) {
    fn.error(null, 'RESTAPI-INVALIDREQ',
      `cannot read function ${funcName} from module ${modPath} for extension ${getExtName(extName, modPath)}`);
  }
  return func;
}
function applyOnce(extName, modPath, funcName, context, params, input) {
  return callExtension(
    getExtension(extName, modPath, funcName), context, paramMapping(params), input
    );
}
function applyList(extName, modPath, funcName, requests, params) {
  if (requests === void 0 || requests === null) {
    return {response: null};
  }

  const func         = getExtension(extName, modPath, funcName);
  const mappedParams = paramMapping(params);
  requests = (requests instanceof Sequence) ? requests.toArray() : requests;
  return {response:
      Array.isArray(requests) ?
      Sequence.from(
        requests.map(request => callExtension(func, request.context, mappedParams, request.input))
        ) :
      callExtension(func, requests.context, mappedParams, requests.input)
    };
}

module.exports = {
  applyList: applyList,
  applyOnce: applyOnce
};
