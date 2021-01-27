var contentArray;
var options;

// This is passed in because it's defined in the interceptors config in the flow file
var headerValueToAdd;

contentArray.forEach(content => {
  content.value.envelope.headers.hello = headerValueToAdd;
});
