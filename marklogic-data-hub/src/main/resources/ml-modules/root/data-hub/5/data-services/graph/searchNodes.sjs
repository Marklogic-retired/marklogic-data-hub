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
let relatedEntityTypeIds = queryObj.relatedEntityTypeIds;
let relatedEntityTypeIRIs = [];
let entityTypeIRIs = [];
let entitiesDifferentsFromBaseAndRelated = [];
let allRelatedPredicateList = [];
let predicateConceptList = [];
start = start || 0;
pageLength = pageLength || 1000;
let hashmapPredicate = new Map();
const docUriToSubjectIri = {};
const edgesByID = {};
let qrySearch;
const hubCentralConfig = cts.doc("/config/hubCentral.json")

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
    relatedEntityTypeIRIs.push(sem.iri(entityNameIri));
    const predicateList = entityLib.getPredicatesByModel(model);
    if(predicateList.length >= 1){
      hashmapPredicate.set(entityName, predicateList);
    }
  }
  if (queryObj.entityTypeIds.includes(entityName)) {
    //get predicate from concepts
    predicateConceptList = predicateConceptList.concat(entityLib.getConceptPredicatesByModel(model));
    if(relatedEntityTypeIds != null){
      const predicateListBaseEntities = entityLib.getPredicatesByModelAndBaseEntities(model,relatedEntityTypeIds);
      allRelatedPredicateList = allRelatedPredicateList.concat(predicateListBaseEntities);
    }
    entityTypeIRIs.push(sem.iri(entityNameIri));
  }
  if(!queryObj.entityTypeIds.includes(entityName) && !(relatedEntityTypeIds && relatedEntityTypeIds.includes(entityName))){
    entitiesDifferentsFromBaseAndRelated.push(sem.iri(entityNameIri));
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

let conceptFacetList = [];
if(queryObj.conceptsFilterTypeIds != null){
  queryObj.conceptsFilterTypeIds.map(item => {
    conceptFacetList.push(sem.iri(item));
  })
}

const result = graphUtils.getEntityNodesWithRelated(entityTypeIRIs, relatedEntityTypeIRIs, predicateConceptList, entitiesDifferentsFromBaseAndRelated, conceptFacetList, ctsQuery, pageLength);

let nodes = {};

for (const item of result) {
  const subjectIri = item.subjectIRI.toString();
  const subjectUri = item.docURI.toString();
  docUriToSubjectIri[subjectUri] = docUriToSubjectIri[subjectUri] || [];
  docUriToSubjectIri[subjectUri].push(subjectIri);
  if (item.nodeCount === 1 && !item.objectConcept) {
    const objectUri = item.firstDocURI.toString();
    const objectIri = item.firstObjectIRI.toString();
    docUriToSubjectIri[objectUri] = docUriToSubjectIri[objectUri] || [];
    docUriToSubjectIri[objectUri].push(objectIri);
  }
}

result.map(item => {

  let resultPropertiesOnHover = [];
  let subjectLabel = item.subjectLabel;
  let newLabel = "";
  if (item.subjectLabel !== undefined && item.subjectLabel.toString().length === 0) {
    let subjectArr = item.subjectIRI.toString().split("/");
    subjectLabel = subjectArr[subjectArr.length - 1];
    let entityType = subjectArr[subjectArr.length - 2];
    //get configuration values from Hub Central Config
    let configurationLabel = getLabelFromHubConfigByEntityType(entityType);
    let configPropertiesOnHover = getPropertiesOnHoverFromHubConfigByEntityType(entityType);
    //check if we have in central config new label loaded
    if(configurationLabel.toString().length > 0){
      //getting the value of the configuration property
      newLabel = getValueFromProperty(configurationLabel,item.docURI,entityType);
    }
    //check if we have in central config properties on hover loaded
    resultPropertiesOnHover = entityLib.getValuesPropertiesOnHover(item.docURI,entityType,hubCentralConfig);
  }
  const group = item.subjectIRI.toString().substring(0, item.subjectIRI.toString().length - subjectLabel.length - 1);
  let nodeOrigin = {};
  const subjectIri = docUriToSubjectIri[item.docURI][0];
  if (!nodes[subjectIri] && (item.objectConcept.toString().length == 0)) {
    nodeOrigin.id = subjectIri;
    nodeOrigin.docUri = item.docURI;
    if (newLabel.toString().length === 0) {
      nodeOrigin.label = subjectLabel;
    }else{
      nodeOrigin.label = newLabel;
    }
    nodeOrigin.additionalProperties = null;
    nodeOrigin.group = group;
    nodeOrigin.isConcept = false;
    nodeOrigin.hasRelationships = false;
    nodeOrigin.count = 1;
    nodeOrigin.propertiesOnHover=resultPropertiesOnHover;
    nodes[subjectIri] = nodeOrigin;
  } else {
    if ((item.objectConcept !== undefined && item.objectConcept.toString().length > 0 && !nodes[item.objectConcept])) {
      let objectConceptArr = item.objectConcept.toString().split("/");
      let conceptLabel = objectConceptArr[objectConceptArr.length - 1];
      nodeOrigin.id = item.objectConcept;
      nodeOrigin.docUri = item.docURI;
      nodeOrigin.label = conceptLabel;
      nodeOrigin.additionalProperties = null;
      nodeOrigin.group = conceptLabel;
      nodeOrigin.isConcept = true;
      nodeOrigin.conceptClassName = item.conceptClassName;
      let hastRelationShip = false
      if (item.countRelationsWithOtherEntity !== undefined && item.countRelationsWithOtherEntity !== null) {
        if (item.countRelationsWithOtherEntity == 1) {
          hastRelationShip = true;
        }
      }
      nodeOrigin.hasRelationships = hastRelationShip;
      nodeOrigin.count = 1;
      nodes[item.objectConcept] = nodeOrigin;
    }
  }

  if (item.nodeCount && item.nodeCount >= 1) {
    let objectIRI = item.firstObjectIRI.toString();
    let objectIRIArr = objectIRI.split("/");
    let objectId = item.firstObjectIRI.toString();
    let objectUri = item.firstDocURI.toString();
    let objectGroup = objectIRI.substring(0, objectIRI.length - objectIRIArr[objectIRIArr.length - 1].length - 1);
    let hasRelationships = false;
    if(item.nodeCount == 1 && !queryObj.entityTypeIds.includes(objectIRIArr[objectIRIArr.length - 2])){
      hasRelationships = graphUtils.relatedObjHasRelationships(objectId, hashmapPredicate);
    }
    //Override if count is more than 1. We will have a node with badge.
    let edge = {};
    if (item.nodeCount > 1) {
      let entityType = objectIRIArr[objectIRIArr.length - 2];
      objectId = subjectIri + "-" + objectIRIArr[objectIRIArr.length - 2];
      edge.id = "edge-" + subjectIri + "-" + item.predicateIRI + "-" + entityType;
    } else {
      edge.id = "edge-" + subjectIri + "-" + item.predicateIRI + "-" + objectIRI;
    }
    if (!edgesByID[edge.id]) {
      let predicateArr = item.predicateIRI.toString().split("/");
      let edgeLabel = predicateArr[predicateArr.length - 1];
      edge.predicate = item.predicateIRI;
      edge.label = edgeLabel;
      edge.from = subjectIri;
      edge.to = objectId;
      edgesByID[edge.id] = edge;
    }
    if (!nodes[objectId]) {
      let objectNode = {};
      if (item.nodeCount === 1) {
        objectNode.id = objectId;
        objectNode.docUri = objectUri;
      } else {
        objectNode.id = objectId;
      }
      let newLabelNode = "";
      let configurationLabel = getLabelFromHubConfigByEntityType(objectIRIArr[objectIRIArr.length - 2]);
      if(configurationLabel.toString().length > 0){
        //getting the value of the configuration property
        newLabelNode = getValueFromProperty(configurationLabel,objectUri,objectIRIArr[objectIRIArr.length - 2]);
      }

      if (newLabelNode.toString().length === 0) {
        objectNode.label = objectIRIArr[objectIRIArr.length - 1];
      }else{
        objectNode.label = newLabelNode;
      }
      resultPropertiesOnHover = entityLib.getValuesPropertiesOnHover(item.docURI,objectIRIArr[objectIRIArr.length - 2],hubCentralConfig);
      objectNode.propertiesOnHover=resultPropertiesOnHover;
      objectNode.group = objectGroup;
      objectNode.isConcept = false;
      objectNode.count = item.nodeCount;
      objectNode.hasRelationships = hasRelationships;
      nodes[objectId] = objectNode;
    }
  }
  else if (item.predicateIRI !== undefined && item.predicateIRI.toString().length > 0) {
    let predicateArr = item.predicateIRI.toString().split("/");
    let edgeLabel = predicateArr[predicateArr.length - 1];
    const subjectId = docUriToSubjectIri[item.docURI][0] || subjectIri;
    const objectId = item.objectIRI;
    const edgeId = "edge-" + subjectId + "-" + item.predicateIRI + "-" + objectId;
    if (!edgesByID[edgeId]) {
      edgesByID[edgeId] = {
        id: edgeId,
        predicate: item.predicateIRI,
        label: edgeLabel,
        from: subjectId,
        to: objectId
      };
    }
  }
});

//get total from base entities
let resultBaseCounting = graphUtils.getEntityTypeIRIsCounting(entityTypeIRIs, ctsQuery);
let totalCount = fn.head(resultBaseCounting).total;
if (relatedEntityTypeIRIs.length) {
  //get total from related entities
  let totalRelatedEntities = graphUtils.getRelatedEntitiesCounting(allRelatedPredicateList, ctsQuery);
  let totalRelated = fn.head(totalRelatedEntities).total;
  totalCount += totalRelated;
}
if (predicateConceptList.length) {
  //get total Concepts
  let totalConcepts = graphUtils.getConceptCounting(entityTypeIRIs, predicateConceptList, ctsQuery);
  let totalConcept = fn.head(totalConcepts).total;
  totalCount += totalConcept;
}

const totalEstimate = totalCount;
const nodesValues = hubUtils.getObjectValues(nodes);
const edgeValues = hubUtils.getObjectValues(edgesByID);

const response = {
  'total': totalEstimate,
  'start': start,
  'limit': nodesValues.length,
  'nodes': nodesValues,
  'edges': edgeValues
};

function getLabelFromHubConfigByEntityType(entityType) {

  if(hubCentralConfig != null && fn.exists(hubCentralConfig.xpath("/modeling/entities/" + entityType))){
    return hubCentralConfig.xpath("/modeling/entities/" + entityType + "/label");
  }
  return "";
}

function getPropertiesOnHoverFromHubConfigByEntityType(entityType) {
  if(hubCentralConfig != null && fn.exists(hubCentralConfig.xpath("/modeling/entities/" + entityType+"/propertiesOnHover"))){
    const obj = JSON.parse(hubCentralConfig);
    return obj.modeling.entities[entityType].propertiesOnHover;
  }
  return "";
}

function getValueFromProperty(propertyName, docUri,entityType) {
  const property = cts.doc(docUri).xpath(`*:envelope/*:instance/*:${entityType}/*:${propertyName}`);
  if(fn.exists(property)){
    return fn.data(fn.head(property));
  }
  return "";
}






response;
