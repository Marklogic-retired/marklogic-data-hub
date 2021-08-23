var doc;

const person = doc.toObject().customEnvelope.Person;

// For this test, we know there's only one entityName; for a more realistic implementation, the developer
// would apply some logic to determine the entity type
const details = {
  "entityName": "Person",
  "properties": {}
};

// Copy the nested "value" value into a top-level property so that it adheres to what HC expects
Object.keys(person).forEach(key => {
  details.properties[key] = person[key].value;
});

details
