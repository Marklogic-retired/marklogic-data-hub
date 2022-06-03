import {themeColors} from "./themes.config";
import {Definition} from "../types/modeling-types";

export const exploreSidebar = {
  MINIMUM_ENTITIES: 5,
  entitySpecificSidebar: {
    integers: ["int", "integer", "short", "long"],
    decimals: ["decimal", "double", "float"]
  }
}

export const graphViewConfig = {
  groupNodeBadgeColor: themeColors.info,
  groupNodeTableView: {
    defaultPageProperties: {
      start: 1,
      pageNumber: 1,
      pageLength: 20,
      pageSize: 20,
      maxRowsPerPage: 100,
    }
  }
}

export const defaultIcon = "FaShapes";
export const defaultConceptIcon = "FaLightbulb";

export const expandThresholdExceededWarning = (entityType) => (`This group of ${entityType} records cannot be fully expanded. Expanding this group will exceed the maximum threshold the graph can display. To view the records in this group, see the following table.`);

export const defaultPaginationOptions = {
  start: 1,
  pageNumber: 1,
  pageLength: 20,
  pageSize: 20
};

export const defaultEntityDefinition: Definition = {
  name: "",
  properties: []
};