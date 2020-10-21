function invokeEntitySearchModule(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/entitySearch/" + module, args));
}

function saveQuery(saveQuery) {
  return invokeEntitySearchModule("saveSavedQuery.sjs", {"saveQuery": saveQuery});
}

function updateSavedQuery(updatedQuery) {
  return invokeEntitySearchModule("saveSavedQuery.sjs", {"saveQuery": updatedQuery});
}

function getSavedQuery(id) {
  return invokeEntitySearchModule("getSavedQuery.sjs", {id});
}

function getSavedQueries() {
  return invokeEntitySearchModule("getSavedQueries.sjs", {});
}

function deleteSavedQuery(id) {
  return invokeEntitySearchModule("deleteSavedQuery.sjs", {id});
}

function getRecord(docUri) {
  return invokeEntitySearchModule("getRecord.sjs", {docUri});
}

module.exports = {
  deleteSavedQuery,
  getRecord,
  getSavedQuery,
  getSavedQueries,
  saveQuery,
  updateSavedQuery
};
