function invokeEntitySearchModule(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/entitySearch/" + module, args));
}

function saveQuery(saveQuery) {
  return invokeEntitySearchModule("saveSavedQuery.mjs", {"saveQuery": saveQuery});
}

function updateSavedQuery(updatedQuery) {
  return invokeEntitySearchModule("saveSavedQuery.mjs", {"saveQuery": updatedQuery});
}

function getSavedQuery(id) {
  return invokeEntitySearchModule("getSavedQuery.mjs", {id});
}

function getSavedQueries() {
  return invokeEntitySearchModule("getSavedQueries.mjs", {});
}

function deleteSavedQuery(id) {
  return invokeEntitySearchModule("deleteSavedQuery.mjs", {id});
}

function getRecord(docUri) {
  return invokeEntitySearchModule("getRecord.mjs", {docUri});
}

export default {
  deleteSavedQuery,
  getRecord,
  getSavedQuery,
  getSavedQueries,
  saveQuery,
  updateSavedQuery
};
