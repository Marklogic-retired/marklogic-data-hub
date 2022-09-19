const test = require("/test/test-helper.xqy");

function customApplyDocumentContextInterceptor(contentObject, actionDetails, targetEntity) {
  switch (actionDetails.action) {
    case "merge" :
      contentObject.context.collections.push(`sm-${targetEntity}-merged-intercepted`);
      break;
    case "notify":
      contentObject.context.collections.push(`sm-${targetEntity}-notification-intercepted`);
      break;
    case "no-action":
      contentObject.context.collections.push(`sm-${targetEntity}-mastered-intercepted`);
      break;
    default:
  }
  return contentObject;
}

function customMerge(propertyName, properties) {
  test.assertTrue(properties.some(prop => "source 1" === prop.sources.name));
  test.assertTrue(properties.some(prop => "source 2" === prop.sources.name));
  test.assertTrue(properties.some(prop => "source 3" === prop.sources.name));
  return {sources: {name: "custom merge", dateTime: fn.currentDateTime()}, values: true, propertyName };
}

module.exports = {
  customApplyDocumentContextInterceptor,
  customMerge
}