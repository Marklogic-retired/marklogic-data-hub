function getModelReferences(entityName, propertyName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/models/getModelReferences.mjs",
    {entityName, propertyName}
  ));
}

export default {
  getModelReferences
};
