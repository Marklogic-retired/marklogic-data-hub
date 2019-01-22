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

const flowlib = require("/data-hub/4/impl/flow-lib.sjs");
const tracelib = require("/data-hub/4/impl/trace-lib.sjs");

const _requireCache = {};

/**
 : Runs a given function as a plugin. This method provides
 : tracing around your function. Tracing will catch uncaught
 : exceptions and log them into the traces database.
 :
 : @param context - the context for this plugin
 : @param func - the function to run
 : @return - returns whatever your function returns
 */
function run(context, func)
{
  let label = context.label;

  if (label) {
    tracelib.setPluginLabel(label);
  } else {
    fn.error(null, "DATAHUB-CONTEXT-MISSING-LABEL", "Your context object is missing a label");
  }

  tracelib.resetPluginInput();

  let inputs = context.inputs
  for (let key in inputs) {
    tracelib.setPluginInput(key, inputs[key]);
  }

  return flowlib.safeRun(func)
};

/**
 : Creates a legacy envelope in the http://marklogic.com/data-hub/envelope namespace (if xml)
 : This is for users who upgraded from 1.x and have legacy envelopes already in production
 :
 : @param content - the content section of the envelope
 : @param headers - the headers section of the envelope
 : @param triples - the triples section of the envelope
 : @param dataFormat - the format to use for making the envelope (xml|json)
 */
function makeLegacyEnvelope(content, headers, triples, dataFormat) {
  return flowlib.makeLegacyEnvelope(content, headers, triples, dataFormat);
};

/**
 : Creates an entity services envelope in the http://marklogic.com/entity-services namespace (if xml)
 :
 : @param content - the content section of the envelope
 : @param headers - the headers section of the envelope
 : @param triples - the triples section of the envelope
 : @param dataFormat - the format to use for making the envelope (xml|json)
 */
function makeEnvelope(content, headers, triples, dataFormat) {
  return flowlib.makeEnvelope(content, headers, triples, dataFormat);
};

/**
 : Runs a writer plugin
 :
 : @param writer-function - the writer function to run
 : @param id - the id for the current flow execution
 : @param envelope - the envelope to write
 : @param options - a json object of options
 */
function runWriter(writerFunction, id, envelope, options) {
  flowlib.queueWriter(writerFunction, id, envelope, options);
};

/**
 : Creates a generic context for use in any plugin
 :
 : @param label - the label to give this plugin for tracing
 **/
function context(label) {
  let context = {
    inputs: {}
  };
  setTraceLabel(context, label);
  return context;
};

/**
 : Creates a context for a content plugin
 */
function contentContext() {
  return context('content');
};

/**
 : Creates a context for a content plugin
 */
function contentContext(rawContent) {
  let ctx = context('content');
  if(rawContent) {
    addTraceInput(ctx, "rawContent", rawContent);
  }
  return ctx;
};

/**
 : Creates a context for a headers plugin
 */
function headersContext(content) {
  let ctx = context('headers');
  addTraceInput(ctx, "content", content);
  return ctx;
};

/**
 : Creates a context for a triples plugin
 */
function triplesContext(content, headers) {
  let ctx = context('triples');
  addTraceInput(ctx, "content", content);
  addTraceInput(ctx, "headers", headers);
  return ctx;
};

/**
 : Creates a context for a writer plugin
 */
function writerContext(envelope) {
  let ctx = context('writer');
  addTraceInput(ctx, "envelope", envelope);
  return ctx;
};

/**
 : Sets the trace label for a given context
 : Used internally. private.
 :
 : @param context - the context
 : @param label - the label for the context
 :
 : @return - returns the passed in context
 */
function setTraceLabel(context, label) {
  context.label = label;
  return context;
};

/**
 : Adds a trace input to the context
 : You can add as many trace inputs as you like so long
 : as each one has a unique label
 :
 : @param context - the context
 : @param inputLabel - the label for the input
 : @param input - the input to add to the context
 :
 : @return - returns the passed in context
 */
function addTraceInput(context, inputLabel, input) {
  let inputs = context.inputs;
  inputs[inputLabel] = input;
  context.inputs = inputs;
  return context;
};

function logTrace(context) {
  let label = context.label;
  if (label) {
    tracelib.setPluginLabel(label);
  } else{
    fn.error(null, "DATAHUB-CONTEXT-MISSING-LABEL", "Your context object is missing a label");
  }

  tracelib.resetPluginInput();

  let inputs = context.inputs;
  for (let key in inputs) {
    tracelib.setPluginInput(key, inputs[key]);
  }
  tracelib.pluginTrace(null, null, "PT0S");
};

module.exports = {
  run: run,
  makeLegacyEnvelope: makeLegacyEnvelope,
  makeEnvelope: makeEnvelope,
  runWriter: runWriter,
  context: context,
  contentContext: contentContext,
  headersContext: headersContext,
  triplesContext: triplesContext,
  writerContext: writerContext,
  addTraceInput: addTraceInput,
  logTrace: logTrace
};
