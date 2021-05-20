import {Modal} from "antd";
import React, {useContext} from "react";
import axios from "axios";
import {CurationContext} from "../util/curation-context";
import {createStep, getStep, updateStep} from "./steps";
import styles from "../components/entities/entity-tiles.module.scss";

const SetOpenStep = (mapping: any) => {
  const {setOpenStep} = useContext(CurationContext);
  setOpenStep({name: mapping.name, entityType: mapping.targetEntityType});
};

export const createMappingArtifact = async (mapping) => {
  try {
    let response = await createStep(mapping.name, "mapping", mapping);
    if (response.status === 200) {
      SetOpenStep(mapping);
      return {code: response.status};
    } else {
      return {code: response.status};
    }
  } catch (error) {
    let message = error.response.data.message;
    console.error("Error creating mapping", message);
    message.indexOf(mapping.name) > -1 ? Modal.error({
      content: <div className={styles.errorModal}><p aria-label="duplicate-step-error">Unable to create mapping step. A mapping step with the name <b>{mapping.name}</b> already exists.</p></div>,
      okText: <div aria-label="OK">OK</div>
    }) : Modal.error({
      content: message
    });

  }
};

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