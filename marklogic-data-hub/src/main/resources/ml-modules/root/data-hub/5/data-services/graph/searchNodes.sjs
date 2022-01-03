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

// No privilege required: No special privilege is needed for this endpoint
const sem = require("/MarkLogic/semantics.xqy");
const search = require('/MarkLogic/appservices/search/search');
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const graphUtils = require("/data-hub/5/impl/graph-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

const returnFlags = `<return-aggregates xmlns="http://marklogic.com/appservices/search">false</return-aggregates>
  <return-constraints xmlns="http://marklogic.com/appservices/search">false</return-constraints>
  <return-facets xmlns="http://marklogic.com/appservices/search">false</return-facets>
  <return-frequencies xmlns="http://marklogic.com/appservices/search">false</return-frequencies>
  <return-metrics xmlns="http://marklogic.com/appservices/search">false</return-metrics>
  <return-plan xmlns="http://marklogic.com/appservices/search">false</return-plan>
  <return-qtext xmlns="http://marklogic.com/appservices/search">false</return-qtext>
  <return-results xmlns="http://marklogic.com/appservices/search">false</return-results>
  <return-similar xmlns="http://marklogic.com/appservices/search">false</return-similar>
  <return-values xmlns="http://marklogic.com/appservices/search">false</return-values>
  <return-query xmlns="http://marklogic.com/appservices/search">true</return-query>`;

const stylesheet = fn.head(xdmp.unquote(`<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
   <xsl:template match="node()|@*">
      <xsl:copy>
         <xsl:apply-templates select="node()|@*" />
      </xsl:copy>
   </xsl:template>
   <xsl:template match="*:return-aggregates|*:return-constraints|*:return-facets|*:return-frequencies|*:return-metrics|*:return-plan|*:return-qtext|*:return-results|*:return-similar|*:return-values|*:return-query" />
   <xsl:template match="*:options">
      <xsl:copy>
         <xsl:apply-templates select="node()|@*" />
         ${returnFlags}
      </xsl:copy>
   </xsl:template>
</xsl:stylesheet>`));


var query;
var start;
var pageLength;
var structuredQuery;
var queryOptions;

if(query == null) {
  httpUtils.throwBadRequest("Request cannot be empty");
}

let queryObj = JSON.parse(query);
var relatedEntityTypeIds = queryObj.relatedEntityTypeIds;
var allEntityTypeIRIs = [];
var entityTypeIRIs = [];
start = start || 0;
pageLength = pageLength || 1000;
var hashmapPredicate = new Map();
var qrySearch;
if(structuredQuery !== undefined && structuredQuery.toString().length > 0) {
  structuredQuery = fn.head(xdmp.unquote(structuredQuery)).root;
  queryOptions = fn.head(xdmp.unquote(queryOptions)).root;
  const newOptions = fn.head(xdmp.xsltEval(stylesheet, queryOptions)).root;
  const searchResponse = fn.head(search.resolve(structuredQuery, newOptions));
  qrySearch = cts.query(searchResponse.xpath('./*/*'));
}

fn.collection(entityLib.getModelCollection()).toArray().forEach(model => {
  model = model.toObject();
  const entityName = model.info.title;
  const entityNameIri = entityLib.getEntityTypeId(model, entityName);

  if(relatedEntityTypeIds && relatedEntityTypeIds.includes(entityName)) {
    allEntityTypeIRIs.push(sem.iri(entityNameIri));

    const predicateList = entityLib.getPredicatesByModel(model);
    if(predicateList.length >= 1){
      hashmapPredicate.set(entityName, predicateList);
    }
  }
  if (queryObj.entityTypeIds.includes(entityName)) {
    entityTypeIRIs.push(sem.iri(entityNameIri));
  }
});

let ctsQuery = cts.trueQuery();
if(queryObj.searchText !== undefined && queryObj.searchText.toString().length > 0) {
  const searchTxtResponse = fn.head(search.parse(queryObj.searchText));
  ctsQuery = cts.query(searchTxtResponse);
  if(qrySearch !== undefined){
    ctsQuery = cts.andQuery([qrySearch,ctsQuery]);
  }
}else{
  // if doesn't has search text, but could has facetSelects
  if(qrySearch !== undefined){
    ctsQuery = qrySearch;
  }
}

const relatedEntityTypeIRIs = allEntityTypeIRIs.filter((e1) => !entityTypeIRIs.some((e2) => fn.string(e1) === fn.string(e2)));

const result = graphUtils.getEntityNodesWithRelated(entityTypeIRIs, relatedEntityTypeIRIs, ctsQuery);

let nodes = [];
let edges = [];

result.map(item => {

  let subjectLabel = item.subjectLabel;
  if (item.subjectLabel !== undefined && item.subjectLabel.toString().length === 0) {
    let subjectArr = item.subjectIRI.toString().split("/");
    subjectLabel = subjectArr[subjectArr.length - 1];
  }

  const group = item.subjectIRI.toString().substring(0, item.subjectIRI.toString().length - subjectLabel.length - 1);
  let nodeOrigin = {};
  if (!nodes[item.subjectIRI]) {
    nodeOrigin.id = item.subjectIRI;
    nodeOrigin.docUri = item.docURI;
    nodeOrigin.label = subjectLabel;
    nodeOrigin.additionalProperties = null;
    nodeOrigin.group = group;
    nodeOrigin.isConcept = false;
    nodeOrigin.hasRelationships = false;
    nodeOrigin.count = 1;
    nodes[item.subjectIRI] = nodeOrigin;
  } else {
    nodeOrigin = nodes[item.subjectIRI];
    nodeOrigin.label = subjectLabel || nodeOrigin.label;
    nodeOrigin.group = group;
    nodeOrigin.additionalProperties = null;
    nodes[item.subjectIRI] = nodeOrigin;
  }

  if (item.nodeCount && item.nodeCount >= 1) {
    let objectIRI = item.firstObjectIRI.toString();
    let objectIRIArr = objectIRI.split("/");
    if (item.firstObjectLabel === null) {
      item.firstObjectLabel = objectIRIArr[objectIRIArr.length - 1];
    }
    let objectLabel = item.firstObjectLabel.toString();
    let objectId = item.firstObjectIRI.toString();
    let objectUri = item.firstDocURI.toString();
    let objectGroup = objectIRI.substring(0, objectIRI.length - objectIRIArr[objectIRIArr.length - 1].length - 1);
    let hasRelationships = false;
    if(item.nodeCount == 1 && !queryObj.entityTypeIds.includes(objectIRIArr[objectIRIArr.length - 2])){
        hasRelationships = graphUtils.relatedObjHasRelationships(objectId, hashmapPredicate);
    }
    //Override if count is more than 1. We will have a node with badge.
    if (item.nodeCount > 1) {
      let entityType = objectIRIArr[objectIRIArr.length - 2];
      objectIRI = entityType;
      objectLabel =  entityType;
      objectUri = null;
      objectId = item.subjectIRI.toString() + "-" + objectIRIArr[objectIRIArr.length - 2];
    }
    let edge = {};
    edge.id = "edge-" + item.subjectIRI + "-" + item.predicateIRI + "-" + objectIRI;
    let predicateArr = item.predicateIRI.toString().split("/");
    let edgeLabel = predicateArr[predicateArr.length - 1];
    edge.label = edgeLabel;
    edge.from = item.subjectIRI;
    edge.to = objectId;
    edges.push(edge);
    if (!nodes[objectId]) {
      let objectNode = {};
      objectNode.id = item.firstObjectIRI;
      objectNode.docUri = objectUri;
      objectNode.label = objectLabel;
      objectNode.group = objectGroup;
      objectNode.docUri = objectUri;
      objectNode.isConcept = false;
      objectNode.count = item.nodeCount;
      objectNode.hasRelationships = hasRelationships;
      nodes[objectId] = objectNode;
    }
  }
  else if (item.predicateIRI !== undefined && item.predicateIRI.toString().length > 0){
      let edge = {};
      let predicateArr = item.predicateIRI.toString().split("/");
      let edgeLabel = predicateArr[predicateArr.length - 1];
      edge.id = "edge-" + item.subjectIRI + "-" + item.predicateIRI + "-" + item.objectIRI;
      edge.label = edgeLabel;
      edge.from = item.subjectIRI.toString();
      edge.to = item.objectIRI;
      edges.push(edge);
  }
})


const totalEstimate = cts.estimate(cts.andQuery([ctsQuery, cts.tripleRangeQuery(null, sem.curieExpand("rdf:type"), entityTypeIRIs.concat(relatedEntityTypeIRIs))]));
const nodesValues = hubUtils.getObjectValues(nodes)
const response = {
  'total': totalEstimate,
  'start': start,
  'limit': nodesValues.length,
  'nodes': nodesValues,
  'edges': edges
};

response;
