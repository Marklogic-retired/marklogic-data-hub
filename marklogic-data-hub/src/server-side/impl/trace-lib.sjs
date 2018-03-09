/**
  Copyright 2012-2018 MarkLogic Corporation

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

const config = require("/com.marklogic.hub/config.sjs");
if (!this.rfc) {
  this.rfc = require("/MarkLogic/data-hub-framework/impl/run-flow-context.sjs");
}
const tracelib = require('/MarkLogic/data-hub-framework/impl/trace-lib.xqy');

let internalContexts = {
  currentTraceSettings: {}
}

function setCurrentTraceSettings(settings) {
  internalContexts.currentTraceSettings = settings;
}

function getCurrentTraceSettings() {
  return internalContexts.currentTraceSettings;
}

function newTrace() {
  return {
    traceId: xdmp.random(),
    created: fn.currentDateTime()
  };
}

function enableTracing(enabled) {
  return tracelib.enableTracing(enabled);
}

function enabled() {
  return tracelib.enabled();
}

function hasErrors() {
  let ts = getCurrentTraceSettings();
  return !!ts['_has_errors'];
}

function incrementErrorCount() {
  let ts = getCurrentTraceSettings();
  ts.errorCount = tracelib.getErrorCount() + 1;
}

function getErrorCount() {
  let ts = getCurrentTraceSettings();
  return ts.errorCount || 0;
}

function addFailedItem(item)
{
  getFailedItems().push(item);
}

function addCompletedItem(item) {
  getCompletedItems().push(item);
}

function getCurrentTrace(currentTrace) {
  let ct = currentTrace || rfc.getTrace(rfc.getItemContext());
  if (!ct) {
    fn.error(xs.QName("MISSING_CURRENT_TRACE"));
  }
  return ct;
}

function setPluginLabel(label, currentTrace) {
  let ct = getCurrentTrace(currentTrace);
  ct.pluginLabel = label;
}

function getPluginLabel(currentTrace) {
  return currentTrace.pluginLabel;
}

function resetPluginInput(currentTrace) {
  let ct = getCurrentTrace(currentTrace);
  ct.pluginInput = {};
}

function getPluginInput(currentTrace) {
  let o = currentTrace.pluginInput;
  if (o) {
    if (rfc.isJson()) {
      let oo = {};
      for (let key in o) {
        let value = o[key];
        if (value instanceof BinaryNode) {
          value = "binary data";
        }
        oo[key] = value;
      }
      return oo;
    }
    else {
      const x = new NodeBuilder();
      return x.toNode();
      for (let key in o) {
        x.startElement(key);
        let value = o[key];
        if (value instanceof BinaryNode) {
          value = "binary data";
        }
        x.addNode(value);
        x.endElement();
      }
    }
  }
}

function setPluginInput(label, input, currentTrace) {
  let ct = getCurrentTrace(currentTrace);
  let existing = ct.pluginInput || {};
  existing[label] = input;
  ct.pluginInput = existing;
}

function getCompletedItems() {
  let ts = getCurrentTraceSettings();
  if (ts.completedItems) {
    return ts.completedItems;
  }

  let value = [];
  ts.completedItems = value;
  return value;
}

function getFailedItems() {
  let ts = getCurrentTraceSettings();
  if (ts.failedItems) {
    return ts.failedItems;
  }

  let value = [];
  ts.failedItems = value;
  return value;
}

function writeTrace(itemContext) {
  let identifier = rfc.getId(itemContext);
  if (identifier) {
    addCompletedItem(identifier);
  }
  writeErrorTrace(itemContext);
}

function writeErrorTrace(itemContext) {
  if (enabled() || hasErrors()) {
    let currentTrace = rfc.getTrace(itemContext);
    let trace = null;
    if (rfc.isJson()) {
      trace = {
        trace: {
          jobId: rfc.getJobId(),
          format: rfc.getDataFormat(),
          traceId: currentTrace.traceId,
          created: currentTrace.created,
          identifier: rfc.getId(itemContext),
          flowType: rfc.getFlowType(),
          hasError: hasErrors(),
          steps: []
        }
      };
      let i;
      for (i = 0; i < currentTrace.traceSteps.length; i++) {
        let step = currentTrace.traceSteps[i];
        trace.trace.steps.push(step);
      }
    }
    else {
      const x = new NodeBuilder();
      x.startDocument();
        x.startElement("trace");
          x.startElement("jobId");
            x.addText(rfc.getJobId());
          x.endElement();
          x.startElement("format");
            x.addText(rfc.getDataFormat());
          x.endElement();
          x.startElement("traceId");
            x.addText(currentTrace.traceId.toString());
          x.endElement();
          x.startElement("created");
            x.addText(currentTrace.created.toString());
          x.endElement();
          x.startElement("identifier");
            x.addText(rfc.getId(itemContext).toString());
          x.endElement();
          x.startElement("flowType");
            x.addText(rfc.getFlowType());
          x.endElement();
          x.startElement("hasError");
            x.addText(hasErrors().toString());
          x.endElement();
          x.startElement("steps");
            let i;
            for (i = 0; i < currentTrace.traceSteps.length; i++) {
              let step = currentTrace.traceSteps[i];
              x.startElement("step")
                x.startElement("label");
                  x.addText(step.label);
                x.endElement();
                x.startElement("input");
                  if (step.input) {
                    if (step.input instanceof XMLNode) {
                      x.addNode(step.input);
                    }
                    else {
                      x.addText(JSON.stringify(step.input));
                    }
                  }
                x.endElement();
                x.startElement("output");
                  if (step.output) {
                    if (step.output instanceof XMLNode) {
                      x.addNode(step.output);
                    }
                    else {
                      x.addText(JSON.stringify(step.output));
                    }
                  }
                x.endElement();
                x.startElement("error");
                  if (step.error) {
                    if (step.error instanceof XMLNode) {
                      x.addNode(step.error);
                    }
                    else {
                      x.addText(JSON.stringify(step.error));
                    }
                  }
                x.endElement();
                x.startElement("duration");
                  if (step.duration) {
                    x.addText(step.duration.toString());
                  }
                x.endElement();
                x.startElement("options");
                  if (step.options) {
                    if (step.options instanceof XMLNode) {
                      x.addNode(step.options);
                    }
                    else {
                      x.addText(JSON.stringify(step.options));
                    }
                  }
                x.endElement();
              x.endElement();
            }
          x.endElement();
        x.endElement();
      x.endDocument();
      trace = x.toNode();
    }
    let extension = rfc.isJson() ? '.json' : '.xml';
    xdmp.eval(
      'xdmp.documentInsert("/' + currentTrace.traceId + extension + '",' +
      'trace,' +
      'xdmp.defaultPermissions(),' +
      '["trace", "' + rfc.getFlowType() + '"])',
    {
      trace: trace
    },
    {
      database: xdmp.database(config.TRACEDATABASE),
      commit: 'auto',
      update: 'true',
      ignoreAmps: true
    })
  }
}

function pluginTrace(itemContext, output, duration) {
  let ic = itemContext || rfc.getItemContext();
  let currentTrace = rfc.getTrace(ic);

  if (enabled()) {
    let input = getPluginInput(currentTrace);
    let options = rfc.getOptions(ic);
    let newStep  = {
      label: getPluginLabel(currentTrace),
      input: input,
      output: output,
      duration: duration,
      options: options
    };
    let steps = currentTrace.traceSteps || [];
    steps.push(newStep);
    currentTrace.traceSteps = steps;
  }
}

function errorTrace(itemContext, error, duration) {
  let currentTrace = rfc.getTrace(itemContext);
  let identifier = rfc.getId(itemContext);
  incrementErrorCount();
  if (identifier) {
    addFailedItem(identifier);
  };
  let ts = getCurrentTraceSettings();
  ts['_has_errors'] = true;
  let traceSteps = currentTrace.traceSteps || [];

  traceSteps.push({
    label: getPluginLabel(currentTrace),
    input: getPluginInput(currentTrace),
    error: rfc.isJson() ? error : error,
    duration: duration,
    options: rfc.getOptions(itemContext)
  });
  currentTrace.traceSteps = traceSteps;
  writeErrorTrace(itemContext);
}


function findTraces(q, page, pageLength) {
  return tracelib.findTraces(q, page, pageLength);
}

function getTraces(page, pageLength) {
  return tracelib.getTraces(page, pageLength);
}

function getTrace(id) {
  return tracelib.getTrace(id);
}

function getTraceIds(q) {
  return getTraceIds(q);
}

module.exports = {
  setCurrentTraceSettings: setCurrentTraceSettings,
  getCurrentTraceSettings: getCurrentTraceSettings,
  newTrace: newTrace,
  enableTracing: enableTracing,
  enabled: enabled,
  hasErrors: hasErrors,
  incrementErrorCount: incrementErrorCount,
  getErrorCount: getErrorCount,
  addFailedItem: addFailedItem,
  addCompletedItem: addCompletedItem,
  setPluginLabel: setPluginLabel,
  getPluginLabel: getPluginLabel,
  resetPluginInput: resetPluginInput,
  getPluginInput: getPluginInput,
  setPluginInput: setPluginInput,
  getCompletedItems: getCompletedItems,
  getFailedItems: getFailedItems,
  writeTrace: writeTrace,
  writeErrorTrace: writeErrorTrace,
  pluginTrace: pluginTrace,
  errorTrace: errorTrace,
  findTraces: findTraces,
  getTraces: getTraces,
  getTrace: getTrace,
  getTraceIds: getTraceIds
};
