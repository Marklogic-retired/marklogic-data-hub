function invokeEntitySearchModule(module, args, options = {}) {
  return fn.head(xdmp.invoke("/data-hub/data-services/entitySearch/" + module, args, options));
}

function saveQuery(saveQuery) {
  return invokeEntitySearchModule("saveSavedQuery.mjs", {"saveQuery": saveQuery}, {update: "true"});
}

function updateSavedQuery(updatedQuery) {
  return invokeEntitySearchModule("saveSavedQuery.mjs", {"saveQuery": updatedQuery}, {update: "true"});
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
