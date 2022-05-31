const { Mergeable } = require('/data-hub/5/mastering/merging/mergeable.sjs');
const test = require("/test/test-helper.xqy");

function testMergeableClass() {
  let mergeStep = {};
  let options = {};
  const mergeableInstance = new Mergeable({mergeStep}, {options});
  return [
    test.assertExists(mergeableInstance, "Mergeable class instance should exist."),
    test.assertExists(mergeableInstance.mergeStep, "Mergeable class instance mergeStep object should exist."),
    test.assertExists(mergeableInstance.options, "Mergeable class instance options object should exist."),
  ];
}

[]
  .concat(testMergeableClass())