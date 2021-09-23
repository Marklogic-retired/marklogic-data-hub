import axios from "axios";
import {EntityModified} from "../types/modeling-types";

export const primaryEntityTypes = async () => {
  return await axios.get(`/api/models/primaryEntityTypes?includeDrafts=true`);
};

export const createEntityType = async (entityPayload: any) => {
  return await axios.post("/api/models", entityPayload);
};

export const updateModelInfo = async (name: string, description: string,
  namespace: string, prefix: string) => {
  let payload = {
    description: description,
    namespace: namespace,
    namespacePrefix: prefix
  };
  return await axios.put(`/api/models/${name}/info`, payload);
};

export const entityReferences = async (entityName: string, propertyName?: string) => {
  if (propertyName) {
    return await axios.get(`/api/models/${entityName}/references?propertyName=${propertyName}`);
  } else {
    return await axios.get(`/api/models/${entityName}/references`);
  }
};

export const deleteEntity = async (entityName: string) => {
  return await axios.delete(`/api/models/${entityName}`);
};

export const updateEntityModels = async (entityModifiedArray: EntityModified[]) => {
  return await axios.put(`/api/models/entityTypes`, entityModifiedArray);
};

export const publishDraftModels = async () => {
  return await axios.put(`/api/models/publishDraftModels`);
};

export const getHubCentralConfig = async () => {
  return await axios.get(`/api/models/hubCentralConfig`);
};

export const updateHubCentralConfig = async (hubCentralConfig: any) => {
  return await axios.put(`/api/models/hubCentralConfig`, hubCentralConfig);
};
