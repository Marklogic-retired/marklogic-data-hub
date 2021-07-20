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

// This library is intended for Data Hub specific provenance functions.

'use strict';

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const config = require("/com.marklogic.hub/config.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

function validateDeleteRequest({ retainDuration, batchSize = 100 }) {
    if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "yearMonthDuration", retainDuration)) {
        retainDuration = xs.yearMonthDuration(retainDuration);
    } else if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "dayTimeDuration", retainDuration)) {
        retainDuration = xs.dayTimeDuration(retainDuration);
    } else {
        httpUtils.throwBadRequest(`The duration format for the retainDuration provided ("${retainDuration}") is unsupported. Format must be in either xs:yearMonthDuration or xs:dayTimeDuration format`);
    }
    if (retainDuration.lt(xs.dayTimeDuration('PT0S'))) {
        httpUtils.throwBadRequest(`The retainDuration provided ("${retainDuration}") is unsupported. The retain duration must be a positive duration.`);
    }
    if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "unsignedInt", batchSize)) {
        batchSize = xs.unsignedInt(batchSize);
    } else {
        httpUtils.throwBadRequest(`The value for the batchSize provided ("${batchSize}") is unsupported. batchSize must be an unsigned int.`);
    }
    return { retainDuration, batchSize };
}

function deleteProvenance(deleteRequest, endpointState) {
    xdmp.securityAssert("http://marklogic.com/data-hub/privileges/delete-provenance", "execute");
    // update with validated request properties
    deleteRequest = validateDeleteRequest(deleteRequest);
    const { retainDuration, batchSize } = deleteRequest;
    const timePruningBegins = fn.currentDateTime().subtract(retainDuration);
    return fn.head(xdmp.invokeFunction(function() {
        const collectionQuery = cts.collectionQuery('http://marklogic.com/provenance-services/record');
        const timeQuery = cts.tripleRangeQuery(null, sem.iri('http://www.w3.org/ns/prov#generatedAtTime'), timePruningBegins, '<');
        const lastRemovedUriQuery = endpointState.lastUri ? cts.rangeQuery(cts.uriReference(), '>=', endpointState.lastUri) : null;
        const queries = [collectionQuery, timeQuery];
        if (lastRemovedUriQuery) {
            queries.push(lastRemovedUriQuery);
        }
        const finalQuery = cts.andQuery(queries);
        let estimateCount = cts.estimate(finalQuery);
        let lastUri = null;
        for (let uri of cts.uris(null, [`limit=${batchSize}`], finalQuery)) {
            xdmp.documentDelete(uri);
            lastUri = uri;
        }
        return (lastUri !== null && estimateCount > batchSize) ? {lastUri} : null;
    }, { database: xdmp.database(config.JOBDATABASE), update: 'true', commit: 'auto', ignoreAmps: false}));
}

function installProvTemplates() {
  const recordProvenanceTemplate = xdmp.unquote('<template xmlns="http://marklogic.com/xdmp/tde">\n' +
    '  <context>/prov:document</context>\n' +
    '  <path-namespaces>\n' +
    '    <path-namespace>\n' +
    '      <prefix>prov</prefix>\n' +
    '      <namespace-uri>http://www.w3.org/ns/prov#</namespace-uri>\n' +
    '    </path-namespace>\n' +
    '  </path-namespaces>\n' +
    '  <collections>\n' +
    '    <collection>http://marklogic.com/provenance-services/record</collection>\n' +
    '  </collections>\n' +
    '  <templates>\n' +
    '    <template>\n' +
    '      <context>(prov:activity|prov:agent|prov:softwareAgent)</context>\n' +
    '      <vars>\n' +
    '        <var>\n' +
    '          <name>id</name>\n' +
    '          <val>sem:iri(@prov:id)</val>\n' +
    '        </var>\n' +
    '      </vars>\n' +
    '      <templates>\n' +
    '        <template>\n' +
    '          <context>prov:type</context>\n' +
    '          <vars>\n' +
    '            <var>\n' +
    '              <name>obj</name>\n' +
    '              <val>sem:QName-to-iri(fn:resolve-QName(string(.),.))</val>\n' +
    '            </var>\n' +
    '          </vars>\n' +
    '          <triples>\n' +
    '            <triple>\n' +
    '              <subject>\n' +
    '                <val>$id</val>\n' +
    '              </subject>\n' +
    '              <predicate>\n' +
    '                <val>sem:iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")</val>\n' +
    '              </predicate>\n' +
    '              <object>\n' +
    '                <val>$obj</val>\n' +
    '              </object>\n' +
    '            </triple>\n' +
    '          </triples>\n' +
    '        </template>\n' +
    '        <template>\n' +
    '          <context>*[fn:namespace-uri(.) != "http://www.w3.org/ns/prov#"]</context>\n' +
    '          <triples>\n' +
    '            <triple>\n' +
    '              <subject>\n' +
    '                <val>$id</val>\n' +
    '              </subject>\n' +
    '              <predicate>\n' +
    '                <val>sem:iri(fn:namespace-uri(.)||fn:local-name(.))</val>\n' +
    '              </predicate>\n' +
    '              <object>\n' +
    '                <val>xs:string(string(.))</val>\n' +
    '              </object>\n' +
    '            </triple>\n' +
    '          </triples>\n' +
    '        </template>\n' +
    '      </templates>\n' +
    '    </template>\n' +
    '    <template>\n' +
    '      <context>prov:used</context>\n' +
    '      <triples>\n' +
    '        <triple>\n' +
    '          <subject>\n' +
    '            <val>sem:iri(prov:activity/@prov:ref)</val>\n' +
    '          </subject>\n' +
    '          <predicate>\n' +
    '            <val>sem:iri("http://www.w3.org/ns/prov#used")</val>\n' +
    '          </predicate>\n' +
    '          <object>\n' +
    '            <val>sem:iri(prov:entity/@prov:ref)</val>\n' +
    '          </object>\n' +
    '        </triple>\n' +
    '      </triples>\n' +
    '    </template>\n' +
    '    <template>\n' +
    '      <context>prov:*[@prov:id][prov:label]</context>\n' +
    '      <vars>\n' +
    '        <var>\n' +
    '          <name>id</name>\n' +
    '          <val>sem:iri(@prov:id)</val>\n' +
    '        </var>\n' +
    '      </vars>\n' +
    '      <templates>\n' +
    '        <template>\n' +
    '          <context>prov:label</context>\n' +
    '          <vars>\n' +
    '            <var>\n' +
    '              <name>obj</name>\n' +
    '              <val>string(.)</val>\n' +
    '            </var>\n' +
    '          </vars>\n' +
    '          <triples>\n' +
    '            <triple>\n' +
    '              <subject>\n' +
    '                <val>$id</val>\n' +
    '              </subject>\n' +
    '              <predicate>\n' +
    '                <val>sem:iri("http://www.w3.org/ns/prov#label")</val>\n' +
    '              </predicate>\n' +
    '              <object>\n' +
    '                <val>$obj</val>\n' +
    '              </object>\n' +
    '            </triple>\n' +
    '          </triples>\n' +
    '        </template>\n' +
    '      </templates>\n' +
    '    </template>\n' +
    '  </templates>\n' +
    '</template>');
  const templateUri = '/hub-template/RecordProvenance.xml';
  const permissions = [
    xdmp.permission('ps-user', 'read'),
    xdmp.permission('ps-internal', 'update'),
    xdmp.permission('data-hub-developer', 'update')
  ];
  const collections = ["hub-template", "http://marklogic.com/xdmp/tde"];

  hubUtils.writeDocument(templateUri, recordProvenanceTemplate, permissions, collections, config.STAGINGSCHEMASDATABASE);
  hubUtils.writeDocument(templateUri, recordProvenanceTemplate, permissions, collections, config.FINALSCHEMASDATABASE);
}

module.exports = {
  deleteProvenance: module.amp(deleteProvenance),
  installProvTemplates
};
