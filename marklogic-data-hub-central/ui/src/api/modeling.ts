import axios from "axios";

export const primaryEntityTypes = async () => {
  return await axios.get(`/api/models/primaryEntityTypes`);
}

export const updateModelInfo = async (name: string, description: string) => {
  return await axios.put(`/api/models/${name}/info`, { description });
}

// Work in Progress
export const updateModelProperties = async (name, req) => {
  return await axios.put(`/api/models/${name}/entityTypes`, { req });
}