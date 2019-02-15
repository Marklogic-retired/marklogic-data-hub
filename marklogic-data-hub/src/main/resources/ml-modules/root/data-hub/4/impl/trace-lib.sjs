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

const config = require("/com.marklogic.hub/config.sjs");
if (!this.rfc) {
  this.rfc = require("/data-hub/4/impl/run-flow-context.sjs");
}
const tracelib = require('/data-hub/4/impl/trace-lib.xqy');

let internalContexts = {
  currentTraceSettings: {}
}

function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

function isString(value) {
  return typeof value == 'string' ||
    (!Array.isArray(value) && isObjectLike(value));
}

function isXmlNode(value) {
  return (value instanceof XMLNode && (value.nodeName !== null));
}

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
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
  ts.errorCount = getErrorCount() + 1;
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
        oo[key] = sanitizeData(value);
      }
      return oo;
    }

    // for xml build this
    let inputs = [];
    for (let key in o) {
      const nb = new NodeBuilder();
      nb.startElement(key);
      let value = sanitizeData(o[key]);
      if (value) {
        if (isXmlNode(value)) {
          nb.addNode(value);
        }
        else {
          nb.addText(value.toString());
        }
      }
      nb.endElement();
      inputs.push(nb.toNode());
    }
    return Sequence.from(inputs);
  }

  return null;
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
          hasError: false,
          steps: []
        }
      };
      let i;
      if (currentTrace && currentTrace.traceSteps) {
        for (i = 0; i < currentTrace.traceSteps.length; i++) {
          let step = currentTrace.traceSteps[i];
          trace.trace.steps.push(step);
          if (step.error) {
            trace.trace.hasError = true;
          }
        }
      }
    }
    else {
      const nb = new NodeBuilder();
      nb.startDocument();
        nb.startElement("trace");
          nb.startElement("jobId");
            nb.addText(rfc.getJobId().toString());
          nb.endElement();
          nb.startElement("format");
            nb.addText(rfc.getDataFormat().toString());
          nb.endElement();
          nb.startElement("traceId");
            nb.addText(currentTrace.traceId.toString());
          nb.endElement();
          nb.startElement("created");
            nb.addText(currentTrace.created.toString());
          nb.endElement();
          nb.startElement("identifier");
            nb.addText(rfc.getId(itemContext).toString());
          nb.endElement();
          nb.startElement("flowType");
            nb.addText(rfc.getFlowType().toString());
          nb.endElement();
          let hasErrors = false;
          nb.startElement("steps");
            let i;
            if (currentTrace && currentTrace.traceSteps) {
              for (i = 0; i < currentTrace.traceSteps.length; i++) {
                let step = currentTrace.traceSteps[i];
                nb.startElement("step")
                nb.startElement("label");
                nb.addText(step.label.toString());
                nb.endElement();
                nb.startElement("input");
                if (step.input) {
                  if (step.input instanceof Sequence) {
                    for (let i of step.input ) {
                      nb.addNode(i);
                    }
                  } else if (isXmlNode(step.input)) {
                    nb.addNode(step.input);
                  } else {
                    nb.addText(JSON.stringify(step.input));
                  }
                }
                nb.endElement();
                nb.startElement("output");
                if (step.output) {
                  if (isXmlNode(step.output)) {
                    nb.addNode(step.output);
                  } else if (isString(step.output)) {
                    nb.addText(step.output.toString());
                  } else {
                    nb.addText(step.output.toString());
                  }
                }
                nb.endElement();
                nb.startElement("error");
                if (step.error) {
                  hasErrors = true;
                  if (isXmlNode(step.error)) {
                    nb.addNode(step.error);
                  } else {
                    nb.addText(JSON.stringify(step.error));
                  }
                }
                nb.endElement();
                nb.startElement("duration");
                if (step.duration) {
                  nb.addText(step.duration.toString());
                }
                nb.endElement();
                nb.startElement("options");
                if (step.options) {
                  if (isXmlNode(step.options)) {
                    nb.addNode(step.options);
                  } else {
                    nb.addText(JSON.stringify(step.options));
                  }
                }
                nb.endElement();
                nb.endElement();
              }
            }
          nb.endElement();
          nb.startElement("hasError");
          nb.addText(hasErrors.toString());
          nb.endElement();
        nb.endElement();
      nb.endDocument();
      trace = nb.toNode();
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

function sanitizeData(data) {
  if (!data) {
    return null;
  }

  let result = data;
  if (data instanceof BinaryNode) {
    result = xs.hexBinary(data);
  }
  else if (!rfc.isJson() && !isXmlNode(data)) {
    result = xdmp.quote(data);
  }
  return result;
};

function pluginTrace(itemContext, output, duration) {
  let ic = itemContext || rfc.getItemContext();
  let currentTrace = rfc.getTrace(ic);
  output = sanitizeData(output);

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
  ts['_has_errors'] = false; //resetting the flag after writing error trace
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
  isXmlNode: isXmlNode
};
