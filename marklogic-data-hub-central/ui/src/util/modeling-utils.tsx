import {hubCentralConfig} from "../types/modeling-types";

export const entitiesConfigExist = (hubCentralConfig: hubCentralConfig) => {
  //return !hubCentralConfig?.modeling?.entities && !hubCentralConfig?.modeling?.concepts ? false : (!Object.keys(hubCentralConfig?.modeling?.entities).length && !Object.keys(hubCentralConfig?.modeling?.concepts).length ? false : true);
  return (
    (!!hubCentralConfig?.modeling?.entities && Object.keys(hubCentralConfig?.modeling?.entities).length > 0) ||
    (!!hubCentralConfig?.modeling?.concepts && Object.keys(hubCentralConfig?.modeling?.concepts).length > 0)
  );
};

/**
 * Convert an array of entities that each contain the property entityName to an object with that property like key
 *
 * @param entities
 * @returns models
 */
export const convertArrayOfEntitiesToObject = (entities: any[]) => {
  let models: any = {};
  entities.forEach(model => {
    models[model.entityName] = model;
  });
  return models;
};

export const colorOfNode = (nodeName, modelCategory, hubCentralConfig: hubCentralConfig) => {
  return hubCentralConfig.modeling[modelCategory][nodeName]["color"];
};

export const colorExistsForNode = (nodeName, isConcept, hubCentralConfig: hubCentralConfig) => {
  let nodeColor = !isConcept
    ? hubCentralConfig?.modeling?.entities[nodeName]?.color
    : hubCentralConfig?.modeling?.concepts[nodeName]?.color;
  return !nodeColor ? false : true;
};

export const iconExistsForNode = (nodeName, isConcept, hubCentralConfig: hubCentralConfig) => {
  let nodeIcon = !isConcept
    ? hubCentralConfig?.modeling?.entities[nodeName]?.icon
    : hubCentralConfig?.modeling?.concepts[nodeName]?.icon;
  return !nodeIcon ? false : true;
};

export const getCategoryWithinModel = isConcept => {
  return !isConcept ? "entities" : "concepts";
};
