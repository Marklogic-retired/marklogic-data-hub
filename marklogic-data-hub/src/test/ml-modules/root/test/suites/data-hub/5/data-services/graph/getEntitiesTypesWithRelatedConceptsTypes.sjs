const test = require("/test/test-helper.xqy");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
}
function getEntitiesWithRelatedConcepts() {
  return invoke("entitiesWithConceptsTypes.sjs", {});
}

let assertions = [
];

const result = getEntitiesWithRelatedConcepts();

result.entitites.forEach(entity => {
  if(entity.entityType == "http://example.org/Office-0.0.1/Office") {
    assertions.push(test.assertEqual(1,entity.relatedConcepts.length), "should contain only one concept");
    assertions.push(test.assertEqual("http://www.example.com/Category/Sneakers",entity.relatedConcepts[0].conceptIRI), "should contain only Sneaker as concept");
    assertions.push(test.assertEqual(1,entity.relatedConcepts[0].count), "should be 1");
  }
  if(entity.entityType == "http://example.org/Product-1.0.0/Product") {
    assertions.push(test.assertEqual(2,entity.relatedConcepts.length), "should contain two concepts");
    assertions.push(test.assertEqual("http://www.example.com/Category/BasketballShoes",entity.relatedConcepts[0].conceptIRI), "should contain BasketballShoes");
    assertions.push(test.assertEqual(2,entity.relatedConcepts[0].count), "should be 2");
    assertions.push(test.assertEqual("http://www.example.com/Category/Sneakers",entity.relatedConcepts[1].conceptIRI), "should contain Sneaker");
    assertions.push(test.assertEqual(1,entity.relatedConcepts[1].count), "should be 1");
  }
})

assertions;
