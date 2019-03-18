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
const consts = require("/data-hub/4/impl/consts.sjs");
const debug = require("/data-hub/4/impl/debug-lib.xqy");
const hul = require("/data-hub/4/impl/hub-utils-lib.xqy");
const json=require("/MarkLogic/json/json.xqy");
const functx = require("/MarkLogic/functx/functx-1.0-nodoc-2007-01.xqy");
if (!this.rfc) {
  this.rfc = require("/data-hub/4/impl/run-flow-context.sjs");
}
const tracelib = require("/data-hub/4/impl/trace-lib.sjs");
const flowlib = require("/data-hub/4/impl/flow-lib.xqy");

const ns = {hub: "http://marklogic.com/data-hub"};

const MAIN_CACHE_KEY_PREFIX = "main-cache-";
const FLOW_CACHE_KEY_PREFIX = "json-flow-cache-";
// the directory where entities live
const ENTITIES_DIR = "/entities/";

const PLUGIN_NS = "http://marklogic.com/data-hub/plugins";

let contextQueue = {};
let writerQueue = {};

function getModuleNs(type) {
  if (type === consts.JAVASCRIPT) {
    return null;
  }
  return PLUGIN_NS;
}

function getFlow(entityName, flowName, flowType) {
  let duration = xs.dayTimeDuration("PT10S")
  let key = FLOW_CACHE_KEY_PREFIX + entityName + flowName + flowType;
  let flow =  fn.head(hul.fromFieldCacheOrEmpty(key, duration));
  if (!flow) {
    let xmlFlow = fn.head(flowlib.getFlowNocache(entityName, flowName, flowType));
    let config = json.config('custom');
    config['camel-case'] = true;
    config.whitespace = 'ignore';
    flow = json.transformToJson(xmlFlow, config).root.toObject().flow;
    hul.setFieldCache(
      key,
      flow,
      duration
    );
  }

  return flow;
}

function getFlows(entityName) {
  return flowlib.getFlows(entityName);
}

function runFlow(jobId, flow, identifier, content, options, mainFunc) {
  // configure the global context
  rfc.withJobId(jobId);
  rfc.withFlow(flow);

  if (options) {
    let targetDb = options['target-database'];
    if (targetDb) {
      rfc.withTargetDatabase(targetDb);
    }
  }

  // configure the item context
  let itemContext = rfc.newItemContext();
  rfc.withId(itemContext, identifier);
  let c = content;
  if (content) {
    if (content instanceof XMLDocument) {
      c = content.documentElement;
    } else if (xdmp.nodeKind(content) === 'document') {
      c = content.root;
    }
  }
  if (c != null && xdmp.nodeKind(c) === 'object') {
    c = c.toObject();
  }

  if (c) {
    rfc.withContent(itemContext, c);
  }
  rfc.withOptions(itemContext, options);
  rfc.withTrace(itemContext, tracelib.newTrace());

  rfc.setItemContext(itemContext);

  return runMain(itemContext, mainFunc);
};

function cleanData(resp, destination, dataFormat)
{
  if (resp instanceof Document) {
    if (fn.count(resp.xpath('node()')) > 1) {
      fn.error(null, "DATAHUB-TOO-MANY-NODES", Sequence.from([400, "Too Many Nodes!. Return just 1 node"]));
    } else {
      resp = resp.xpath('node()');
    }
  }

  if (resp instanceof BinaryNode) {
    return xs.hexBinary(resp);
  }

  let kind = xdmp.nodeKind(resp);
  let isXml = (kind === 'element');
  if (!isXml) {
    // object with $type key is ES response type
    if (resp instanceof Object && resp.hasOwnProperty('$type')) {
      return resp;
    }
    else if (dataFormat === consts.XML) {
      return json.transformFromJson(resp, json.config("custom"));
    }
    else {
      return resp;
    }
  } else if (resp instanceof ArrayNode || resp instanceof Array) {
    if (dataFormat === consts.XML) {
      return json.arrayValues(resp);
    }
    else {
      return resp;
    }
  } else if (resp === null) {
    if (destination === "headers" && dataFormat === consts.JSON) {
      return {};
    }
    else if (destination === "triples" && dataFormat === consts.JSON) {
      return [];
    }
    else {
      return resp;
    }
  }

  if (dataFormat === consts.JSON &&
      rfc.getCodeFormat() === consts.XQUERY &&
      destination === "triples") {
    return json.toArray(resp);
  }

  return resp;
}

function tripleToXml(triple) {
  let n = json.transformFromJson({trip: triple}, json.config("custom"));
  return fn.head(n).xpath('node()')
}

/**
: parse out invalid elements from json conversion, such as comments and PI
  :
  : @param input - the xml you want cleaned
  : @return - a copy of the xml without the bad elements
 */

function cleanXMLforJSON(input) {
  for(let node in input) {
    if(node instanceof Text){
      fn.replace(node,"<\?[^>]+\?>","")
    } else if(node instanceof Element){
    } else if(node instanceof Comment){
      return;
    } else if (node instanceof ProcessingInstruction){
      return;
    }else {
      return node;
    }
  }
}

/**
 : Construct an envelope
 :
 : @param map - a map with all the stuff in it
 : @return - the newly constructed envelope
 */
function makeEnvelope(content, headers, triples, dataFormat) {
  content = cleanData(content, "content", dataFormat);
  headers = cleanData(headers, "headers", dataFormat);
  triples = cleanData(triples, "triples", dataFormat);
  let instance = null;
  if (dataFormat === consts.JSON) {
    if (content instanceof Object && content.hasOwnProperty("$type")) {
      instance = instanceToCanonicalJson(content);
      instance.info = {
        title: content['$type'],
        version: content['$version']
      };
    }
    else {
      instance = content;
    }

    let attachments = null;
    if (content instanceof Object && content.hasOwnProperty("$attachments")) {
      if(content['$attachments'] instanceof Element){
        let config = json.config('custom');
        config['element-namespace'] = "http://marklogic.com/entity-services";
        attachments = json.transformToJson(flowlib.cleanXmlForJson(content['$attachments']), config);
      } else {
        attachments = content['$attachments'];
      }
    }

    return {
      envelope: {
        headers: headers,
        triples: triples,
        instance: instance,
        attachments: attachments
      }
    };
  }
  else if (dataFormat === consts.XML) {
    const nb = new NodeBuilder();
    nb.startDocument();
      nb.startElement("envelope", "http://marklogic.com/entity-services");
        nb.startElement("headers", "http://marklogic.com/entity-services");
        if (headers && headers instanceof Sequence) {
          for (let header of headers) {
            nb.addNode(header);
          }
        } else if(headers) {
          nb.addNode(headers);
        }
        nb.endElement();

        nb.startElement("triples", "http://marklogic.com/entity-services");
        if (triples && triples instanceof Sequence) {
          for (let triple of triples) {
            if (triple instanceof sem.triple) {
              nb.addNode(tripleToXml(triple));
            }
            else {
              nb.addNode(triple);
            }
          }
        } else if (triples) {
          if (triples instanceof sem.triple) {
            nb.addNode(tripleToXml(triples));
          }
          else {
            nb.addNode(triples);
          }
        }
        nb.endElement();

        nb.startElement("instance", "http://marklogic.com/entity-services");
        if (content instanceof Object && content.hasOwnProperty("$type")) {
          nb.startElement("info", "http://marklogic.com/entity-services");
            nb.startElement("title", "http://marklogic.com/entity-services");
              nb.addText(content["$type"]);
            nb.endElement();
            nb.startElement("version", "http://marklogic.com/entity-services");
              nb.addText(content["$version"]);
            nb.endElement();
          nb.endElement();
          let canonical = instanceToCanonicalXml(content);
          if (canonical) {
            nb.addNode(canonical);
          }
        }
        else if (content) {
          if (content instanceof Sequence) {
            for (let c of content) {
              nb.addNode(c);
            }
          } else if (tracelib.isXmlNode(content)) {
            nb.addNode(content);
          } else {
            nb.addText(content.toString());
          }
        }
        nb.endElement();

        nb.startElement("attachments", "http://marklogic.com/entity-services");
        if (content instanceof Object && content.hasOwnProperty("$attachments")) {
            let attachments = content["$attachments"];
            if (attachments instanceof XMLDocument || tracelib.isXmlNode(attachments)) {
              nb.addNode(attachments);
            } else {
              let config = json.config('custom');
              let  cx = (config, 'attribute-names' , ('subKey' , 'boolKey' , 'empty' ));
              nb.addNode(json.transformFromJson(attachments, config));
            }
        }
        nb.endElement();
      nb.endElement();
    nb.endDocument();
    return nb.toNode();
  }

  fn.error(null, "RESTAPI-INVALIDCONTENT", Sequence.from(["Invalid data format: " + dataFormat + ".  Must be JSON or XML"]))
};

function makeLegacyEnvelope(content, headers, triples, dataFormat) {
  content = cleanData(content, "content", dataFormat);
  headers = cleanData(headers, "headers", dataFormat);
  triples = cleanData(triples, "triples", dataFormat);
  if (dataFormat === consts.JSON) {
    return {
      envelope: {
        headers: headers,
        triples: triples,
        content: content
      }
    };
  }
  else if (dataFormat === consts.XML) {
    const nb = new NodeBuilder();
    nb.startDocument();
      nb.startElement("envelope", "http://marklogic.com/data-hub/envelope");
        nb.startElement("headers", "http://marklogic.com/data-hub/envelope");
        if (headers) {
          if (headers instanceof Sequence) {
            for (let header of headers) {
              nb.addNode(header);
            }
          }
          else {
            nb.addNode(headers);
          }
        }
        nb.endElement();
        nb.startElement("triples", "http://marklogic.com/data-hub/envelope");
        if (triples) {
          if (triples instanceof Sequence) {
            for (let triple of triples) {
              if (triple instanceof sem.triple) {
                nb.addNode(tripleToXml(triple));
              }
              else {
                nb.addNode(triple);
              }
            }
          } else {
            if (triples instanceof sem.triple) {
              nb.addNode(tripleToXml(triples));
            }
            else {
              nb.addNode(triples);
            }
          }
        }
        nb.endElement();
        nb.startElement("content", "http://marklogic.com/data-hub/envelope");
        if (content) {
          nb.addNode(content);
        }
        nb.endElement();
      nb.endElement();
    nb.endDocument();
    return nb.toNode();
  }

  fn.error(null, "RESTAPI-INVALIDCONTENT", Sequence.from(["Invalid data format: " + dataFormat + ".  Must be JSON or XML"]))
};

function instanceToCanonicalJson(entityInstance) {
  let o;
  if (entityInstance['$ref']) {
    o = entityInstance['$ref'];
  }
  else {
    o = {};
    for (let key in entityInstance) {
      if (key === '$attachments' || key === '$type' || key === '$version') {
      } else {
        let instanceProperty = entityInstance[key];
        if (instanceProperty instanceof Array) {
          let a = [];
          let i = 0;
          for (i = 0; i < instanceProperty.length; i++) {
            let val = instanceProperty[i];
            if (val instanceof Object) {
              a.push(instanceToCanonicalJson(val));
            } else {
              a.push(val);
            }
          }
          o[key] = a;
        } else {
          o[key] = instanceProperty;
        }
      }
    }
  }
  let rootObject = {};
  if (entityInstance['$type'] != undefined) {
    rootObject[entityInstance['$type']] = o;
  } else {
    rootObject = o;
  }
  return rootObject;
}

function getElementName(ns, nsPrefix, name) {
  return ns && nsPrefix ? nsPrefix + ':' + name : name;
}

function getElementNamespace(ns, nsPrefix) {
  return ns && nsPrefix ? ns : null;
}

function instanceToCanonicalXml(entityInstance) {
  let namespace = entityInstance['$namespace'];
  let namespacePrefix = entityInstance['$namespacePrefix'];
  let typeName = entityInstance['$type'];
  let typeQName = getElementName(namespace, namespacePrefix, typeName);
  let ns = getElementNamespace(namespace, namespacePrefix);
  const nb = new NodeBuilder();
  nb.startDocument();
    nb.startElement(typeQName, ns);
      if (entityInstance['$ref']) {
        nb.addNode(entityInstance['$ref']);
      } else {
        for (let key in entityInstance) {
          if (xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'NCName', key) && key !== '$type') {
            let nsKey = getElementName(namespace, namespacePrefix, key);
            let prop = entityInstance[key];
            if (prop instanceof Sequence) {
              for (let item of prop) {
                if (item instanceof ObjectNode) {
                  instanceToCanonicalXml(item);
                } else {
                  nb.startElement(nsKey, ns);
                  if (item) {
                    nb.addNode(item);
                  }
                  nb.endElement();
                }
              }
            } else if (prop instanceof Array) {
              for (let item of prop) {
                if (item instanceof Object) {
                  nb.startElement(nsKey, ns);
                  nb.addAttribute('datatype', 'array');
                  let canonical = instanceToCanonicalXml(item);
                  if (canonical) {
                    nb.addNode(canonical);
                  }
                  nb.endElement();
                }
                else {
                  nb.startElement(nsKey, ns);
                  nb.addAttribute('datatype', 'array');
                  if (item) {
                    nb.addNode(item);
                  }
                  nb.endElement();
                }
              }
            }
            else {
              nb.startElement(nsKey, ns);
              if(prop) {
                nb.addText(prop.toString());
              }
              nb.endElement();
            }
          }

        }
      }
    nb.endElement();
  nb.endDocument();
  return nb.toNode();
};

function setDefaultOptions(options, flow) {
  options.entity = flow.entity;
  options.flow = flow.name;
  options.flowType = flow.type;
  options.dataFormat = flow.dataFormat;
};

function getMainFunc(main) {

  // sanity check on required info
  let moduleUri = main.module;
  if (!main.module || !main.codeFormat) {
    fn.error(null, "DATAHUB-INVALID-PLUGIN", Sequence.from(["The plugin definition is invalid."]));
  }
  rfc.withModuleUri(moduleUri);
  rfc.withCodeFormat(main.codeFormat);

  let duration = xs.dayTimeDuration("PT20S");
  let key = MAIN_CACHE_KEY_PREFIX + moduleUri;

  let func = makeFunction("main", moduleUri);
  // let func = fn.head(hul.fromFieldCacheOrEmpty(key, duration));
  // if (!func) {
  //   func = makeFunction("main", moduleUri);
  //   hul.setFieldCache(key, func, duration);
  // }

  return func;
}

function runMain(itemContext, func) {
  // let func = makeFunction("main", moduleUri);
  let before = xdmp.elapsedTime();
  let id = rfc.getId(itemContext);
  contextQueue[id] = itemContext;

  let resp;
  try {
    let options = rfc.getOptions(itemContext);
    let id = rfc.getId(itemContext);
    if (rfc.getFlowType() === consts.HARMONIZE_FLOW) {
      resp = func(id, options);
    }
    else {
      let content = rfc.getContent(itemContext);
      resp = func(id, content, options);
    }
  }
  catch(ex) {
    if (! ex.name.includes("DATAHUB-PLUGIN-ERROR")) {
      // this is an error in main.(sjs|xqy)
      // log the trace event for main
      tracelib.setPluginLabel("main", rfc.getTrace(itemContext));
      tracelib.errorTrace(itemContext, {'message' : ex.message, 'stack' : ex.stack, 'stackFrames': ex.stackFrames}, xdmp.elapsedTime().subtract(before));
      throw(ex);
    }  else {
      throw(ex);
    }
  }

  if (resp instanceof Sequence) {
    resp = fn.head(resp);
  }
  return resp;
};

function queueWriter(writerFunction, identifier, envelope, options) {
  writerQueue[identifier] = {
    writerFunction: writerFunction,
    envelope: envelope,
    options: options
  };
}

function runWriters(identifiers) {
  let updatedSettings =
    fn.head(xdmp.eval(
    '  let flowlib = require("/data-hub/4/impl/flow-lib.sjs"); ' +
    '  let rfc = require("/data-hub/4/impl/run-flow-context.sjs"); ' +
    '  let tracelib = require("/data-hub/4/impl/trace-lib.sjs"); ' +
    '  rfc.setGlobalContext(rfcContext); ' +
    '  tracelib.setCurrentTraceSettings(currentTraceSettings); ' +
    '  for (let identifier of identifiers) { ' +
    '    let itemContext = contextQueue[identifier]; ' +
    '    let writerInfo = writerQueue[identifier]; ' +
    '    if (writerInfo) { ' +
    '      flowlib.runWriter( ' +
    '        writerInfo.writerFunction, ' +
    '        itemContext, ' +
    '        identifier, ' +
    '        writerInfo.envelope, ' +
    '        writerInfo.options ' +
    '      ); ' +
    '    } ' +
    '  } ' +
    '  tracelib.getCurrentTraceSettings(); ',
    {
      identifiers: identifiers,
      contextQueue: contextQueue,
      writerQueue: writerQueue,
      rfcContext: rfc.getGlobalContext(),
      currentTraceSettings: tracelib.getCurrentTraceSettings()
    },
    {
      ignoreAmps: true,
      isolation: "different-transaction",
      database: rfc.getTargetDatabase(),
      transactionMode: "update-auto-commit"
    }));

  tracelib.setCurrentTraceSettings(updatedSettings);
}

/**
 : Run a given writer
 :
 : @param writer - xml describing the writer to run
 : @param identifier - the identifier to send to the flow steps (URI in corb lingo)
 : @param envelope - the envelope
 : @param options - a map of options passed in by the client
 : @return - the output of the writer. It varies.
 */
function runWriter(writerFunction, itemContext, identifier, envelope, options) {
  let before = xdmp.elapsedTime();
  let currentTrace = rfc.getTrace(itemContext);
  tracelib.setPluginLabel("writer", currentTrace);
  tracelib.resetPluginInput(currentTrace);
  tracelib.setPluginInput("envelope", envelope, currentTrace);
  tracelib.getCurrentTraceSettings();
  let resp = null;
  try {
      // resp = xdmp.apply(writerFunction, identifier, envelope, options);
      resp = writerFunction(identifier, envelope, options);

      tracelib.pluginTrace(itemContext, null, xdmp.elapsedTime().subtract(before));

      // write the trace for the current identifier
      tracelib.writeTrace(itemContext);
  }
  catch(ex) {
    tracelib.errorTrace(itemContext, {'message' : ex.message, 'stack' : ex.stack, 'stackFrames': ex.stackFrames}, xdmp.elapsedTime().subtract(before));
  }

  return resp;
};

function safeRun(func) {
  let before = xdmp.elapsedTime();
  try {
    let resp = func();
    let duration = xdmp.elapsedTime().subtract(before);
    if(!resp instanceof Document){
      resp = xdmp.describe(resp, 1000000, 1000000);
    }
    tracelib.pluginTrace(rfc.getItemContext(), resp, duration);
    return resp;
  }
  catch(ex) {
    tracelib.errorTrace(rfc.getItemContext(), {'message' : ex.message, 'stack' : ex.stack, 'stackFrames': ex.stackFrames}, xdmp.elapsedTime().subtract(before));
    fn.error(null, "DATAHUB-PLUGIN-ERROR",  JSON.stringify(ex, Object.getOwnPropertyNames(ex)));
  }
};

function makeFunction(funcName, moduleUri) {
  return require(moduleUri)[funcName];
  // return xdmp.function(xs.QName(funcName), moduleUri);
};

module.exports = {
  getModuleNs: getModuleNs,
  getFlow: getFlow,
  getFlows: getFlows,
  runFlow: runFlow,
  cleanData: cleanData,
  makeEnvelope: makeEnvelope,
  makeLegacyEnvelope: makeLegacyEnvelope,
  instanceToCanonicalJson: instanceToCanonicalJson,
  setDefaultOptions: setDefaultOptions,
  getMainFunc: getMainFunc,
  runMain: runMain,
  queueWriter: queueWriter,
  safeRun: safeRun,
  contextQueue: contextQueue,
  writerQueue: writerQueue,
  runWriters: runWriters,
  runWriter: runWriter
};
