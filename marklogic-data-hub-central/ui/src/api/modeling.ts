import axios from "axios";
import {EntityModified} from "../types/modeling-types";

export const primaryEntityTypes = async () => {
  return await axios.get(`/api/models/primaryEntityTypes`);
};

export const updateModelInfo = async (name: string, description: string, namespace: string, prefix: string) => {
  return await axios.put(`/api/models/${name}/info`, {
    description: description,
    namespace: namespace,
    namespacePrefix: prefix
  });
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
