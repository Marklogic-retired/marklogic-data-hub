import axios from "@config/axios";

export const getSystemInfo = async () => {
  return await axios.get(`/api/environment/systemInfo`);
};