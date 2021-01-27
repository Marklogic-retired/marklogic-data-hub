var contentArray;
var options;

contentArray.forEach(content => {
  if (fn.string(content.value.envelope.instance.name) == "Jane") {
    content.context.permissions.push(xdmp.permission("qconsole-user", "read"));
  }
});
