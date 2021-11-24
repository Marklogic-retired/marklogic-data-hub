import axios from "axios";
import {getStep, updateStep} from "./steps";

export const updateMappingArtifact = async (mapping) => {
  try {
    let response = await updateStep(mapping.name, "mapping", mapping);
    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    let message = error;
    console.error("Error updating mapping", message);
    return false;
  }
};

export const getMappingArtifactByMapName = async (entityTypeId, mapName) => {
  try {
    let response = await getStep(mapName, "mapping");
    if (response.status === 200) {
      let mapArtifacts = response.data;

      if (mapArtifacts.targetEntityType === entityTypeId) {
        return mapArtifacts;
      }

    }
  } catch (error) {
    let message = error;
    console.error("Error getting mapping", message);
  }
};

export const getMappingFunctions = async () => {
  try {
    let response = await axios.get(`/api/artifacts/mapping/functions`);

    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error getting functions", message);
  }
};

export const getMappingRefs = async (stepName) => {
  try {
    let response = await axios.get(`/api/steps/mapping/${stepName}/references`);
    if (response && response.status === 200) {
      return response;
    }
  } catch (error) {
    let message = error;
    console.error("Error getting references", message);
  }
};

export const getMappingArtifactByStepName = async (stepName) => {
  try {
    let response = await getStep(stepName, "mapping");
    if (response.status === 200) {
      let mapArtifacts = response.data;
      return mapArtifacts;
    }
  } catch (error) {
    let message = error;
    console.error("Error getting mapping", message);
  }
};