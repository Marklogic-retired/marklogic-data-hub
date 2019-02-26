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

function applyOperations(isXml, libAt, calldefs) {
  if (!(typeof isXml === 'boolean' || isXml instanceof xs.boolean)) {
    fn.error(null, 'RESTAPI-INTERNALERROR', 'invalid isXml parameter: '+isXml);
  }
  if (libAt === void 0 || libAt === null) {
    fn.error(null, 'RESTAPI-INTERNALERROR', 'invalid libAt parameter: '+libAt);
  }
  if (!Array.isArray(calldefs)) {
    fn.error(null, 'RESTAPI-INTERNALERROR',
      'invalid calldefs parameter: '+xdmp.quote(calldefs));
  }

  if (calldefs.length === 0) {
    return null;
  }

  const errorList = [];

  const lib = require(libAt);
  if (lib === void 0) {
    errorList.push('could not read library: '+libAt);
  }

  const replaceMap = {};
  for (let calldef of calldefs) {
    const replacePath = calldef['replace-path'];
    const func = lib[calldef.fname];
    if (func === void 0) {
      errorList.push('no ',calldef.fname,' in library '+libAt+' for path: '+replacePath);
      continue;
    }
    const content = calldef.content;
    const nodes = calldef.nodes;
    if (nodes !== void 0 && nodes !== null) {
      for (let node of nodes) {
        replaceMap[fn.generateId(node)] = func(node, content);
      }
    } else {
      const contexts = calldef.contexts;
      if (contexts !== void 0 && contexts !== null) {
        for (let context of contexts) {
          replaceMap[fn.generateId(context)] = func(null, content);
        }
      } else {
        fn.error(null, 'RESTAPI-INTERNALERROR', 'no nodes or context for: '+replacePath);
      }
    }
  }

  if (errorList.length > 0) {
    return errorList;
  }
  return replaceMap;
}

module.exports = {
  applyOperations: applyOperations
};
