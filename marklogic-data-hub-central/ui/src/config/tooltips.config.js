const AdvancedSettings = {
    'name': 'The name of this step definition.',
    'description': 'The description of this step definition.',
    'sourceQuery' : 'The collection tag or CTS query that selects the source data to process in this step.',
    'targetFormat': 'The format of the records in the target database.',
    'additionalCollections': 'The collection tags to add to the default tags assigned to the processed record.',
    'targetPermissions': 'A comma-delimited string that defines permissions required to access the processed record. ' +
    'The string must be in the format role,capability,role,capability,..., where capability can be read, insert, update, or execute.',
    'headers': 'A JSON object that represents additional metadata to add to the header section of the envelope of each record.',
    'provGranularity': 'The level of detail logged for provenance. Choose *coarse* for the default level or *off* for no provenance logging.',
    'validateEntity': 'Choose whether to validate each document against the entity type definition and how to handle documents with errors.',
    'processors': 'Custom modules that perform additional processes after the core step processes are completed and before the results are saved.',
    'customHook': 'A custom module that performs additional processes in its own transaction before or after the core step transaction. Results are saved within a transaction.',
    /* The following are for *Custom* Tooltips. */
    'sourceDatabase': 'The database where the input data is read from.',
    'targetDatabase': 'The database where to store the processed data.',
    'options': 'Key-value pairs to pass as parameters to the custom module.',
    'customModuleURI': "The path to your custom step module.",
    'batchSize' : "The maximum number of items to process in a batch."
};

const NewFlowTooltips = {
    'name': 'The name of this flow definition.',
    'description': 'The description of this flow definition.'
};

const NewLoadTooltips = {
    'name': 'The name of this data load configuration.',
    'description': 'The description of this data load configuration.',
    'files' : 'Click *Upload* to select the source files. The total size of the files must be 100MB or less.',
    'sourceFormat': 'The format of the source files to load.',
    'targetFormat': 'The format of the processed record.',
    'fieldSeparator': 'The delimiter in source files. Required if *Source Format* is *Delimited Text*.',
    'outputURIPrefix': 'The prefix you want for the URIs of the loaded records. Example: If your prefix is /rawData/ and you load a file called customer1.json, the URI of the loaded record becomes /rawData/customer1.json.'
};

const AdvLoadTooltips = {
    'targetDatabase': 'The database where to store the processed data. For loading, the default is data-hub-STAGING.',
    'mlcpCommand': 'To load files using MLCP, copy and paste this entire code to a command line. This code passes your step settings as parameter values to MLCP. Note: MLCP and Data Hub generate different URIs for the same delimited file.'
};

const NewMapTooltips = {
    'name':'The name of this mapping configuration.',
    'description':'The description of this mapping configuration.',
    'sourceQuery':'The collection or CTS query that selects the source data to process in this configuration.',
};

const AdvMapTooltips = {
    'sourceDatabase': 'The database where the input data is read from. For mapping, the default is data-hub-STAGING.',
    'targetDatabase': 'The database where to store the processed data. For mapping, the default is data-hub-FINAL.',
    'provGranularity': 'The level of detail logged for provenance. Choose *coarse* for the default level or *off* for no provenance logging.',
 };

const AdvCustomTooltips = {
    'additionalSettings': 'A JSON object containing key-value pairs to pass to the custom step module.',
    'settings': 'Settings',
    'viewCustom': 'View',
};

const NewMatchTooltips = {
    'name': 'The name of this matching configuration.',
    'sourceDatabase': 'The database where the input data is read from. Must be the same as the Matching Step *Source Database*.',
    'description': 'The description of this matching configuration.',	    'targetDatabase': 'The database where to store the processed data. Must be the same as the Matching Step *Source Database*.',
    'sourceQuery' : 'The collection or CTS query that selects the source data to process in this configuration.',
};

const AdvMatchTooltips = {
    'sourceDatabase': 'The database where the input data is read from. For matching, the default is data-hub-FINAL.',
    'targetDatabase': 'The database where to store the processed data. Must be the same as the *Source Database*.',
    'provGranularity': 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.',
};

const NewCustomTooltips = {
  'name':'The name of this custom configuration.',
  'description':'The description of this custom configuration.',
  'sourceQuery':'The collection or CTS query that selects the source data to process in this configuration.',
};

const NewMergeTooltips = {
    'timestampPath': 'The field to use to determine which values to include in the merged property, based on their recency.'
};

const AdvMergeTooltips = {
    'sourceDatabase': 'The database where the input data is read from. Must be the same as the Matching Step *Source Database*.',
    'targetDatabase': 'The database where to store the processed data. Must be the same as the Matching Step *Source Database*.',
    'provGranularity': 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.',
};

const RunToolTips =  {
  'ingestionStep' : 'Run this step to select and ingest files, up to a total of 100MB.',
  'otherSteps' : 'Run this step.',
  'removeStep' : 'Remove step from flow.',
  'createFlow' : 'Create a new flow.',
  'addStep' : 'Add step to flow.'
};

const NewCustomLoadTooltips = {};

const AdvCustomLoadTooltips = {};

const NewCustomMapTooltips = {};

const AdvCustomMapTooltips = {};

const NewCustomMatchTooltips = {};

const AdvCustomMatchTooltips = {};

const NewCustomMergeTooltips = {};

const AdvCustomMergeTooltips = {};

const NewCustomOtherTooltips = {};

const AdvCustomOtherTooltips = {};

const ModelingTooltips = {
  entityTypeName: 'Click to view or edit settings for this entity type.',
  addNewEntity: 'Click here to add a new entity type.',
  instanceNumber: 'Click to navigate to the Explorer tile showing all instances of this entity type.',
  lastProcessed: 'Click to navigate to the Explorer tile showing all instances of that enttiy processed at the time.',
  nameRegex: 'Names must start with a letter, and can contain letters, numbers, hyphens, and underscores.',
  entityDescription: 'Description for the entity.',
  saveIcon: 'Save changes to this entity type.',
  revertIcon: 'Discard changes made to this entity type since the last Save operation.',
  deleteIcon: 'Delete entity.',
  identifier: 'Uniquely identifies each instance of this type. Restricted to only one property per entity type.',
  multiple: 'Allows an array of values.',
  pii: "Indicates that the property's value must be safeguarded and handled according to Personally Identifiable Information (PII) protection rules and policies.",
  sort: 'Enables display in ascending or descending order.',
  facet: 'Use when searching, for dividing values of properties into counts, aggregating, grouping, and more.',
  wildcard: 'Enables wildcard search.',
  addStructuredProperty: 'Click to add properties within this structured property.',
  entityEditedAlert: "You have pending changes for one or more entity types. To apply these changes to your Data Hub, either save the modified entity types or select 'Save All'.",
  noWriteAccess: 'Contact your security administrator for access.',
  addProperty: 'Click to add properties to this entity type.',
  saveEntityConfirm: 'You have unsaved changes. Saving changes to the entity model will impact features that depend on the entity model and may also cause some data to be reindexed. Features that depend on the data being reindexed may not work until the reindexing is complete.'
}

const SecurityTooltips = {
  missingPermission: 'Contact your security administrator for access.'
};

export {
    AdvancedSettings,
    NewFlowTooltips,
    NewLoadTooltips,
    AdvLoadTooltips,
    NewMapTooltips,
    AdvMapTooltips,
    NewMatchTooltips,
    AdvMatchTooltips,
    NewMergeTooltips,
    AdvMergeTooltips,
    ModelingTooltips,
    RunToolTips,
    NewCustomTooltips,
    AdvCustomTooltips,
    SecurityTooltips
};
