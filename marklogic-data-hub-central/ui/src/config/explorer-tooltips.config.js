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
    color: "Select a color to associate it with the entity type throughout your project.",
    icon: "Select an icon to associate it with nodes for the entity type throughout your project.",
    entityLabel: "The entity label is the value from the property selected that will display on an instance of the associated entity type",
    propertiesOnHover: "Properties on Hover appear in a tooltip when hovering over an instance of the associated entity type. This can be multiple values."
  }
};

export default tooltipsConfig;
