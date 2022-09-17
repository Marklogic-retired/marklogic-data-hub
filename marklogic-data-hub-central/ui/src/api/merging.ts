import axios from "axios";

export const updateMergingArtifact = async (merging) => {
  try {
    let response = await axios.put(`/api/steps/merging/${merging.name}`, merging);
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error while saving the merge rule!", message);
    return false;
  }
};

export const getMergingRulesWarnings = async (merging, newMergeRule) => {
  try {
    let filter = `&entityPropertyPath=${newMergeRule.entityPropertyPath}`;
    let warningResponse = await axios.get(`/api/steps/merging/${merging.name}/validate?view=rules${filter}`);
    if (warningResponse.status === 200) {
      return warningResponse;
    } else {
      return null;
    }
  } catch (error) {
    let message = error;
    console.error("Error while updating the merge rule!", message);
    return message;
  }
};

export const getNotifications = async (page?, length?) => {
  try {
    let response = !page ? await axios.get(`/api/steps/merging/notifications`) :
      await axios.get(`/api/steps/merging/notifications`, {params: {start: page, pageLength: length}});
    if (response.status === 200) {
      return response;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error fetching merge notifications!", message);
    return message;
  }
};

export const mergeUris = async (payload) => {
  try {
    let response = await axios.put(`/api/steps/merging/merge`, payload);
    if (response.status === 200) {
      return response;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error while merging URIs!", message);
    return message;
  }
};

export const unmergeUri = async (payload) => {
  try {
    let response = await axios.put(`/api/steps/merging/unmerge?mergeDocumentURI=${payload.mergeDocumentURI}`, payload);
    if (response.status === 200) {
      return response;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error while unmerging URIs!", message);
    return message;
  }
};

export const deleteNotification = async (notificationUri) => {
  try {
    let response = await axios.delete(`/api/steps/merging/notifications?uri=${encodeURIComponent(notificationUri)}`);
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error while unmerging URIs!", message);
    return message;
  }
};