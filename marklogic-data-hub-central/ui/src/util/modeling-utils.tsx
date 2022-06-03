import {hubCentralConfig} from "../types/modeling-types";

export const entitiesConfigExist = (hubCentralConfig: hubCentralConfig) => {
  return !hubCentralConfig?.modeling?.entities ? false : (!Object.keys(hubCentralConfig?.modeling?.entities).length ? false : true);
};

/**
 * Convert an array of entities that each contain the property entityName to an object with that property like key
 *
 * @param entities
 * @returns models
 */
export const convertArrayOfEntitiesToObject = (entities: any[]) => {
  let models:any = {};
  entities.forEach(model => {
    models[model.entityName] = model;
  });
  return models;
};