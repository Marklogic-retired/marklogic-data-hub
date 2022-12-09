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
import sem from "/MarkLogic/semantics.xqy";
import search from "/MarkLogic/appservices/search/search";
import entityLib from "/data-hub/5/impl/entity-lib.mjs";
import graphUtils from "/data-hub/5/impl/graph-utils.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";

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
let qrySearch;

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

const result = graphUtils.getEntityNodesWithRelated(entityTypeIRIs, relatedEntityTypeIRIs, predicateConceptList, entitiesDifferentsFromBaseAndRelated, conceptFacetList, ctsQuery, pageLength);
//get total from base entities
let resultBaseCounting = graphUtils.getEntityTypeIRIsCounting(entityTypeIRIs, ctsQuery);
let totalCount = fn.head(resultBaseCounting).total;

if (relatedEntityTypeIRIs.length) {
  //get total from related entities
  let totalRelatedEntities = graphUtils.getRelatedEntitiesCounting(allRelatedPredicateList, ctsQuery);
  let totalRelated = fn.head(totalRelatedEntities).total;
  totalCount += totalRelated;
}
if (graphUtils.supportsGraphConceptsSearch() && predicateConceptList.length) {
  //get total Concepts
  let totalConcepts = graphUtils.getConceptCounting(entityTypeIRIs, predicateConceptList, ctsQuery);
  let totalConcept = fn.head(totalConcepts).total;
  totalCount += totalConcept;
}

const totalEstimate = totalCount;
const {nodes, edges} = graphUtils.graphResultsToNodesAndEdges(result, queryObj.entityTypeIds);

const supportsGraphConceptsSearch = graphUtils.supportsGraphConceptsSearch();
const response = {
  supportsGraphConceptsSearch,
  'total': (start === 0 && (!pageLength || totalEstimate < pageLength)) ? nodes.length: totalEstimate,
  'start': start,
  'limit': nodes.length,
  'nodes': nodes,
  'edges': edges
};

response;
