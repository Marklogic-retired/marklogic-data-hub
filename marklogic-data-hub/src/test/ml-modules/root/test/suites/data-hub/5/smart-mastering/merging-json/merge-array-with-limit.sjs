'use strict';
/* This module tests that when a property that starts as
 * an array, it will remain an array when the count of values
 * drops down to 1 value. @see https://github.com/marklogic-community/smart-mastering-core/issues/218
 */
const con = require("/com.marklogic.smart-mastering/constants.xqy");
const merging = require("/com.marklogic.smart-mastering/merging.xqy");

const test = require("/test/test-helper.xqy");
const lib = require("lib/lib.xqy");


let options = test.getTestFile("merge-options-with-array-limit.xml").root;

let mergedDoc = merging.buildMergeModelsByUri(
  ['/source/1/doc1.json','/source/2/doc2.json'],
  options
).value;

let array = mergedDoc.toObject().envelope.instance.MDM.Person.PersonType.ArrayOfVariousThings;
[
  test.assertTrue(Array.isArray(array)),
  test.assertEqual(1, array.length)
];
