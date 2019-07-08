/*
 * This tests the standard merge function to ensure correct behavior
 * when working with JSON arrays.
 */

const stdMerge = require('/com.marklogic.smart-mastering/survivorship/merging/standard.xqy');
const test = require('/test/test-helper.xqy');

let source1 = xdmp.toJSON({ "documentUri": "doc1.json", "dateTime": xs.dateTime("2018-11-06T00:00:00") }).root;
let source2 = xdmp.toJSON({ "documentUri": "doc2.json", "dateTime": xs.dateTime("2018-11-07T00:00:00") }).root;

let doc1 = xdmp.toJSON({
  "myprop": [{
      "code": "ABC",
      "startDate": "2018-01-01"
      },
      {
      "code": "AB",
      "startDate": "--"
    }]
  });
let doc2 = xdmp.toJSON({
  "myprop": [{
      "code": "ABC",
      "startDate": "2018-01-01"
      }]
  });
let propName = xs.QName('myprop');
let doc1Props = [];
for (let prop of doc1.root.myprop.xpath('./object-node()')) {
  doc1Props.push({ "values": Sequence.from([prop]), "sources": Sequence.from([source1]), "name": propName });
}
let doc2Props = [];
for (let prop of doc2.root.myprop.xpath('./object-node()')) {
  doc2Props.push({ "values": Sequence.from([prop]), "sources": Sequence.from([source2]), "name": propName });
}
let allProperties = doc2Props.concat(doc1Props);

let results = stdMerge.standard(propName, allProperties, null);
let assertions = [];
results.toArray().forEach((result) => {
  if (result.values instanceof Sequence) {
    result.values.toArray().forEach((val) => assertions.push(test.assertExists(val.code)));
  } else {
    assertions.push(test.assertExists(result.values.code));
  }
});
// Deeply nested arrays
let doc1DeepArray = xdmp.toJSON({
  "myprop": [{
      "code": "ABC",
      "startDate": "2018-01-01",
      "array": [{
        "nested": true
      }]
    }]
  });
let doc2DeepArray = xdmp.toJSON({
  "myprop": [{
      "code": "ABC",
      "startDate": "2018-01-01",
      "array": [{
        "nested": true
      }]
    }]
  });
let doc1DeepArrayProps = [];
for (let prop of doc1DeepArray.root.myprop.xpath('./object-node()')) {
  doc1DeepArrayProps.push({ "values": Sequence.from([prop]), "sources": Sequence.from([source1]), "name": propName });
}
let doc2DeepArrayProps = [];
for (let prop of doc2DeepArray.root.myprop.xpath('./object-node()')) {
  doc2DeepArrayProps.push({ "values": Sequence.from([prop]), "sources": Sequence.from([source2]), "name": propName });
}
let allDeepArrayProperties = doc2DeepArrayProps.concat(doc1DeepArrayProps);

let deepArrayResults = stdMerge.standard(propName, allDeepArrayProperties, null);
deepArrayResults.toArray().forEach((result) => {
  if (result.values instanceof Sequence) {
    result.values.toArray().forEach((val) => assertions.push(test.assertExists(val.array)));
  } else {
    assertions.push(test.assertExists(result.values.array));
  }
});

assertions;

