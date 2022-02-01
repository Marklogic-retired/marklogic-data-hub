import axios from "axios";
import {endpoints} from "../config/endpoints.js";
import persons from "../mocks/persons.json";
import {searchResults} from "../mocks/results";
import {summary} from "../mocks/summary";
import {saved} from "../mocks/saved";
import {detail} from "../mocks/detail";
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

// export const getSearchResults = async (query) => { // TODO
export const getSearchResultsOld = (query) => {
  // return await axios.get(`/api/searchResults`); // TODO
  //console.log("getSearchResults", query);
  const results = _.clone(searchResults);
  results["start"] = query.start;
  results["pageLength"] = query.pageLength;
  let personsSlice = persons.slice((query.start - 1), (query.start + query.pageLength -1));
  let fsKeys = Object.keys(query.facetStrings);
  let newArr;
  // TODO Fake faceted search for now...
  fsKeys.forEach(key => {
    if (key === "Status") {
      newArr = personsSlice.filter(p => {
        return query.facetStrings[key].includes(p.entityInstance.status);
      })
      personsSlice = newArr;
    }
    if (key === "Sources") {
      newArr = personsSlice.filter(p => {
        let intersected = _.intersection(query.facetStrings[key], p.entityInstance.sources);
        return intersected.length > 0;
      })
      personsSlice = newArr;
    }
  });
  // TODO Fake qtext search for now...
  let qRes;
  if (query.qtext.trim() !== '') {
    let test;
    // Check first name
    qRes = personsSlice.filter(p => {
      test = Array.isArray(p.entityInstance.name) ? 
        p.entityInstance.name.join(' ').toLowerCase() : 
        p.entityInstance.name.toLowerCase();
      return test.includes(query.qtext.trim().toLowerCase());
    });
  }
  personsSlice = (qRes !== undefined && qRes.length > 0) ? qRes : personsSlice;
  return {
    ...results,
    results: personsSlice,
    returned: personsSlice.length,
    total: persons.length
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

// export const getDetail = async (opts) => { // TODO
export const getDetailOld = (opts) => {
  // return await axios.get(`/api/saved`); // TODO
  const result = _.clone(detail);
  const person = persons.find(p => p.entityInstance.personId === parseInt(opts));
  if (person !== undefined) {
    result["docUri"] = person["uri"];
    result["entityInstanceProperties"] = person.entityInstance;
  }
  return result;
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

export const twizzlersLogin = async () => { 
  try {
    const response = await axios.get("/api/explore/twizzlers/login");
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: getUserid", message);
  }
};

export const hcLogin = async (username, password, userid) => { 
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
    console.error("Error: hcLogin", message);
  }
};

export const hcGetSession = async (userid) => { 
  let config = {
    headers: {
      userid: userid ? userid : null
    }
  }
  try {
    const response = await axios.get("/api/environment/systemInfo", config);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error: hcGetSession", message);
  }
};