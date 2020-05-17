function invokeSavedQuery(module, args) {
  return fn.head(xdmp.invoke("/data-hub/5/data-services/entitySearch/" + module, args));
}

function saveQuery(saveQuery) {
  return invokeSavedQuery("saveSavedQuery.sjs", {"saveQuery": saveQuery});
}

function updateSavedQuery(updatedQuery) {
  return invokeSavedQuery("saveSavedQuery.sjs", {"saveQuery": updatedQuery});
}

function getSavedQuery(id) {
  return invokeSavedQuery("getSavedQuery.sjs", {id});
}

function getSavedQueries() {
  return invokeSavedQuery("getSavedQueries.sjs", {});
}

function deleteSavedQuery(id) {
  return invokeSavedQuery("deleteSavedQuery.sjs", {id});
}

module.exports = {
  saveQuery,
  updateSavedQuery,
  getSavedQuery,
  getSavedQueries,
  deleteSavedQuery
};
