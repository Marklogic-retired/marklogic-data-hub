const test = require("/test/test-helper.xqy");
const graphUtils = require("/data-hub/5/impl/graph-utils.sjs");

function invoke(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/graph/" + module, args));
}
function getEntitiesWithRelatedConcepts() {
  return invoke("entitiesWithConceptsTypes.sjs", {});
}

let assertions = [
];

const result = getEntitiesWithRelatedConcepts();

assertions.push(test.assertEqual(4,result.entitites.length, `should contain 3 entities. Entities: ${xdmp.toJsonString(result.entitites)}`));

if (graphUtils.supportsGraphConceptsSearch()) {
  result.entitites.forEach(entity => {
    if (entity.entityType == "http://example.org/Office-0.0.1/Office") {
      assertions.push(test.assertEqual(1, entity.relatedConcepts.length, "should contain only one concept"));
      assertions.push(test.assertEqual("http://www.example.com/Category/Sneakers", entity.relatedConcepts[0].conceptIRI, "should contain only Sneaker as concept"));
      assertions.push(test.assertEqual(1, entity.relatedConcepts[0].count, "should be 1"));
      assertions.push(test.assertEqual("ClothType", entity.relatedConcepts[0].conceptClass, "should be ClothType"));
    }
    if (entity.entityType == "http://example.org/Product-1.0.0/Product") {
      assertions.push(test.assertEqual(3, entity.relatedConcepts.length, `should contain three concepts. Related concepts: ${xdmp.toJsonString(entity.relatedConcepts)}`));

      entity.relatedConcepts.forEach(relatedConcept => {
        if (relatedConcept.conceptIRI === "http://www.example.com/Category/BasketballShoes") {
          assertions.push(test.assertEqual("http://www.example.com/Category/BasketballShoes", relatedConcept.conceptIRI, `should contain BasketballShoes. Related concepts: ${xdmp.toJsonString(entity.relatedConcepts)}`));
          assertions.push(test.assertEqual(2, relatedConcept.count, "should be 2"));
          assertions.push(test.assertEqual("ShoeType", relatedConcept.conceptClass, `should be ShoeType. Related concepts: ${xdmp.toJsonString(entity.relatedConcepts)}`));
        }
        if (relatedConcept.conceptIRI === "http://www.example.com/Category/Sneakers") {
          assertions.push(test.assertEqual("http://www.example.com/Category/Sneakers", relatedConcept.conceptIRI, `should contain Sneaker. Related concepts: ${xdmp.toJsonString(entity.relatedConcepts)}`));
          assertions.push(test.assertEqual(1, relatedConcept.count, "should be 1"));
          assertions.push(test.assertEqual("ShoeType", relatedConcept.conceptClass, `should be ShoeType. Related concepts: ${xdmp.toJsonString(entity.relatedConcepts)}`));
        }
        if (relatedConcept.conceptIRI === "test concept instance") {
          assertions.push(test.assertEqual("test concept instance", relatedConcept.conceptIRI, `should contain test concept instance. Related concepts: ${xdmp.toJsonString(entity.relatedConcepts)}`));
          assertions.push(test.assertEqual(1, relatedConcept.count, "should be 1"));
          assertions.push(test.assertEqual("TestConcept", relatedConcept.conceptClass, `should be TestConcept. Related concepts: ${xdmp.toJsonString(entity.relatedConcepts)}`));
        }
      });
    }
  });
}
assertions;
