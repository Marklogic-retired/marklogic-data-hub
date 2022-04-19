
import React from "react";

const tooltipsConfig = {
  viewEntities: {
    entities:
      "Representations of high-level business objects in your enterprise.",
    documents:
      "A hierarchy of different types of data organized together, commonly used to represent entities.",
  },
  browseDocuments: {
    createdOn:
      "The date when similar data was unified and merged into a document, also known as harmonization.",
    includingDataHubArtifacts:
      "Artifacts contain the default and user-defined configuration settings for Data Hub, including entity models, flows, step definitions, and steps.",
    // Tooltips for other hub properties in hub-properties.config.js
  },

  exploreSidebar: {
    baseEntities: "Base entities filters will filter out related entities.",
    relatedEntities:
      "Related entity filters only filter on their respective entity type and will not affect base entity results.",
    disabledRelatedEntities: "Related entities are only available in the Graph View"
  },

  graphVis: {
    groupNode: (entityType) => (`Group of ${entityType} records
    Click to expand 3 sample records in this group.
      Double click to expand all records in this group.`),
    singleNode: (entityId) => (`${entityId}
    Click to view details.`),
    singleNodeNoLabel: "Click to view details."
  },
  exploreSettings: {
    exploreSettingsMenuIcon: "Explore Settings",
    disabledManageQueryOption: "There are no saved queries.",
    disabledEntityTypeDisplaySettingsOption: "There are no entities."
  },
  entityTypeDisplaySettings: {
    color: "Select a color to associate it with the entity throughout your project.",
    icon: "Select an icon to associate it with the entity throughout your project.",
    entityLabel: "The record label is the value of the selected property. The record label will display on each record related to the entity.",
    propertiesOnHover: "Properties on Hover are the values of the selected properties. Properties on Hover display in a tooltip when hovering on a record. You can choose multiple properties. If properties are not selected, the value of the identifier will display on hover. If neither properties nor an identifier are selected, the URI will display on hover."
  }
};

export default tooltipsConfig;
