import {hubCentralConfig} from "../types/modeling-types";

export const entitiesConfigExist = (hubCentralConfig: hubCentralConfig) => {
  return !hubCentralConfig?.modeling?.entities ? false : (!Object.keys(hubCentralConfig?.modeling?.entities).length ? false : true);
};