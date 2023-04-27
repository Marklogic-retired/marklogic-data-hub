const test = require("/test/test-helper.xqy");
function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/data-services/entitySearch/" + module, args));
}
const assertions = [];

const semanticConceptInfo = invoke("getSemanticConceptInfo.mjs", { semanticConceptIRI: "http://www.example.com/Category/Sneakers" });

assertions.push(
  test.assertExists(semanticConceptInfo.data),
  test.assertExists(semanticConceptInfo.semanticConceptIRI)
);

semanticConceptInfo.data.forEach(conceptNode => {
  assertions.push(
    test.assertExists(conceptNode.entityTypeIRI),
    test.assertExists(conceptNode.total)
  )
  if(conceptNode.entityTypeIRI.toString().includes("Product")) {
    assertions.push(test.assertEqual("http://example.org/Product-1.0.0/Product", conceptNode.entityTypeIRI));
  } else if(conceptNode.entityTypeIRI.toString().includes("Office")) {
    assertions.push(test.assertEqual("http://example.org/Office-0.0.1/Office", conceptNode.entityTypeIRI));
  }
  assertions.push(test.assertEqual(1, conceptNode.total));
});

assertions;
