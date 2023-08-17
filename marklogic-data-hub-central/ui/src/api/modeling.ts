import axiosInstance from "@config/axios.ts";
import {EntityModified} from "../types/modeling-types";

export const primaryEntityTypes = async () => {
  return await axiosInstance.get(`/api/models/primaryEntityTypes?includeDrafts=true`);
};

export const createEntityType = async (entityPayload: any) => {
  return await axiosInstance.post("/api/models", entityPayload);
};

export const updateModelInfo = async (name: string, description: string, namespace: string, prefix: string) => {
  let payload = {
    description: description,
    namespace: namespace,
    namespacePrefix: prefix,
  };
  return await axiosInstance.put(`/api/models/${name}/info`, payload);
};

export const entityReferences = async (entityName: string, propertyName?: string) => {
  if (propertyName) {
    return await axiosInstance.get(`/api/models/${entityName}/references?propertyName=${propertyName}`);
  } else {
    return await axiosInstance.get(`/api/models/${entityName}/references`);
  }
};

export const deleteEntity = async (entityName: string) => {
  return await axiosInstance.delete(`/api/models/${entityName}`);
};

export const updateEntityModels = async (entityModifiedArray: EntityModified[]) => {
  return await axiosInstance.put(`/api/models/entityTypes`, entityModifiedArray);
};

export const publishDraftModels = async () => {
  return await axiosInstance.put(`/api/models/publishDraftModels`);
};

export const clearDraftModels = async () => {
  return await axiosInstance.put(`/api/models/clearDraftModels`);
};

export const getHubCentralConfig = async () => {
  return await axiosInstance.get(`/api/models/hubCentralConfig`);
};

export const updateHubCentralConfig = async (hubCentralConfig: any) => {
  return await axiosInstance.put(`/api/models/hubCentralConfig`, hubCentralConfig);
};

export const createConceptClass = async (conceptClassPayload: any) => {
  return await axiosInstance.post(`/api/concepts`, conceptClassPayload);
};

export const deleteConceptClass = async (conceptName: string) => {
  return await axiosInstance.delete(`/api/concepts/${conceptName}`);
};

export const updateConceptClass = async (conceptClassName: string, conceptClassDescription: string) => {
  return await axiosInstance.put(`/api/concepts/${conceptClassName}/info`, {description: conceptClassDescription});
};

export const conceptClassReferences = async (conceptClassName: string) => {
  return await axiosInstance.get(`/api/concepts/${conceptClassName}/references`);
};
