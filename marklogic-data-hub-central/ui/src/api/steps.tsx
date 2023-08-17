import axiosInstance from "@config/axios.ts";

export const createStep = async (name, type, settings) => {
  return await axiosInstance.post(`/api/steps/${type}`, settings);
};

export const updateStep = async (name, type, settings) => {
  return await axiosInstance.put(`/api/steps/${type}/${name}`, settings);
};

export const getStep = async (name, type) => {
  return await axiosInstance.get(`/api/steps/${type}/${name}`);
};

export const getSteps = async type => {
  return await axiosInstance.get(`/api/steps/${type}`);
};

export const deleteStep = async (name, type) => {
  return await axiosInstance.delete(`/api/steps/${type}/${name}`);
};
