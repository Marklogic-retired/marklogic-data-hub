/*
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
/**
 * Contains helper functions for simplifying mastering unit tests.
 */

import matching from "/data-hub/5/builtins/steps/mastering/default/matching.mjs";
import StepExecutionContext from "/data-hub/5/flow/stepExecutionContext.mjs";
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
export function match(entityTypeName, entityProperties, options) {
  const content = buildMatchingContent(entityTypeName, entityProperties);
  const fakeFlow = {"name":"fake", "steps": {"1": {}}};
  const stepExecutionContext = new StepExecutionContext(fakeFlow, "1", {});
  return matching.main(content, options, stepExecutionContext)[0].value.matchSummary;
}

/**
 * Matches on the entity instance that is passed in as a string of XML.
 *
 * @param entityXmlString
 * @param options
 */
export function matchXml(entityXmlString, options) {
  const content = [{
    "uri": TEST_DOC_URI,
    "value": fn.head(xdmp.unquote(entityXmlString))
  }];
  return matching.main(content, options)[0].value.matchSummary;
}


/**
 * Convenience function for build a content array that the matching step main module accepts. The content array will
 * contain a single enveloped entity instance based on the given type name and properties.
 *
 * @param entityTypeName
 * @param entityProperties
 */
export function buildMatchingContent(entityTypeName, entityProperties) {
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
export function assertMatchExists(matchSummary, urisOfMatchingDocuments) {
  if (!Array.isArray(urisOfMatchingDocuments)) {
    urisOfMatchingDocuments = [urisOfMatchingDocuments];
  }

  const expectedPrefix = "/com.marklogic.smart-mastering/merged/";
  const uriToProcess = matchSummary.URIsToProcess.filter((uri) => uri.startsWith(expectedPrefix))[0];
  let assertions = [
    test.assertTrue(urisOfMatchingDocuments.length === 0 || fn.exists(urisOfMatchingDocuments), `There should be a merge. Match Summary: ${xdmp.toJsonString(matchSummary)}`)
  ];
  if (uriToProcess) {
    const actionDetails = matchSummary.actionDetails[uriToProcess];

    // Add the input doc
    const expectedUriCount = urisOfMatchingDocuments.length + 1;

    const actualUris = actionDetails ? actionDetails.uris : [];
    const prettyActionDetailsUris = xdmp.toJsonString(actualUris);
    assertions = [
      test.assertTrue(uriToProcess.startsWith(expectedPrefix),
        `Since a merge is expected, the URI to process should start with ${expectedPrefix}; actual URI: ${uriToProcess}`
      ),
      test.assertEqual(expectedUriCount, actualUris.length,
        `Expected ${expectedUriCount} matching URIs; actual URIs: ${prettyActionDetailsUris}`
      ),
      test.assertTrue(actualUris.includes(TEST_DOC_URI),
        `Expected the test doc ${TEST_DOC_URI} to be in actionDetails.uris; actual URIs: ${prettyActionDetailsUris}`
      )
    ];

    urisOfMatchingDocuments.forEach(uri => {
      assertions.push(
        test.assertTrue(actualUris.includes(uri),
          `Expected actionDetails.uris to include ${uri}; actual URIs: ${prettyActionDetailsUris}`
        )
      );
    });
  }
  return assertions;
}


export default {
  assertMatchExists,
  match,
  matchXml,
  TEST_DOC_URI
}
