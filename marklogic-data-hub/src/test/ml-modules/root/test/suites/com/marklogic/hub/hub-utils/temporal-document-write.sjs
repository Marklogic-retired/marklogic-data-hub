'use strict';
const test = require("/test/test-helper.xqy");
const HubUtils = require('/data-hub/5/impl/hub-utils.sjs');
const hubUtils = new HubUtils();
const temporal = require("/MarkLogic/temporal.xqy");

const temporalCollections = temporal.collections().toArray();
let emptySequence = Sequence.from([]);

let temporalCollection = 'temporalCollection';
let temporalDoc = {uri: "/test.json", value: { systemStart: null, systemEnd: null, validStart: fn.currentDateTime(), validEnd: fn.currentDateTime().add(xs.yearMonthDuration('P1Y')) }};

hubUtils.writeDocuments([temporalDoc], 'xdmp.defaultPermissions()', [temporalCollection], xdmp.databaseName(xdmp.database()));

let readTemporalDoc = fn.head(xdmp.eval(`
 cts.doc('${temporalDoc.uri}'); 
`));
[
  test.assertTrue(temporalCollections.filter((col) => fn.string(col) === temporalCollection).length === 1, `Temporal collections: ${xdmp.describe(temporalCollections, emptySequence, emptySequence)}`),
  test.assertTrue(fn.exists(readTemporalDoc))
];
