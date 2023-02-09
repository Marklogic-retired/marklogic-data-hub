import DataHubSingleton from "/data-hub/5/datahub-singleton.mjs";
import hubTest from "/test/data-hub-test-helper.mjs";

const test = require("/test/test-helper.xqy");
const datahub = DataHubSingleton.instance();
let assertions = [];

const mappingStep = hubTest.getRecord("/steps/mapping/mappingStep1.step.json").document;

assertions = assertions.concat(test.assertEqual(false, mappingStep.attachSourceDocument));

let content = ['/content/customerInfoWithoutAttachment.json'].map(uri => {
  return {
    uri: uri,
    value: fn.head(xdmp.unquote('{"customerId": 100, "name": "Cynthia Waters"}'))
  };
});
datahub.flow.runFlow('simpleMappingFlow', 'testJob', content, {outputFormat: 'json', mapping:{name:'mappingStep1'}}, 1);
const mappedCustomerInstanceWithoutAttachment = hubTest.getRecord("/content/customerInfoWithoutAttachment.json").document;

assertions = assertions.concat([test.assertEqual(null, mappedCustomerInstanceWithoutAttachment.envelope.attachments),
  test.assertEqual(100, mappedCustomerInstanceWithoutAttachment.envelope.instance.Customer.customerId, xdmp.describe(mappedCustomerInstanceWithoutAttachment, Sequence.from([]),Sequence.from([]))),
  test.assertEqual("Cynthia Waters", mappedCustomerInstanceWithoutAttachment.envelope.instance.Customer.name)
]);


content[0].uri = '/content/customerInfoWithAttachment.json'
datahub.flow.runFlow('simpleMappingFlow', 'testJob', content, {outputFormat: 'json', mapping:{name:'mappingStep2'}}, 2);
const mappedCustomerInstanceWithAttachment  = hubTest.getRecord("/content/customerInfoWithAttachment.json").document;

assertions = assertions.concat([test.assertEqual(100, mappedCustomerInstanceWithAttachment.envelope.attachments.customerId, xdmp.describe(mappedCustomerInstanceWithAttachment, Sequence.from([]),Sequence.from([]))),
  test.assertEqual("Cynthia Waters", mappedCustomerInstanceWithAttachment.envelope.attachments.name),
  test.assertEqual(100, mappedCustomerInstanceWithAttachment.envelope.instance.Customer.customerId),
  test.assertEqual("Cynthia Waters", mappedCustomerInstanceWithAttachment.envelope.instance.Customer.name)
]);

assertions;

