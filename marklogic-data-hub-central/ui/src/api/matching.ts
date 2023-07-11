import axiosInstance from "@config/axios.ts";

export const updateMatchingArtifact = async matching => {
  try {
    let response = await axiosInstance.put(`/api/steps/matching/${matching.name}`, matching);
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error while updating the matching step!", message);
    return false;
  }
};

export const calculateMatchingActivity = async matchStepName => {
  try {
    let response = await axiosInstance.get(`/api/steps/matching/${matchStepName}/calculateMatchingActivity`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    let message = error;
    console.error("Error while fetching the match activity!", message);
  }
};

export const previewMatchingActivity = async testMatchData => {
  try {
    let response = await axiosInstance.post(
      `/api/steps/matching/${testMatchData.stepName}/previewMatchingActivity?sampleSize=${
        testMatchData.sampleSize
      }&uris=${testMatchData.uris}&restrictToUris=${
        testMatchData.restrictToUris
      }&nonMatches=${!!testMatchData.nonMatches}`,
    );
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    let message = error;
    console.error("Error while fetching the preview matching activity!", message);
  }
};

export const getDocFromURI = async uri => {
  return await axiosInstance.get(`/api/entitySearch?docUri=${uri}`);
};

export const getPreviewFromURIs = async (flowName, uris = []) => {
  // return await axios.get(`/api/entitySearch?docUri=${uri}`);
  // &uri=/json/persons/last-name-address-reduce1.json&uri=/json/persons/last-name-address-reduce2.json
  let parameters = uris.map(uri => `uri=${uri}`).join("&");
  return await axiosInstance.get(`/api/steps/merging/preview?flowName=${flowName}&${parameters}`);
};

export const getAllExcludeValuesList = async () => {
  return await axiosInstance.get(`/api/steps/matching/exclusionList`);
};

export const createEditExcludeValuesList = async (listName, listValues, oldName = "") => {
  const body = {
    name: listName,
    values: listValues,
  };
  try {
    let response = await axiosInstance.put(`/api/steps/matching/exclusionList/${oldName !== "" ? oldName : listName}`, body);
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error creating list!", message);
    return false;
  }
};

export const deleteExcludeValuesList = async listName => {
  try {
    let response = await axiosInstance.delete(`/api/steps/matching/exclusionList/${listName}`);
    if (response.status === 200 && response.data.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error creating list!", message);
    return false;
  }
};

export const getReferencesExcludeValuesList = async listName => {
  return await axiosInstance.get(`/api/steps/matching/exclusionList/${listName}/references`);
};
