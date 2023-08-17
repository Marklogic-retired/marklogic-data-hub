import axiosInstance from "@config/axios.ts";

const getUris = async (stepName: string, count: number) => {
  let resp = await axiosInstance.get(`/api/steps/mapping/${stepName}/uris?limit=${count}`);
  return resp;
};

const getDoc = async (stepName: string, docUri: string) => {
  let resp = await axiosInstance.get(`/api/steps/mapping/${stepName}/doc?docUri=${encodeURIComponent(docUri)}`);
  return resp;
};

export {getUris, getDoc};
