import axiosInstance from "@config/axios.ts";

export const getSystemInfo = async () => {
  return await axiosInstance.get(`/api/environment/systemInfo`);
};
