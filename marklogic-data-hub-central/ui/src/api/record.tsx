import axios from "axios";

export const getRecord = async (uri, database) => {
  return await axios({
    url: `/api/record/download?docUri=${uri}&database=${database}`,
    method: "GET",
    responseType: "blob"
  });
};