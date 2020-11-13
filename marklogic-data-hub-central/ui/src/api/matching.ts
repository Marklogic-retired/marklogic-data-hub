import axios from "axios";

export const updateMatchingArtifact = async (matching) => {
  try {
    let response = await axios.post(`/api/steps/matching/${matching.name}`, matching);
    if (response.status === 200) {
      return true;
    } else {
        return false;
    }
  } catch (error) {
    let message = error;
    console.error('Error while updating the mapping!', message);
    return false;
  }
};