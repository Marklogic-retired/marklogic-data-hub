
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
    disabledRelatedEntities: "Related entities are only available in the Graph View",
    disabledRelatedConcepts: "Related concepts are only available in the Graph View",
    relatedConceptsToggledOff: "Concepts have been toggled off in the Graph View"
  },
  exploreSidebarQueries: {
    saveNewQuery: "Save the current query",
    saveChanges: "Save changes",
    disabledSaveButton: "You cannot save a query because you have not created one. To save a query, start a query by selecting an option below and clicking 'Search'.",
    saveWithoutPermisions: "Save Query: Contact your security administrator to get the roles and permissions to access this functionality"
  },
  manageQueries: {
    disabledExport: "You cannot export your data because there are no results that match your query. Please try another query."
  },
  tabularView: {
    queryExportDisabled: "You cannot export your data because you have not selected a base entity. Use the drop-down menu to select a specific base entity.",
    queryExportUnautorized: "Export query: Contact your security administrator to get the roles and permissions to access this functionality",
    columnSelectorDisabled: "You cannot choose columns to show because you have more than one base entity selected. Use the drop-down menu to select a specific base entity.",
  },
  graphViewTooltips: {
    relationshipLabel: "A relationship name identifies a relationship between two two entity types. To add or edit relationship names, go to the Model screen.",
    concept: "A concept is simply an abstract subject within a vocabulary or an ontology.",
    physicsAnimation: "Toggle the switch to remove all automatic movement between nodes. When this button is switched to 'OFF', the nodes become still and must be moved manually."
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
    disabledManageQueryOption: "You cannot manage your queries until you save them. To manage your queries, save them using the 'Save Query' icon.",
    disabledEntityTypeDisplaySettingsOption: "There are no entities."
  },
  entityTypeDisplaySettings: {
    color: "Select a color to associate it with the entity throughout your project.",
    icon: "Select an icon to associate it with the entity throughout your project.",
    entityLabel: "The record label is the value of the selected property. The record label will display on each record related to the entity.",
    propertiesOnHover: "Properties on Hover are the values of the selected properties. Properties on Hover display in a tooltip when hovering on a record. You can choose multiple properties. If properties are not selected, the value of the identifier will display on hover. If neither properties nor an identifier are selected, the URI will display on hover."
  },
  //ToDo: To change when finished the task DHFPROD-8627
  conceptDisplaySettings: {
    color: "Select a color to associate it with the concept throughout your project.",
    icon: "Select an icon to associate it with the concept throughout your project."
  }
};

export default tooltipsConfig;
