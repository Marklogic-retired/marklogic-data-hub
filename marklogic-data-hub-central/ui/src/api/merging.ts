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

export const getMergingRulesWarnings = async (merging) => {
  try {
    let warningResponse = await axios.get(`/api/steps/merging/${merging.name}/validate?view=rules`);
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
