import axios, {AxiosInstance} from "axios";

let mlAuthentication = window.localStorage.getItem("dataHubEnvironmentSettings");
let mlBasePathURL =  window.localStorage.getItem("dataHubBasePath");

const axiosInstance: AxiosInstance = mlAuthentication && mlAuthentication === "cloud" ? 
  axios.create({
    baseURL: `${mlBasePathURL}`
  }) :
  axios.create({});

export default axiosInstance;