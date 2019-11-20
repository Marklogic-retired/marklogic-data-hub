const mappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

function testNodeValues(node) {
  try {
    return [
      test.assertEqual(fn.string(node.xpath('firstName')), 'John', `Couldn't match first name in node (${xdmp.describe(node)})`),
      test.assertEqual(fn.string(node.xpath('lastName')), 'Doe', `Couldn't match last name in node (${xdmp.describe(node)})`),
    ];
  } catch(e) {
    test.assertFalse(true, `Encountered error '${e.message}' with node (${xdmp.describe(node)})`);
  }
}

const jsonEnvelope = mappingLib.extractInstance(xdmp.toJSON({envelope: {
    instance: {
      firstName: 'John',
      lastName: 'Doe'
    }
  }}));
const jsonNoEnvelope = mappingLib.extractInstance(xdmp.toJSON({
      firstName: 'John',
      lastName: 'Doe'
   }));
const xmlNoRootEnvelope = mappingLib.extractInstance(fn.head(xdmp.unquote('<envelope><instance><firstName>John</firstName><lastName>Doe</lastName></instance></envelope>')));
const xmlRootEnvelope = mappingLib.extractInstance(fn.head(xdmp.unquote('<envelope><instance><person><firstName>John</firstName><lastName>Doe</lastName></person></instance></envelope>')));
const xmlRootNoEnvelope = mappingLib.extractInstance(fn.head(xdmp.unquote(`<person><firstName>John</firstName><lastName>Doe</lastName></person>`)));

[]
  .concat(testNodeValues(jsonEnvelope))
  .concat(testNodeValues(jsonNoEnvelope))
  .concat(testNodeValues(xmlNoRootEnvelope))
  .concat(testNodeValues(xmlRootEnvelope))
  .concat(testNodeValues(fn.head(xmlRootNoEnvelope.xpath('person'))));
