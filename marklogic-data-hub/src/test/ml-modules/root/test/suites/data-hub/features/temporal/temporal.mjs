import temporalFeature from "/data-hub/features/temporal.mjs";
import temporalLib from "/data-hub/5/temporal/hub-temporal.mjs";

import { Matchable } from "/data-hub/5/mastering/matching/matchable.mjs";

const test = require("/test/test-helper.xqy");

const myTempCollection = "koolTest";
function getTemporalCollection(tempCollection) {
  const temporalCollections = temporalLib.getTemporalCollections().toArray();
  return temporalCollections.filter((col) => fn.string(col) === tempCollection);
}

const assertions = [];
assertions.push(test.assertTrue(getTemporalCollection(myTempCollection).length === 0, "koolTest should not be a temporal collection"));

temporalFeature.onArtifactPublish("model", "Person");
assertions.push(test.assertTrue(getTemporalCollection(myTempCollection).length === 0, "koolTest should not be a temporal collection"));

temporalFeature.onArtifactPublish("model", "AffiliateCustomer");
assertions.push(test.assertTrue(getTemporalCollection(myTempCollection).length === 1, "koolTest should be a temporal collection"));

const model = undefined;
const sourceQuery = "cts.collectionQuery(['raw-content'])";

const resultQuery1 = temporalFeature.onBuildInstanceQuery({}, model, sourceQuery);
assertions.push(test.assertEqual("cts.collectionQuery(['raw-content'])", resultQuery1));

const stepContextQuery = {features: {
    "temporal": { "enabled" : true, "collection": myTempCollection}
  }};

const resultQuery2 = temporalFeature.onBuildInstanceQuery(stepContextQuery, model, sourceQuery);
assertions.push(test.assertEqual("cts.andQuery([cts.collectionQuery(['raw-content']),cts.collectionQuery('latest')])",resultQuery2));

const stepContext = {flowStep:{features: {
    "temporal": { "enabled" : true, "collection": myTempCollection}
  }}};
const contentArray = [];
contentArray.push({
  "uri": "/affiliate1.json",
  "value": { "meta": { "systemStart": "1601-01-01T13:59:00Z", "systemEnd": "9999-12-31T11:59:59Z", "validStart": fn.currentDateTime() , "validEnd": fn.currentDateTime().add(xs.yearMonthDuration('P1Y'))  },"customerId": "1"} ,
  "context": { "collections":[myTempCollection, "AffiliateCustomer"]}});
xdmp.invokeFunction(() =>{
  temporalFeature.onInstanceSave(stepContext, model, contentArray);
});
xdmp.invokeFunction(() => {
  assertions.push(test.assertEqual(1,
    cts.estimate(cts.andQuery([cts.collectionQuery(["koolTest"]), cts.collectionQuery(["latest"])])),
    `One document must be found with collection: ${myTempCollection}.`));
});

// Test matching with temporal collection
xdmp.invokeFunction(() => {
  const matchable = new Matchable({ targetEntityType: "http://example.org/AffiliateCustomer-0.0.1/AffiliateCustomer" });
  const baselineQuery = matchable.baselineQuery();
  assertions.push(
    test.assertTrue(baselineQuery instanceof cts.andQuery, `Baseline for temporal query should be a cts.andQuery: ${xdmp.toJsonString(baselineQuery)}.`)
  );
  const latestQuery = cts.andQueryQueries(baselineQuery).toArray()[1];
  assertions.push(
    test.assertTrue(latestQuery instanceof cts.collectionQuery, `Second query in cts.andQuery should be a cts.collectionQuery: ${xdmp.toJsonString(latestQuery)}.`),
    test.assertEqual("latest",fn.head(cts.collectionQueryUris(latestQuery)))
  );

});


const contentArrayDelete = [];
contentArrayDelete.push({
  "uri": "/affiliate1.json",
  "value": { "meta": { "systemStart": "1601-01-01T13:59:00Z", "systemEnd": "9999-12-31T11:59:59Z", "validStart": fn.currentDateTime() , "validEnd": fn.currentDateTime().add(xs.yearMonthDuration('P1Y'))  },
    "customerId": "1", "active":false} ,
  "context": { "collections":[myTempCollection]},
  "$delete" : true});
xdmp.invokeFunction(() => {
  temporalFeature.onInstanceDelete(stepContext, model, contentArrayDelete);
});
xdmp.invokeFunction(() => {
  assertions.push(test.assertEqual(0,
    cts.estimate(cts.andQuery([cts.collectionQuery(["koolTest"]), cts.collectionQuery(["latest"])])),
    `No document must be found with collection: ${myTempCollection}.`));
});

assertions;
