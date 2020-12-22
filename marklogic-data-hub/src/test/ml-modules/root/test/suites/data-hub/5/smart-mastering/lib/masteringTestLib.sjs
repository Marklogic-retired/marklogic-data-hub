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

/**
 * Contains helper functions for simplifying mastering unit tests.
 */

const matching = require('/data-hub/5/builtins/steps/mastering/default/matching.sjs');
const test = require("/test/test-helper.xqy");

// Prefixed with "/zzz" so it's almost certainly the last one in a match summary doc
const TEST_DOC_URI = "/zzz/test-doc.json";

/**
 * Match a dynamically built entity instance, based on entityTypeName and entityProperties, using the given
 * matching step options.
 *
 * The matching step options can be very minimal - targetEntityType, matchRulesets, and thresholds should do the trick.
 *
 * @param entityTypeName entityTypeName and entityProperties are used to dynamically build a valid enveloped
 * in-memory document that can be matched on
 * @param entityProperties
 * @param options the step options
 * @returns the matchSummary; assumes that only one is present
 */
function match(entityTypeName, entityProperties, options) {
  const content = buildMatchingContent(entityTypeName, entityProperties);
  return fn.head(matching.main(content, options)).value.matchSummary;
}

/**
 * Matches on the entity instance that is passed in as a string of XML. 
 * 
 * @param entityXmlString
 * @param options 
 */
function matchXml(entityXmlString, options) {
  const content = [{
    "uri": TEST_DOC_URI,
    "value": xdmp.unquote(entityXmlString)
  }];
  return fn.head(matching.main(content, options)).value.matchSummary;
}


/**
 * Convenience function for build a content array that the matching step main module accepts. The content array will
 * contain a single enveloped entity instance based on the given type name and properties.
 *
 * @param entityTypeName
 * @param entityProperties
 */
function buildMatchingContent(entityTypeName, entityProperties) {
  const content = [{
    "uri": TEST_DOC_URI
  }];
  // info/title must exist, assuming the step options will include targetEntityType
  const value = {
    "envelope": {
      "instance": {
        "info": {
          "title": entityTypeName
        }
      }
    }
  };
  value.envelope.instance[entityTypeName] = entityProperties;
  content[0].value = xdmp.toJSON(value);
  return content;
}

/**
 * Convenience function for verifying that the URIs in urisOfMatchingDocuments are each listed as matches along with the 
 * TEST_DOC_URI that is used by the match/matchXml functions.
 * 
 * @param matchSummary 
 * @param urisOfMatchingDocuments an array or a single URI string
 */
function assertMatchExists(matchSummary, urisOfMatchingDocuments) {
  if (!Array.isArray(urisOfMatchingDocuments)) {
    urisOfMatchingDocuments = [urisOfMatchingDocuments];
  }

  const uriToProcess = matchSummary.URIsToProcess[0];
  const actionDetails = matchSummary.actionDetails[uriToProcess];

  // Add the input doc
  const expectedUriCount = urisOfMatchingDocuments.length + 1;

  const prettyActionDetailsUris = xdmp.toJsonString(actionDetails.uris);
  const expectedPrefix = "/com.marklogic.smart-mastering/merged/";

  let assertions = [
    test.assertTrue(uriToProcess.startsWith(expectedPrefix),
      `Since a merge is expected, the URI to process should start with ${expectedPrefix}; actual URI: ${uriToProcess}`
    ),
    test.assertEqual(expectedUriCount, actionDetails.uris.length,
      `Expected ${expectedUriCount} matching URIs; actual URIs: ${prettyActionDetailsUris}`
    ),
    test.assertTrue(actionDetails.uris.includes(TEST_DOC_URI), 
      `Expected the test doc ${TEST_DOC_URI} to be in actionDetails.uris; actual URIs: ${prettyActionDetailsUris}`
    )
  ];

  urisOfMatchingDocuments.forEach(uri => {
    assertions.push(
      test.assertTrue(actionDetails.uris.includes(uri), 
        `Expected actionDetails.uris to include ${uri}; actual URIs: ${prettyActionDetailsUris}`
      )
    );
  });

  return assertions;
}


module.exports = {
  assertMatchExists,
  match,
  matchXml,
  TEST_DOC_URI
}
