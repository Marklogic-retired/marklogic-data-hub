const test = require("/test/test-helper.xqy");
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

const output = datahub.flow.runFlow('myNewFlow', 'error-on-write-job', [
  {
    uri: '/customer1.json',
    value: cts.doc('/customer1.json'),
    context: {}
  },
  {
    uri: '/customer1.json',
    value: cts.doc('/customer1.json'),
    context: {}
  }
], {}, 2);

[
  test.assertEqual(2, output.errorCount, `This should show an error count of 2 since it failed on write. Output: ${xdmp.toJsonString(output)}`),
  test.assertEqual(0, output.completedItems.length, `Completed items should be empty since it failed on write. Output: ${xdmp.toJsonString(output)}`),
  test.assertEqual('/customer1.json', output.errors[0].uri, `It should show that the failure was with the "/customer1.json" document. Errors: ${xdmp.toJsonString(output.errors)}`)
];
