xdmp.invokeFunction(() => {
  for (const contentObject of external.content) {
    xdmp.documentInsert("/afterHook" + contentObject.uri, contentObject.value, contentObject.context.permissions);
  }
}, { update: "true" });