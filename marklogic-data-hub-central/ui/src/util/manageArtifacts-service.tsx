import axiosInstance from "@config/axios.ts";

const getMappingValidationResp = async (mapName: string, map, uri: string, dbName: string) => {
  let resp = await axiosInstance.post(`/api/artifacts/mapping/validation?uri=${encodeURIComponent(uri)}&db=${dbName}`, map);
  return resp;
};

const getNestedEntities = async entityTypeTitle => {
  const path = `/api/artifacts/mapping/entity/${entityTypeTitle}`;
  let response = await axiosInstance.get(path);
  return response;
};

export {getMappingValidationResp, getNestedEntities};
