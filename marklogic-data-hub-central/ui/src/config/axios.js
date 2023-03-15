import axios from "axios";

let mlAuthentication = window.localStorage.getItem("dataHubEnvironmentSettings");
let mlBasePathURL =  window.localStorage.getItem("dataHubBasePath");

const instance = mlAuthentication === "cloud" ? 
  axios.create({
    baseURL: `${mlBasePathURL}`
  }) :
  axios.create({});

export default instance;