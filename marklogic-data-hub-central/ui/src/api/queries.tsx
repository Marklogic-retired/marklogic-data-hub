import axios from "axios";

export const saveQuery = async (query) => {
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

export const updateQuery = async (query) => {
  return await axios({
    method: 'PUT',
    url: `/api/entitySearch/savedQueries`,
    data: query
  });
}

export const removeQuery = async (query) => {
  return await axios({
    method: 'DELETE',
    url: `/api/entitySearch/savedQueries/query?id=${query.savedQuery.id}`
  });
}