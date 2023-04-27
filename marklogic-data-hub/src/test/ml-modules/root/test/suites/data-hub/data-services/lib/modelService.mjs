function getModelReferences(entityName, propertyName) {
  return fn.head(xdmp.invoke(
    "/data-hub/data-services/models/getModelReferences.mjs",
    {entityName, propertyName}
  ));
}

export default {
  getModelReferences
};
