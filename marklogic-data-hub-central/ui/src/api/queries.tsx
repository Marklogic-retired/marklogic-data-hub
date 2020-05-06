import axios from "axios";

export const creatNewQuery = async (query) => {
    return await axios({
        method: 'POST',
        url: `/api/entitySearch/savedQueries`,
        data: query
    });
}

export const fetchQueries = async () => {
  return await axios({
    method: 'GET',
    url: `/api/entitySearch/savedQueries`
  });
}

export const fetchQueryById = async (query) => {
    return await axios({
        method: 'GET',
        url: `/api/entitySearch/savedQueries/query?id=${query.savedQuery.id}`
    });
}

export const updateQuery = async (query) => {
    return await axios.put(`/api/entitySearch/savedQueries`, {query});
}

export const removeQuery = async (query) => {
  return await axios({
    method: 'DELETE',
    url: `/api/entitySearch/savedQueries/query?id=${query.savedQuery.id}`
  });
}

export const exportQuery = (query, limit) => {
  let queryString = JSON.stringify(query)
  const mapForm = document.createElement("form");
  mapForm.target ="_self"||"_blank";
  mapForm.id="exportForm";
  mapForm.method = "POST";
  mapForm.action = "/api/entitySearch/export";
  const mapInput = document.createElement("input");
  mapInput.type = "hidden";
  mapInput.name = "fileType";
  mapInput.value = "csv";
  const mapInput2 = document.createElement("input");
  mapInput2.type = "hidden";
  mapInput2.name = "limit";
  mapInput2.value = limit === Number.MAX_SAFE_INTEGER || limit < 1 ? '' : limit;
  const mapInput3 = document.createElement("input");
  mapInput3.type = "hidden";
  mapInput3.name = "queryDocument";
  mapInput3.value = queryString;
  mapForm.appendChild(mapInput);
  mapForm.appendChild(mapInput2);
  mapForm.appendChild(mapInput3);
  document.body.appendChild(mapForm);
  mapForm.submit();
  mapForm.reset();
}

export const exportSavedQuery = (id, limit) => {
  window.open(`/api/entitySearch/export/query/${id}?fileType=csv&limit=${limit === Number.MAX_SAFE_INTEGER || limit < 1 ? '' : limit}`, '_self');
}