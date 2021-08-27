import axios from "axios";
import {EntityModified} from "../types/modeling-types";

export const primaryEntityTypes = async () => {
  return await axios.get(`/api/models/primaryEntityTypes?includeDrafts=true`);
};

export const updateModelInfo = async (name: string, description: string,
  namespace: string, prefix: string, color: string, graphX?: number, graphY?: number) => {
  let payload = {
    description: description,
    namespace: namespace,
    namespacePrefix: prefix,
    hubCentral: {
      modeling: {
        color: color
      }
    }
  };
  if (graphX && graphY) {
    payload.hubCentral.modeling["graphX"] = graphX;
    payload.hubCentral.modeling["graphY"] = graphY;
  }
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
