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

const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const masteringCollections = require("/com.marklogic.smart-mastering/impl/collections.xqy");
const masteringConsts = require("/com.marklogic.smart-mastering/constants.xqy");
const targetUri = require("/utility/target-uri.sjs");

const requiredOptionProperties = ['matchOptions', 'mergeOptions'];
const emptySequence = Sequence.from([]);

function main(content, options) {
  // Copied from the default mastering step.
  const filteredContent = [];
  checkOptions(content, options, filteredContent);
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  let matchOptions = new NodeBuilder().addNode({ options: options.matchOptions }).toNode();
  // Data Hub will persist the results for us.
  let persistResults = false;

  // We need to keep track of merge candidates which had no matches,
  // so they can still be promoted.
  let singletonStash = {};
  for (const contentCandidate of filteredContent) {
    singletonStash[contentCandidate.uri] = contentCandidate;
  }

  // Now read a filter query from the options.  Possible security
  // problem, with a code-injection possibility.  Don’t let strangers
  // edit your flow configuration files.
  let filterQueryString = options.filterQuery || "cts.trueQuery()";
  let filterQuery = xdmp.eval(filterQueryString);

  // Call the default mastering process, but with a filter query.
  content = mastering.processMatchAndMergeWithOptions(
    Sequence.from(filteredContent),
    mergeOptions,
    matchOptions,
    filterQuery,
    persistResults
  );

  // Scan through the merge results.  Any items which matched will be
  // in the results in order to archive the originals; singletons
  // which were skipped will be absent.
  for (const matchedContent of content) {
    delete singletonStash[matchedContent.uri];
  }
  // Ensure the survivors have the right collections and add them to
  // the list.
  let entityType = options.targetEntity;
  let outputCollections = options.collections || [];
  outputCollections.push(entityType);
  for (const singletonUri of Object.keys(singletonStash)) {
    let singleton = singletonStash[singletonUri];
    let targetCollections = singleton.context.collections || [];
    singleton.context.collections = fn.distinctValues(Sequence.from(
        targetCollections.concat(outputCollections)
      )).toArray();
    content.push(singleton);
  }

  let newContent = [];
  let urisSeen = {};

  for (const contentItem of content) {
    //grab the doc id/uri
    let id = contentItem.uri;

    // Smart Mastering merge may give us duplicates in the list.
    if (urisSeen[id]) {
      continue;
    } else {
      urisSeen[id] = true;
    }

    // Notifications and provenance documents don’t get massaged.
    if (contentItem.hidden ||
        id.startsWith("/com.marklogic.smart-mastering/auditing/") ||
        id.startsWith("/com.marklogic.smart-mastering/matcher/notifications/")) {
      newContent.push(contentItem);
      continue;
    }

    //here we can grab and manipulate the context metadata attached to the document
    let context = contentItem.context;

    // Check the target collections.
    let collections = context.collections || [];
    if (collections instanceof Sequence) {
      collections = collections.toArray();
    }
    if (!(Array.isArray(collections))) {
      collections = [collections];
    }

    // If this is a move to mark a predecessor as archived, skip it.
    if (collections.includes("mdm-archived")) {
      continue;
    }

    //let's set our output format, so we know what we're exporting
    let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

    //here we check to make sure we're not trying to push out a binary or text document, just xml or json
    if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {
      datahub.debug.log({
        message: 'The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.',
        type: 'error'
      });
      throw Error('The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.');
    }

    //grab the 'doc' from the content value space
    let doc = contentItem.value;

    // let's just grab the root of the document if its a Document and not a type of Node (ObjectNode or XMLNode)
    if (doc && (doc instanceof Document || doc instanceof XMLDocument)) {
      doc = fn.head(doc.root);
    } else if (!(doc instanceof Node)) {
      doc = xdmp.toJSON(doc);
    }

    //get our instance, default shape of envelope is envelope/instance, else it'll return an empty object/array
    let instance = datahub.flow.flowUtils.getInstance(doc) || {};

    // get triples, return null if empty or cannot be found
    let triples = datahub.flow.flowUtils.getTriples(doc) || [];

    //gets headers, return null if cannot be found
    let headers = datahub.flow.flowUtils.getHeaders(doc) || {};

    // clean up non-redundant null values
    if (instance instanceof ObjectNode) {
      let instObj = instance.toObject();
      let itemObj = instObj[entityType];
      for (const objKey of Object.keys(itemObj)) {
        if (Array.isArray(itemObj[objKey])) {
          let newPropertyValues = itemObj[objKey].filter(i => !(i == null));
          if (newPropertyValues.length == 0) {
            itemObj[objKey] = null;
          } else if (newPropertyValues.length == 1) {
            itemObj[objKey] = newPropertyValues[0];
          } else {
            itemObj[objKey] = newPropertyValues;
          }
        }
      }
      instObj[entityType] = itemObj;
      instance = xdmp.toJSON(instObj);
    } else if (instance.xpath) {
      let item = fn.head(instance.xpath("*:"+entityType));
      let instNB = new NodeBuilder();
      instNB.startElement("instance", "http://marklogic.com/entity-services");
      instNB.startElement(entityType);
      for (const propertyName of fn.distinctValues(item.xpath("* /fn:local-name()"))) {
        let propertyNodes = item.xpath("*:"+propertyName);
        if (fn.count(propertyNodes) == 1) {
          instNB.addNode(fn.head(propertyNodes));
        } else {
          let allNull = true;
          for (const propertyNode of propertyNodes) {
            if (propertyNode.textContent != null && propertyNode.textContent != "") {
              instNB.addNode(propertyNode);
              allNull = false;
            }
          }
          if (allNull) {
            instNB.addNode(fn.head(propertyNodes));
          }
        }
      }
      instNB.endElement();
      for (const elt of instance.xpath("*[not(self::*:"+entityType+")]")) {
        instNB.addNode(elt);
      }
      instNB.endElement();
      instance = instNB.toNode();
    } else {
      xdmp.log("Instance was weird; content was: "+xdmp.toJsonString(contentItem), "info");
      continue;
    }

    // Determine our new URI.
    let newUri = targetUri.getTargetUri(instance, options);
    if (newUri === null) {
      continue;
    }

    //form our envelope here now, specifying our output format
    let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

    //assign our envelope value
    contentItem.value = envelope;

    //assign the uri we want, in this case the same
    contentItem.uri = newUri;

    //assign the context we want
    contentItem.context = context;

    newContent.push(contentItem);
  }

  //now let's return out our content to be written
  return newContent;
}

// Copied from default mastering step, except we do not lock our
// candidates for update.
function checkOptions(content, options, filteredContent = []) {
  let hasRequiredOptions = requiredOptionProperties.every((propName) => !!options[propName]);
  if (!hasRequiredOptions) {
    throw new Error(`Missing the following required mastering options: ${xdmp.describe(requiredOptionProperties.filter((propName) => !options[propName]), emptySequence, emptySequence)}`);
  }
  // set the target entity based off of the step options
  let entityType = options.targetEntity;
  options.mergeOptions.targetEntity = entityType;
  options.matchOptions.targetEntity = entityType;
  // provide default empty array values for collections to simplify later logic
  options.mergeOptions.collections = Object.assign({"content": [], "archived": []},options.mergeOptions.collections);
  options.matchOptions.collections = Object.assign({"content": []},options.matchOptions.collections);
  // sanity check the collections set for the match/merge options
  if (options.matchOptions.collections.content.length) {
    options.mergeOptions.collections.content = options.matchOptions.collections.content;
  } else if (options.mergeOptions.collections.content.length) {
    options.matchOptions.collections.content = options.mergeOptions.collections.content;
  }
  const contentCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.content), masteringConsts['CONTENT-COLL']));
  const archivedCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.archived), masteringConsts['ARCHIVED-COLL']));
  let contentHasExpectedContentCollection = true;
  let contentHasTargetEntityCollection = true;
  for (const item of content) {
    let docCollections = xdmp.nodeCollections(item.value);
    if (!docCollections.includes(archivedCollection)) {
      filteredContent.push(item);
      contentHasExpectedContentCollection = contentHasExpectedContentCollection && docCollections.includes(contentCollection);
      contentHasTargetEntityCollection = contentHasTargetEntityCollection && docCollections.includes(entityType);
    }
  }
  if (!contentHasExpectedContentCollection) {
    if (contentHasTargetEntityCollection) {
      xdmp.log(`Expected collection "${contentCollection}" not found on content. Using entity collection "${entityType}" instead. \
      You may need to review your match/merge options`, 'notice');
      options.matchOptions.collections.content.push(entityType);
      options.mergeOptions.collections.content.push(entityType);
    } else {
      xdmp.log(`Expected collection "${contentCollection}" not found on content. You may need to review your match/merge options`, 'warning');
    }
  }
  return { archivedCollection, contentCollection };
}

module.exports = {
  main: main
};
