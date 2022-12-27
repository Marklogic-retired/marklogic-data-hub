const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/concept/" + module, args));

}

function conceptReference() {
  return invoke("getConceptReferences.mjs", {conceptName: "ShoeType"}, {});
}


const resultsTest1 = conceptReference();

let assertions = [
  test.assertEqual("Product", resultsTest1.entityNamesWithRelatedConcept[0])
];



assertions;
