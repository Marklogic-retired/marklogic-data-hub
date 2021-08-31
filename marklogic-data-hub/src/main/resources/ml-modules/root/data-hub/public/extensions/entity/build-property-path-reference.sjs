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

const hubEs = require('/data-hub/5/impl/hub-es.sjs');

/**
 * Invoked when DHF needs to build a path reference based on a given entity type and property path; the path reference
 * is then used to retrieve values from an index. By default, this assumes an entity document will conform to the ES
 * envelope and the path expression is thus built off this assumption.
 *
 * @param {string} entityTypeId full entity type identifier; e.g. http://example.org/Person-1.0/Person
 * @param {string} propertyPath dot-separated path to a property in the entity model; e.g. "shipping.zip.code"
 * @returns a cts.pathReference instance
 */
function buildPropertyPathReference(entityTypeId, propertyPath) {
  const result = hubEs.buildPathReferenceParts(entityTypeId, propertyPath);
  return cts.pathReference(result.pathExpression, null, result.namespaces);
}

module.exports = {
  buildPropertyPathReference
}
