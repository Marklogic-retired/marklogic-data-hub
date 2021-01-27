var contentArray;
var options;

contentArray.forEach(content => {
  // Example of content-driven permissions
  // Because the addHeaders.sjs interceptor was run already, and that converted content.value into an object as opposed
  // to a node, we don't need to call toObject() here on content.value.
  if (content.value.envelope.instance.Order.ShipCity == "Reims") {
    content.context.permissions.push(xdmp.permission("qconsole-user", "read"));
  }

  // Also, note that in order to modify permissions via a step interceptor during ingestion, you must use MLCP to ingest
  // the data, as a REST transform does not allow you to modify everything about the data to be ingested, such as
  // permissions or collections. See https://docs.marklogic.com/guide/rest-dev/transforms#id_23889 for more information
  // on what's available in the context passed to a REST transform.
});
