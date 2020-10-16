import axios from "axios";

export const getSystemInfo = async () => {
  return await axios.get(`/api/environment/systemInfo`);
}