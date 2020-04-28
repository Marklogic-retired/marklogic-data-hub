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
