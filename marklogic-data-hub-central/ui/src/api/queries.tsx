import axios from "@config/axios";

export const creatNewQuery = async (query) => {
  return await axios({
    method: "POST",
    url: `/api/entitySearch/savedQueries`,
    data: query
  });
};

export const fetchQueries = async () => {
  return await axios({
    method: "GET",
    url: `/api/entitySearch/savedQueries`
  });
};

export const fetchQueryById = async (query) => {
  return await axios({
    method: "GET",
    url: `/api/entitySearch/savedQueries/query?id=${query.savedQuery.id}`
  });
};

export const updateQuery = async (query) => {
  return await axios.put(`/api/entitySearch/savedQueries`, {query});
};

export const removeQuery = async (query) => {
  return await axios({
    method: "DELETE",
    url: `/api/entitySearch/savedQueries/query?id=${query.savedQuery.id}`
  });
};

export const exportQuery = (query, limit, database) => {
  let queryString = JSON.stringify(query);
  const mapForm = document.createElement("form");
  mapForm.target = "_self" || "_blank";
  mapForm.id = "exportForm";
  mapForm.method = "POST";
  mapForm.action = `/api/entitySearch/export?database=${database}`;
  const mapInput = document.createElement("input");
  mapInput.type = "hidden";
  mapInput.name = "fileType";
  mapInput.value = "csv";
  const mapInput2 = document.createElement("input");
  mapInput2.type = "hidden";
  mapInput2.name = "limit";
  mapInput2.value = limit === Number.MAX_SAFE_INTEGER || limit < 1 ? "" : limit;
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
};

export const getExportQueryPreview = async (query, database) => {
  let queryString = JSON.stringify(query);
  const mapForm = document.createElement("form");
  mapForm.id = "exportForm";
  const mapInput = document.createElement("input");
  mapInput.type = "hidden";
  mapInput.name = "fileType";
  mapInput.value = "csv";
  const mapInput2 = document.createElement("input");
  mapInput2.type = "hidden";
  mapInput2.name = "limit";
  mapInput2.value = "2";
  const mapInput3 = document.createElement("input");
  mapInput3.type = "hidden";
  mapInput3.name = "queryDocument";
  mapInput3.value = queryString;
  mapForm.appendChild(mapInput);
  mapForm.appendChild(mapInput2);
  mapForm.appendChild(mapInput3);
  document.body.appendChild(mapForm);

  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/entitySearch/export?database=${database}`);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };

    let formData = new FormData(mapForm);
    xhr.send(formData);
  });

};

export const exportSavedQuery = (id, limit, database) => {
  window.open(`/api/entitySearch/export/query/${id}?fileType=csv&limit=${limit === Number.MAX_SAFE_INTEGER || limit < 1 ? "" : limit}&database=${database}`, "_self");
};

export const getSavedQueryPreview = async (id, database) => {
  return await axios({
    method: "GET",
    url: `/api/entitySearch/export/query/${id}?fileType=csv&limit=2&database=${database}`
  });

};

export const graphSearchQuery = async (graphSearchPayload: any) => {
  return await axios.post(`/api/entitySearch/graph?database=${graphSearchPayload.database}`, graphSearchPayload.data)
    // Catching 400 error that occurs when graph is called before payload is ready
    .catch((error) => {
      if (error.response && error.response.status === 400) {
        return {status: 200, data: {total: 0, nodes: [], edges: []}};
      }
      return error;
    });
};

export const expandGroupNode = async (payload: any, limit?: number) => {
  let url = !limit ? `/api/entitySearch/nodeExpand?database=${payload.database}` : `/api/entitySearch/nodeExpand?database=${payload.database}&limit=${limit}`;
  return await axios.post(url, payload.data);
};

export const searchResultsQuery = async (searchPayload: any) => {
  return await axios.post(`/api/entitySearch?database=${searchPayload.database}`, searchPayload.data);
};
export const getEntities = async () => {
  return await axios.get(`/api/models`);
};

export const facetValues = async (database: string, payload: any) => {
  return await axios.post(`/api/entitySearch/facet-values?database=${database}`, payload);
};

export const primaryEntityTypes = async () => {
  return await axios.get(`/api/models/primaryEntityTypes`);
};

export const fetchSemanticConceptInfo = async (semanticConceptIRI: string, database: string) => {
  return await axios.get(`/api/entitySearch/graph/semanticConceptInfo?semanticConceptIRI=${semanticConceptIRI}&database=${database}`);
};
