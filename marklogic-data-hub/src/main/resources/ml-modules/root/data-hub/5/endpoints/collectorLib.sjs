/*
 * Copyright 2016-2019 MarkLogic Corporation
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
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

/**
 * Determine the sourceQuery from the given options and stepDefinition and then prepare it for evaluation by the
 * collector endpoint.
 *
 * @param combinedOptions
 * @param stepDefinition
 * @return {string|*}
 */
function prepareSourceQuery(combinedOptions, stepDefinition) {
  let sourceQuery = combinedOptions.sourceQuery;
  let sourceQueryLimit = fn.number(combinedOptions.sourceQueryLimit);

  if (combinedOptions.sourceQueryIsScript) {
    if(sourceQueryLimit){
      hubUtils.warn( `Ignoring 'sourceQueryLimit' property as 'sourceQueryIsScript' is set to true`);
    }
    return fn.normalizeSpace(`${sourceQuery}`);
  }

  if (true == combinedOptions.constrainSourceQueryToJob) {
    if (combinedOptions.jobId) {
      sourceQuery = fn.normalizeSpace(`cts.andQuery([cts.fieldWordQuery('datahubCreatedByJob', '${combinedOptions.jobId}'), ${sourceQuery}])`);
    } else {
      hubUtils.warn( `Ignoring constrainSourceQueryToJob=true because no jobId was provided in the options`);
    }
  }

  // This is retained only for backwards compatibility, though its existence is neither documented nor tested
  // prior to DHFPROD-4665. Prior to DHFPROD-3854, this did support cts.values, though it would not have worked had
  // someone tried to use that, since the rest of DHF was still expecting URIs to be returned, not values.
  if (/^\s*cts\.uris\(.*\)\s*$/.test(sourceQuery)) {
    return sourceQuery;
  }

  return sourceQueryLimit ? `cts.uris(null, 'limit=${sourceQueryLimit}' , ${sourceQuery})` : `cts.uris(null, null, ${sourceQuery})`;
}


module.exports = {
  prepareSourceQuery
};

