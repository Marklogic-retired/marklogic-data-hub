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
  },
};

export default tooltipsConfig;
