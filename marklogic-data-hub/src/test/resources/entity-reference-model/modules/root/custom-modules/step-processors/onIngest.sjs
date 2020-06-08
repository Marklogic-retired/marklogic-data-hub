var contentArray;
var options;

contentArray.forEach(content => {
  // The URI is counter-intuitively modifiable via "context.uri" instead of "uri"
  content.context.uri = "/overridden/" + content.value.envelope.instance.CustomerID + ".json";
});
