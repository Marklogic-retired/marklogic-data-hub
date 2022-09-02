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
let relatedEntityTypeIds = queryObj.relatedEntityTypeIds || [];
let relatedEntityTypeIRIs = [];
let entityTypeIRIs = [];
let entitiesDifferentsFromBaseAndRelated = [];
let allRelatedPredicateList = [];
let predicateConceptList = [];
start = start || 0;
pageLength = pageLength || 1000;
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

  if (relatedEntityTypeIds.includes(entityName)) {
    relatedEntityTypeIRIs.push(sem.iri(entityNameIri));
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

function getNodeLabel(objectIRIArr, objectUri) {
  let label = "";
  let configurationLabel = getLabelFromHubConfigByEntityType(objectIRIArr[objectIRIArr.length - 2]);
  if(configurationLabel.toString().length > 0){
    //getting the value of the configuration property
    label = getValueFromProperty(configurationLabel,objectUri,objectIRIArr[objectIRIArr.length - 2]);
  }

  if (label.toString().length === 0) {
    label = objectIRIArr[objectIRIArr.length - 1];
  }
  return label;
}

function getUrisByIRI(iri) {
  return Object.keys(docUriToSubjectIri).filter(key => docUriToSubjectIri[key].includes(iri.toString()));
}

const result = graphUtils.getEntityNodesWithRelated(entityTypeIRIs, relatedEntityTypeIRIs, predicateConceptList, entitiesDifferentsFromBaseAndRelated, conceptFacetList, ctsQuery, pageLength);

let nodes = {};

for (const item of result) {
  const subjectIri = item.subjectIRI.toString();
  const subjectUri = item.docURI.toString();
  docUriToSubjectIri[subjectUri] = docUriToSubjectIri[subjectUri] || [];
  docUriToSubjectIri[subjectUri].push(subjectIri);
  if (item.nodeCount == 1 && item.firstDocURI) {
    const objectUri = item.firstDocURI.toString();
    const objectIri = item.firstObjectIRI.toString();
    docUriToSubjectIri[objectUri] = docUriToSubjectIri[objectUri] || [];
    docUriToSubjectIri[objectUri].push(objectIri);
  }
}

result.map(item => {
  let resultPropertiesOnHover = [];
  let newLabel = "";
  let subjectArr = item.subjectIRI.toString().split("/");
  let subjectLabel = subjectArr[subjectArr.length - 1];
  let entityType = subjectArr.length >= 2 ? subjectArr[subjectArr.length - 2]: "";
  if (item.subjectLabel !== undefined && item.subjectLabel.toString().length === 0) {
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
  const subjectIri = docUriToSubjectIri[item.docURI][0] || item.subjectIRI.toString();
  const objectIRI = item.firstObjectIRI.toString();
  const objectIRIArr = objectIRI.split("/");
  const objectUri = item.firstDocURI.toString();
  const objectId = objectUri || objectIRI;

  const originId = item.docURI || subjectIri;
  if (!nodes[item.docURI] && (item.objectConcept.toString().length == 0)) {
    nodeOrigin.id = originId;
    nodeOrigin.docUri = item.docURI;
    nodeOrigin.docIRI = subjectIri;
    if (newLabel.toString().length === 0) {
      nodeOrigin.label = subjectLabel;
    } else {
      nodeOrigin.label = newLabel;
    }
    nodeOrigin.additionalProperties = null;
    nodeOrigin.group = group;
    nodeOrigin.isConcept = false;
    nodeOrigin.hasRelationships = false;
    if (!queryObj.entityTypeIds.includes(entityType)) {
      nodeOrigin.hasRelationships = docUriToSubjectIri[item.docURI].some(iri => graphUtils.relatedObjHasRelationships(iri));
    }
    nodeOrigin.count = 1;
    nodeOrigin.propertiesOnHover = resultPropertiesOnHover;
    nodes[item.docURI] = nodeOrigin;
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
      let hasRelationShips = false
      if (item.countRelationsWithOtherEntity !== undefined && item.countRelationsWithOtherEntity !== null) {
        if (item.countRelationsWithOtherEntity == 1) {
          hasRelationShips = true;
        }
      }
      nodeOrigin.hasRelationships = hasRelationShips;
      nodeOrigin.count = 1;
      nodes[item.objectConcept] = nodeOrigin;
    }
  }
  //Checking for target nodes
  if (item.nodeCount && item.nodeCount == 1) {
    let edge = {};
    const docUriToNodeKeys = getUrisByIRI(objectIRI);
    //if the target exists in docUriToSubjectIri we check for multiple nodes
    if(docUriToNodeKeys && docUriToNodeKeys.length > 0) {
      docUriToNodeKeys.forEach(key => {
        let objectIRI = docUriToSubjectIri[key][0];
        const objectId = key;
        edge = {};
        const sortedIds = [originId, objectId].sort();
        edge.id = "edge-" + sortedIds[0] + "-" + item.predicateIRI + "-" + sortedIds[1];
        if (!edgesByID[edge.id]) {
          let predicateArr = item.predicateIRI.toString().split("/");
          let edgeLabel = predicateArr[predicateArr.length - 1];
          edge.predicate = item.predicateIRI;
          edge.label = edgeLabel;
          edge.from = sortedIds[0];
          edge.to = sortedIds[1];
          edgesByID[edge.id] = edge;
        }
        if (!nodes[key]) {
          let objectNode = {};
          const objectEntityType = objectIRIArr[objectIRIArr.length - 2];
          objectNode.id = objectId;
          objectNode.docUri = key;
          nodeOrigin.docIRI = objectIRI;
          objectNode.label = getNodeLabel(objectIRIArr, objectUri);
          resultPropertiesOnHover = entityLib.getValuesPropertiesOnHover(item.docURI,objectEntityType,hubCentralConfig);
          objectNode.propertiesOnHover=resultPropertiesOnHover;
          objectNode.group = objectIRI.substring(0, objectIRI.length - objectIRIArr[objectIRIArr.length - 1].length - 1);;
          objectNode.isConcept = false;
          objectNode.count = item.nodeCount;
          objectNode.hasRelationships = false;
          if (!queryObj.entityTypeIds.includes(objectEntityType)) {
            objectNode.hasRelationships = docUriToSubjectIri[key].some(iri => graphUtils.relatedObjHasRelationships(iri));
          }
          nodes[key] = objectNode;
        }
      });
    } else { //if there isn't a docURI key create the node from item's info
      const objectGroup = objectIRI.substring(0, objectIRI.length - objectIRIArr[objectIRIArr.length - 1].length - 1);
      let predicateArr = item.predicateIRI.toString().split("/");
      let edgeLabel = predicateArr[predicateArr.length - 1];
      const sortedIds = [originId, objectIRI].sort();
      edge = {};
      edge.id = "edge-" + sortedIds[0] + "-" + item.predicateIRI + "-" + sortedIds[1];
      edge.predicate = item.predicateIRI;
      edge.label = edgeLabel;
      edge.from = sortedIds[0];
      edge.to = sortedIds[1];
      if (!edgesByID[edge.id]) {
        edgesByID[edge.id] = edge;
      }
      if (!nodes[objectId]) {
        let objectNode = {};
        objectNode.id = objectId;
        objectNode.docUri = objectUri;
        nodeOrigin.docIRI = objectIRI;
        objectNode.label = getNodeLabel(objectIRIArr,objectUri);
        resultPropertiesOnHover = entityLib.getValuesPropertiesOnHover(item.docURI,objectIRIArr[objectIRIArr.length - 2],hubCentralConfig);
        objectNode.propertiesOnHover = resultPropertiesOnHover;
        objectNode.group = objectGroup;
        objectNode.isConcept = false;
        objectNode.count = item.nodeCount;
        let hasRelationships = false;
        if(!queryObj.entityTypeIds.includes(objectIRIArr[objectIRIArr.length - 2])){
          hasRelationships = graphUtils.relatedObjHasRelationships(objectIRI);
        }
        objectNode.hasRelationships = hasRelationships;
        nodes[objectId] = objectNode;
      }
    }
  } else if (item.nodeCount && item.nodeCount > 1) {
    let objectIRI = item.firstObjectIRI.toString();
    let objectIRIArr = objectIRI.split("/");
    let entityType = objectIRIArr[objectIRIArr.length - 2];
    const objectId = originId + "-" + item.predicateIRI + "-" + entityType;
    let edge = {};
    edge.id = "edge-" + objectId;
    if (!edgesByID[edge.id]) {
      let predicateArr = item.predicateIRI.toString().split("/");
      let edgeLabel = predicateArr[predicateArr.length - 1];
      edge.predicate = item.predicateIRI;
      edge.label = edgeLabel;
      edge.from = originId;
      edge.to = objectId;
      edgesByID[edge.id] = edge;
    }
    if (!nodes[objectId]) {
      let objectNode = {};
      objectNode.id = objectId;
      objectNode.label = objectIRIArr[objectIRIArr.length - 1];
      resultPropertiesOnHover = entityLib.getValuesPropertiesOnHover(item.docURI, entityType,hubCentralConfig);
      objectNode.parentDocUri = item.docURI;
      objectNode.predicateIri = item.predicateIRI;
      objectNode.propertiesOnHover = resultPropertiesOnHover;
      objectNode.group = objectIRI.substring(0, objectIRI.length - objectIRIArr[objectIRIArr.length - 1].length - 1);;
      objectNode.isConcept = false;
      objectNode.count = item.nodeCount;
      objectNode.hasRelationships = false;
      nodes[objectId] = objectNode;
    }
  } else if (item.predicateIRI !== undefined && item.predicateIRI.toString().length > 0) {
    let predicateArr = item.predicateIRI.toString().split("/");
    let edgeLabel = predicateArr[predicateArr.length - 1];
    const subjectId = item.docURI || subjectIri;
    const docUriToNodeKeys = getUrisByIRI(item.objectIRI.toString());

    if(docUriToNodeKeys && docUriToNodeKeys.length > 0) {
      docUriToNodeKeys.forEach(key => {
        const objectId = key;
        const sortedIds = [subjectId, objectId].sort();
        const edgeId = "edge-" + sortedIds[0] + "-" + item.predicateIRI + "-" + sortedIds[1];
        if (!edgesByID[edgeId]) {
          edgesByID[edgeId] = {
            id: edgeId,
            predicate: item.predicateIRI,
            label: edgeLabel,
            from: sortedIds[0],
            to: sortedIds[1]
          };
        }
      });
    } else { //target is a concept node
      const objectId = item.objectIRI.toString()
      const sortedIds = [subjectId, objectId].sort();
      const edgeId = "edge-" + sortedIds[0] + "-" + item.predicateIRI + "-" + sortedIds[1];
      if (!edgesByID[edgeId]) {
        edgesByID[edgeId] = {
          id: edgeId,
          predicate: item.predicateIRI,
          label: edgeLabel,
          from: sortedIds[0],
          to: sortedIds[1]
        };
      }
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
  if (docUri) {
    const property = cts.doc(docUri).xpath(`*:envelope/*:instance/*:${entityType}/*:${propertyName}`);
    if (fn.exists(property)) {
      return fn.data(fn.head(property));
    }
  }
  return "";
}






response;
