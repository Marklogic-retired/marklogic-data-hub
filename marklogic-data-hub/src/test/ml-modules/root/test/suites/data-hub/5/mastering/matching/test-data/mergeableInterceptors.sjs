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

module.exports = {
  customApplyDocumentContextInterceptor
}