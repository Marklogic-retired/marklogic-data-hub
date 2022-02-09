import axios from "axios";
import {endpoints} from "../config/endpoints.js";
import persons from "../mocks/persons.json";
import {summary} from "../mocks/summary";
import {saved} from "../mocks/saved";
import _ from "lodash";

export const getSearchResults = async (query, userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.post(endpoints.searchResults, query, config);
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

// export const getSaved = async (opts) => { // TODO
export const getSaved = (opts) => {
  // return await axios.get(`/api/saved`); // TODO
  //console.log("getSaved", opts, saved);
  return saved;
};

export const getDetail = async (query, userid) => {
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.post(endpoints.detail, query, config);
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

// export const getRecent = async (opts) => { // TODO
export const getRecent = (opts) => {
  // return await axios.get(`/api/getRecent`); // TODO
  const rand = getRandomInt(1, 90);
  //console.log("getRecent", opts);
  const myPersons = _.clone(persons);
  let personsSlice = myPersons.slice(rand, rand+5);
  const rand2 = getRandomInt(0, 5);
  personsSlice = personsSlice.map((p, i) => {
    p["alert"] = i === rand2;
    return p;
  });
  return personsSlice;
};

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
  let config = {
    headers: {
      'x-forward': proxy
    }
  }
  try {
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
