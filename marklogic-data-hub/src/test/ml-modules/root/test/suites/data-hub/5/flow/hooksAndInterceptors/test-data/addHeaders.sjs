var contentArray;
var options;

var headerValueToAdd;

contentArray.forEach(content => {
  const contentValue = content.value.toObject();
  contentValue.envelope.headers.interceptorHeader = headerValueToAdd;
  content.value = contentValue;
});
