function getModelReferences(entityName, propertyName) {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/models/getModelReferences.sjs",
    {entityName, propertyName}
  ));
}

module.exports = {
  getModelReferences
};
