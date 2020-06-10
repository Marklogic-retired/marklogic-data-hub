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
    'processors': 'Custom modules that perform additional processes after the core step processes are completed and before the results are saved.',
    'customHook': 'A custom module that performs additional processes in its own transaction before or after the core step transaction. Results are saved within a transaction.',
    /* The following are for *Custom* Tooltips. */
    'sourceDatabase': 'The database where the input data is read from.',
    'targetDatabase': 'The database where to store the processed data.',
    'options': 'Key-value pairs to pass as parameters to the custom module.',
    'customModuleURI': "The path to your custom step module.",
    'batchSize' : "The maximum number of items to process in a batch."
}

const NewFlowTooltips = {
    'name': 'The name of this flow definition.',
    'description': 'The description of this flow definition.'
}

const NewLoadTooltips = {
    'name': 'The name of this data load configuration.',
    'description': 'The description of this data load configuration.',
    'files' : 'Click *Upload* to select the source files. The total size of the files must be 100MB or less.',
    'sourceFormat': 'The format of the source files to load.',
    'fieldSeparator': 'The delimiter in source files. Required if *Source Format* is *Delimited Text*.',
    'outputURIPrefix': 'The prefix you want for the URIs of the loaded records. Example: If your prefix is /rawData/ and you load a file called customer1.json, the URI of the loaded record becomes /rawData/customer1.json.'
}

const AdvLoadTooltips = {
    'targetDatabase': 'The database where to store the processed data. For loading, the default is data-hub-STAGING.',
    'mlcpCommand': 'To load files using MLCP, copy and paste this entire code to a command line. This code passes your step settings as parameter values to MLCP. Note: MLCP and Data Hub generate different URIs for the same delimited file.'
}

const NewMapTooltips = {
    'name':'The name of this mapping configuration.',
    'description':'The description of this mapping configuration.',
    'sourceQuery':'The collection or CTS query that selects the source data to process in this configuration.',
}

const AdvMapTooltips = {
    'sourceDatabase': 'The database where the input data is read from. For mapping, the default is data-hub-STAGING.',
    'targetDatabase': 'The database where to store the processed data. For mapping, the default is data-hub-FINAL.',
    'provGranularity': 'The level of detail logged for provenance. Choose *coarse* for the default level or *off* for no provenance logging.',
}

const NewMatchTooltips = {
    'name': 'The name of this matching configuration.',	    'sourceDatabase': 'The database where the input data is read from. Must be the same as the Matching Step *Source Database*.',
    'description': 'The description of this matching configuration.',	    'targetDatabase': 'The database where to store the processed data. Must be the same as the Matching Step *Source Database*.',
    'sourceQuery' : 'The collection or CTS query that selects the source data to process in this configuration.',
}

const AdvMatchTooltips = {
    'sourceDatabase': 'The database where the input data is read from. For matching, the default is data-hub-FINAL.',
    'targetDatabase': 'The database where to store the processed data. Must be the same as the *Source Database*.',
    'provGranularity': 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.',
}

const NewMergeTooltips = {
    'timestampPath': 'The field to use to determine which values to include in the merged property, based on their recency.'
}

const AdvMergeTooltips = {
    'sourceDatabase': 'The database where the input data is read from. Must be the same as the Matching Step *Source Database*.',
    'targetDatabase': 'The database where to store the processed data. Must be the same as the Matching Step *Source Database*.',
    'provGranularity': 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.',
}

const RunToolTips =  {
  'ingestionStep' : 'Run this step to select and ingest files, up to a total of 100MB.',
  'otherSteps' : 'Run this step.'
}

const NewCustomLoadTooltips = {}

const AdvCustomLoadTooltips = {}

const NewCustomMapTooltips = {}

const AdvCustomMapTooltips = {}

const NewCustomMatchTooltips = {}

const AdvCustomMatchTooltips = {}

const NewCustomMergeTooltips = {}

const AdvCustomMergeTooltips = {}

const NewCustomOtherTooltips = {}

const AdvCustomOtherTooltips = {}

const ModelingTooltips = {
  entityTypeName: 'Click to view or edit settings for this entity type.',
  addNewEntity: 'Click here to add a new entity type.',
  instanceNumber: 'Click to navigate to the Explorer tile showing all instances of this entity type.',
  lastProcessed: 'Click to navigate to the Explorer tile showing all instances of that enttiy processed at the time.',
  nameRegex: 'Names must start with a letter, and can contain letters, numbers, hyphens, and underscores.',
  entityDescription: 'Description for the entity.',
  saveIcon: 'Save changes to this entity type.',
  revertIcon: 'Discard changes made to this entity type since the last Save operation.',
  identifier: 'Uniquely identifies each instance of this type. Restricted to only one property per entity type.',
  multiple: 'Allows an array of values.',
  pii: 'Personally identifiable information, or data this is sensitive in that it can identify a particular person and can be used fraudulent purposes.',
  sort: 'Enables display in ascending or descending order.',
  facet: 'Use when searching, for dividing values of properties into counts, aggregating, grouping, and more.',
  advancedSearch: 'Enables wildcard search, search suggestions, and type-ahead.',
  addStructuredProperty: 'Click to add properties within this structured property.',
  entityEditedAlert: 'You have edited some of the entity types and/or properties. This information has not been saved. '
  + 'Be sure to Save your changes (by entity type or all together) to make the changes which may include updating indexes. '
  + 'The Save operation will make live changes that may impact everyone else using Hub Central right now, '
  + 'so we recommend that as you make changes, you notify your teammates ahead of time.',
  noWriteAccess: 'Contact your security administrator to get the roles and permissions required to access this functionality.',
  addProperty: 'Click to add properties to this entity type.'
}

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
    RunToolTips
}
