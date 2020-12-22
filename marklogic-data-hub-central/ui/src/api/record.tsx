import axios from "axios";

export const getRecord = async (uri, database) => {
  let encodedUri = encodeURIComponent(uri);
  return await axios({
    url: `/api/record/download?docUri=${encodedUri}&database=${database}`,
    method: "GET",
    responseType: "blob"
  });
};