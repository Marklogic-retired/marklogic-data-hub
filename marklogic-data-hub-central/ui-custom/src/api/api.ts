import axios from "axios";
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

export const getSearchResultsByGet = async (queryStr, userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.get("/api/explore?query=" + queryStr, config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getSearchResultsByGet", message);
  }
};

export const getDetail = async (endpoint, recordId, userid) => {
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.get(endpoint + "?recordId=" + recordId, config);
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

export const getLoginAddress = async () => { 
  try {
    const response = await axios.get("/api/explore/proxyAddress");
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getLoginAddress", message);
  }
};

export const getUserid = async (loginAddress) => { 
  // setupProxy.js script will dynamically proxy to x-forward value
  let config = {
    headers: {
      'x-forward': loginAddress
    }
  }
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
        // Development: URL string here needs to match what is in setupProxy.js
        response = await axios.get("/proxied", config);
    } else {
        // Production: CORS will need to be enabled on the loginAddress server 
        response = await axios.get(loginAddress);
    }
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
    console.error("Error: saveRecent", message);
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
    console.error("Error: getRecent", message);
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
    console.error("Error: getRecords", message);
  }
};

export const getMetrics = async (endpoint, opts, userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  let body = {metrics: opts};
  try {
    const response = await axios.post(endpoint, body, config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getWhatsNew", message);
  }
};
