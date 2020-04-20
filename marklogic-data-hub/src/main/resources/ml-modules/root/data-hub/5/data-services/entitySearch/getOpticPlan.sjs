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

const op = require('/MarkLogic/optic');
const search = require('/MarkLogic/appservices/search/search');

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


var viewName;
var schemaName;
var limit;
var structuredQuery;
var searchText;
var queryOptions;
var columns = xdmp.getRequestField('columns');

structuredQuery = fn.head(xdmp.unquote(structuredQuery)).root;
searchText = searchText || '';
queryOptions = fn.head(xdmp.unquote(queryOptions)).root;

const newOptions = fn.head(xdmp.xsltEval(stylesheet, queryOptions)).root;

const searchResponse = search.resolve(structuredQuery, newOptions);
const searchTxtResponse = search.parse(searchText, newOptions);

const qry = cts.query(fn.head(searchResponse).xpath('./*/*'));
const qryTxt = cts.query(fn.head(searchTxtResponse));

const ctsQry = cts.andQuery([qry, qryTxt]);

// Workaround since there's a bug in the bridge between v8 and ML builtin functions
const qryString = xdmp.describe(ctsQry, null, null);
const opticPlan = eval(`op.fromView(schemaName, viewName)
  .where(${qryString})
  .limit(limit)
  .select(columns)
  .export()`);

opticPlan;
