import axios from "axios";
import {summary} from "../mocks/summary";
import _ from "lodash";

export const getSearchResults = async (endpoint, query, userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.post(endpoint, query, config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getSearchResults", message);
  }
};

// export const getSummary = async (opts) => { // TODO
export const getSummary = (opts) => {
  // return await axios.get(`/api/summary`); // TODO
  //console.log("getSummary", opts, summary);
  return summary;
};

export const getDetail = async (endpoint, query, userid) => {
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.post(endpoint, query, config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getDetail", message);
  }
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export const getProxy = async () => { 
  try {
    const response = await axios.get("/api/explore/proxyAddress");
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getProxy", message);
  }
};

export const getUserid = async (proxy) => { 
  // setupProxy.js script will dynamically proxy to x-forward value
  let config = {
    headers: {
      'x-forward': proxy
    }
  }
  try {
    // URL string here just needs to match what is in setupProxy.js
    const response = await axios.get("/api/explore/login", config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getUserid", message);
  }
};

export const login = async (username, password, userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.post("/api/login", {
      "username": username,
      "password": password
    }, config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: login", message);
  }
};

export const getConfig = async (userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.get("/api/explore/uiconfig", config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getConfig", message);
  }
};

export const saveRecent = async (endpoint, uri, userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  let body = {
    user: userid ? userid : null,
    recordUri: uri ? uri : null
  }
  try {
    const response = await axios.post(endpoint, body, config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getConfig", message);
  }
};

export const getRecent = async (endpoint, userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.get(endpoint + "?user=" + userid, config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getConfig", message);
  }
};

export const getRecords = async (endpoint, uris, userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  let body = {
    uris: uris
  };
  try {
    const response = await axios.post(endpoint, body, config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getConfig", message);
  }
};