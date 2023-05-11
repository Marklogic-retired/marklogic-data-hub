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

/**
 * Feature that handles the schema validation of the artifacts and instances.
 */

import consts from "/data-hub/5/impl/consts.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import entityValidation from "/data-hub/5/builtins/steps/mapping/entity-services/entity-validation-lib.mjs";
const es = require('/MarkLogic/entity-services/entity-services');
const hent = require("/data-hub/5/impl/hub-entities.xqy");

const INFO_EVENT = consts.TRACE_CORE;
const DEBUG_EVENT = consts.TRACE_CORE_DEBUG;
const DEBUG_ENABLED = xdmp.traceEnabled(DEBUG_EVENT);

function onArtifactSave(artifactType, artifactName, artifactUri, entityModel) {
  if ("model" === artifactType) {
    let invalidModel = false;
    try {
      es.modelValidate(xdmp.toJSON(entityModel));
    } catch (e) {
      invalidModel = true;
    }
    if (invalidModel) {
      hubUtils.hubTrace(INFO_EVENT, `Not creating schemas for ${artifactName} because the model is invalid.`);
      return;
    }
    hubUtils.hubTrace(INFO_EVENT, `Schema validation feature: Creating schemas for ${artifactName}.`);

    let schemaPermissions = xdmp.defaultPermissions().concat([
      xdmp.permission("data-hub-common", "read"),
      xdmp.permission("data-hub-entity-model-writer", "update")]);
    let xmlSchemaCollection = "ml-data-hub-xml-schema";
    let jsonSchemaCollection = "ml-data-hub-json-schema";

    let xmlSchema = fn.head(es.schemaGenerate(entityModel));

    const jsonSchema = hent.jsonSchemaGenerate(entityModel.info.title, entityModel);
    xdmp.invokeFunction(function () {
      xdmp.documentInsert(fn.replace(artifactUri, "\\.json$", ".xsd"), xmlSchema, schemaPermissions, xmlSchemaCollection);
      xdmp.documentInsert(fn.replace(artifactUri, "\\.json$", ".schema.json"), jsonSchema, schemaPermissions, jsonSchemaCollection);
    }, {database: xdmp.schemaDatabase(), update: "true"});

    hubUtils.hubTrace(INFO_EVENT, `Schema validation feature: Finished creating schemas for ${artifactName}.`);

  }
}

function onInstanceSave(stepContext, model, contentArray) {
  if (!model) {
    return;
  }
  hubUtils.hubTrace(INFO_EVENT, `Schema validation feature: Validating schema for content of type ${model.info.title}.`);

  const options = stepContext.flowStep.options;
  contentArray.forEach(contentObject => {
    entityValidation.validateEntity(contentObject, options, model.info);
  });
  if (options.headers != null && options.headers.datahub != null && options.headers.datahub.validationErrors != null) {
    const errors = options.headers.datahub.validationErrors;
    hubUtils.hubTrace(INFO_EVENT, `Schema validation feature: Schema validation for content of type ${model.info.title} got errors.`);
    if (DEBUG_ENABLED) {
      errors.formattedMessages.forEach(msg => {
        hubUtils.hubTrace(DEBUG_EVENT, `Schema validation feature: Error - ${msg}`);
      });
    }
  } else {
    hubUtils.hubTrace(INFO_EVENT, `Schema validation feature: Schema validation for content of type ${model.info.title} passed.`);
  }
}

export default {
  onArtifactSave,
  onInstanceSave
};
