import axios from "axios";

export const updateMatchingArtifact = async (matching) => {
  try {
    let response = await axios.put(`/api/steps/matching/${matching.name}`, matching);
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error while updating the mapping!", message);
    return false;
  }
};

export const calculateMatchingActivity = async (matchStepName) => {
  try {
    let response = await axios.get(`/api/steps/matching/${matchStepName}/calculateMatchingActivity`);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    let message = error;
    console.error("Error while fetching the match activity!", message);
  }
};
