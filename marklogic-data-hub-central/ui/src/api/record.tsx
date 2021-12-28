import axios from "axios";

export const getRecord = async (uri, database) => {
  let encodedUri = encodeURIComponent(uri);
  return await axios({
    url: `/api/record/download?docUri=${encodedUri}&database=${database}`,
    method: "GET",
    responseType: "blob"
  });
};

export const getDetails = async (uri, database) => {
  let encodedUri = encodeURIComponent(uri);
  return await axios({
    url: `/api/entitySearch?docUri=${encodedUri}&database=${database}`,
    method: "GET",
  });
};