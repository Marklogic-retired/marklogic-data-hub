/*
  Copyright (c) 2020 MarkLogic Corporation

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

xdmp.securityAssert("http://marklogic.com/data-hub/hub-central/privileges/export-entities", "execute");

const op = require('/MarkLogic/optic');
const search = require('/MarkLogic/appservices/search/search');
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const ds = require("/data-hub/5/data-services/ds-utils.sjs");

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

const replaceHyphenWithUnderscore = (str) => {
  return str.replace(/-/g, '_');
};

const filterObjectAndArrayTypeProperties = (name) => {
  const entityType = entityLib.findEntityTypeByEntityName(name);
  if (!entityType) {
    ds.throwServerError(`Could not find an Entity Model document with name: ${name}`);
  }
  const filteredProperties = new Set();
  const properties = entityType.properties;

  Object.keys(properties).forEach((property) => {
    if (!properties[property].hasOwnProperty("$ref") && properties[property].datatype !== "array") {
      filteredProperties.add(property);
    }
  });

  return filteredProperties;
};

var viewName;
var schemaName;
var limit;
var structuredQuery;
var searchText;
var queryOptions;
var sortOrder;
var columns;

structuredQuery = fn.head(xdmp.unquote(structuredQuery)).root;
searchText = searchText || '';
queryOptions = fn.head(xdmp.unquote(queryOptions)).root;

/*
 * Filtering out columns (properties) that are of object/array type since we don't support them for now.
 * Also replacing hyphen with underscore for column names (entity property names), schema names and view names since TDE's do the same.
 */
const simplePropertySet = filterObjectAndArrayTypeProperties(schemaName);
columns = columns.toArray().filter(column => simplePropertySet.has(column)).map(column => replaceHyphenWithUnderscore(column));
viewName = replaceHyphenWithUnderscore(viewName);
schemaName = replaceHyphenWithUnderscore(schemaName);

const newOptions = fn.head(xdmp.xsltEval(stylesheet, queryOptions)).root;

const searchResponse = search.resolve(structuredQuery, newOptions);
const searchTxtResponse = search.parse(searchText, newOptions);

const qry = cts.query(fn.head(searchResponse).xpath('./*/*'));
const qryTxt = cts.query(fn.head(searchTxtResponse));

const ctsQry = cts.andQuery([qry, qryTxt]);

let orderDefinitions = [];
if (sortOrder) {
  // convert ArrayNode to Array with .toObject()
  for (let sort of sortOrder.toObject()) {
    const col =  op.col(replaceHyphenWithUnderscore(sort.name));
    if (sort.ascending) {
      orderDefinitions.push(op.asc(col));
    } else {
      orderDefinitions.push(op.desc(col));
    }
  }
}
const columnIdentifiers = columns.map((colName) => op.col(colName));
// Workaround since there's a bug in the bridge between v8 and ML builtin functions
const qryString = xdmp.describe(ctsQry, null, null);
const opticPlan = eval(`op.fromView(schemaName, viewName)
  .where(${qryString})
  ${orderDefinitions.length ? '.orderBy(orderDefinitions)': ''}
  .limit(limit)
  .select(columnIdentifiers)
  .export()`);

opticPlan;
