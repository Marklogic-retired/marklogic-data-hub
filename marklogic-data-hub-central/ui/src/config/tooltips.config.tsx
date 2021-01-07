import React from "react";

/* --- MODELING --- */

const ModelingIntros = {
  main: 'The entity model is comprised of entity types that describe and standardize your data. You need these entity types to curate your data.'
};

const ModelingTooltips = {
  /* Buttons */
  addNewEntity: 'Add a new entity type.',
  saveAll: 'Save all changes to all entity types.',
  revertAll: 'Discard unsaved changes made to all entity types.',
  addProperty: 'Add properties to this entity type.',

  /* Values made into links */
  entityTypeName: 'Click to view or edit settings for this entity type.',
  instanceNumber: 'Click to view all instances of this entity type.',
  lastProcessed: 'Click to view all instances of this entity type that were processed by the job that ended at this time.',
  entityPropertyName:  'Click to view or edit settings for this entity property.',

  /* Icons for entity types */
  saveIcon: 'Save changes to this entity type.',
  revertIcon: 'Discard unsaved changes to this entity type.',
  deleteIcon: 'Delete this entity type.',

  /* Icons for entity properties */
  addStructuredProperty: 'Add a property to this structured property.',
  deleteProperty: 'Delete this property.',

  /* Yes/No in modal; column headers in property list */
  identifier: 'If enabled, uniquely identifies each instance of this entity type. Restricted to only one property per entity type.',
  multiple: 'If enabled, the property holds an array of values.',
  sort: 'If enabled, the property can be used to sort the results of queries and filters in ascending or descending order.',
  facet: 'If enabled, the property can be used to filter, search for, and categorize documents.',
  pii: 'If enabled, the property\'s value must be safeguarded and handled according to Personally Identifiable Information (PII) protection rules and policies.',
  wildcard: 'If enabled, wildcards can be used to search values of the property.',

  /* Text fields */
  nameEntityType: 'The name of this entity type. ' +
    'Names must start with a letter and can contain letters, numbers, hyphens, and underscores.',  /* intended dupe: all names */
  descriptionEntityType: 'A description of this entity type.',
  nameEntityProperty: 'The name of this entity property. ' +
    'Names must start with a letter and can contain letters, numbers, hyphens, and underscores.',  /* intended dupe: all names */
  descriptionEntityProperty: 'A description of this entity property.',


  /* TO BE DEPRECATED. Use ModelingTooltips.nameEntityType. */
  nameRegex: 'Names must start with a letter and can contain letters, numbers, hyphens, and underscores.',

  /* TO BE DEPRECATED. Use ModelingTooltips.descriptionEntityType. */
  entityDescription: 'A description of this entity type.',

  /* TO BE DEPRECATED. Use ModelingMessages.entityEditedAlert. */
  entityEditedAlert: 'You have unsaved changes for one or more entity types. You can individually save each modified entity type or save all.',

  /* TO BE DEPRECATED. Use ModelingMessages.saveEntityConfirm. */
  saveEntityConfirm: 'You have unsaved changes. Saving changes to the entity model could impact features that depend on it or on data that require reindexing due to the changes.',

  /* TO BE DEPRECATED. Use SecurityTooltips.missingPermission. */
  noWriteAccess: 'Contact your security administrator for access.'
};

const ModelingPlaceholders = {
  nameEntityType: 'Enter the name.',  /* intended dupe (value only): common */
  descriptionEntityType: 'Enter the description.',  /* intended dupe (value only): common */
  nameEntityProperty: 'Enter the name.',  /* intended dupe (value only): common */
  descriptionEntityProperty: 'Enter the description.'  /* intended dupe (value only): common */
};

const ModelingMessages = {
  entityEditedAlert: 'You have unsaved changes for one or more entity types. You can individually save each modified entity type or save all.',
  saveEntityConfirm: 'You have unsaved changes. Saving changes to the entity model could impact features that depend on it or on data that require reindexing due to the changes.'
};


/* --- FLOW --- */

const FlowIntros = {
};

const FlowTooltips = {
  name: 'The name of this flow configuration. This cannot be changed after the flow is created.',
  nameField: 'The flow name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the flow is created.',
  description: 'A description of this flow configuration.'
};

const FlowPlaceholders = {
  name: 'Enter the flow name.',
  description: 'Enter the flow description.'
};

const FlowMessages = {
};


/* --- STEPS - COMMON --- */

const CommonStepTooltips = {
  name: 'The name of this step definition.',
  description: 'A description of this step definition.',
  sourceQuery: 'The collection tag or CTS query that selects the source data to process in this step.',
  sourceDatabase: 'The database where the input data is read from.',
  targetDatabase: 'The database where to store the processed data.',
  targetFormat: 'The format of the records in the target database.',
  targetPermissions: (
    <span>A comma-delimited string that defines permissions required to access the processed record. The string must be in the format 
      <span style={{fontFamily: "monospace"}}> role,capability,role,capability,...</span>, where 
      <i> capability</i> can be <span style={{fontFamily: "monospace"}}>read</span>,
      <span style={{fontFamily: "monospace"}}> insert</span>, 
      <span style={{fontFamily: "monospace"}}> update</span>, or
      <span style={{fontFamily: "monospace"}}> execute</span>.</span>
      ),
  headers: 'A JSON object that represents additional metadata to add to the header section of the envelope of each record.',
  additionalCollections: 'The collection tags to add to the default tags assigned to the processed record.',
  provGranularity: 'The level of detail logged for provenance. Choose *coarse* for the default level or *off* for no provenance logging.',
  validateEntity: 'Choose whether to validate each document against the entity type definition and how to handle documents with errors.',
  batchSize : 'The maximum number of items to process in a batch.',
  processors: 'Custom modules that perform additional processes after the core step processes are completed and before the results are saved.',
  customHook: 'A custom module that performs additional processes in its own transaction before or after the core step transaction. Results are saved within a transaction.',
  options: 'Key-value pairs to pass as parameters to the custom module.',
  customModuleURI: 'The path to your custom step module.'
};

/* Note: Some of the following are intentionally duplicated in other *Placeholders constants. */
const CommonStepPlaceholders = {
  name: 'Enter the name.',
  description: 'Enter the definition.',
  sourceQuery: 'Enter a collection tag or CTS query.',
  sourceDatabase: 'Choose where to get the data.',
  targetDatabase: 'Choose where to store the processed data.',
  targetFormat: 'Choose the format for the resulting documents.',
  targetPermissions: 'Enter the permissions.',
  headers: 'Enter additional header metadata.',
  additionalCollections: 'Enter additional collection tags.',
  provGranularity: 'Choose the level of provenance detail.',
  validateEntity: 'Choose how to handle documents with errors.',
  batchSize : 'Enter the batch size.',
  processors: 'Enter the array of processor settings.',
  customHook: 'Enter the custom hook settings.',
  options: 'Enter the parameters for the custom module.',
  customModuleURI: 'Enter the path to the custom module.'
};

const CommonStepMessages = {
};


/* --- STEPS - LOADING --- */

const LoadingStepIntros = {
};

const LoadingStepTooltips = {
  name: 'The name of this loading step configuration. This cannot be changed after the step is created.',
  nameField: 'The step name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the step is created.',
  description: 'A description of this loading step configuration.',
  files: 'Click *Upload* to select the source files. The total size of the files must be 100MB or less.',
  sourceFormat: 'The format of the source files to load.',
  targetDatabase: 'The database where to store the processed data. For loading, the default is data-hub-STAGING.',
  targetFormat: 'The format of the processed record.',
  sourceName: 'The name of the source.',
  sourceType: 'The type of the source.',
  fieldSeparator: 'The delimiter in source files. Required if *Source Format* is *Delimited Text*.',
  outputURIPrefix: 'The prefix you want for the URIs of the loaded records. Example: If your prefix is /rawData/ and you load a file called customer1.json, the URI of the loaded record becomes /rawData/customer1.json.',
  mlcpCommand: 'To load files using MLCP, copy and paste this entire code to a command line. This code passes your step settings as parameter values to MLCP. Note: MLCP and Data Hub generate different URIs for the same delimited file.'
};

const LoadingStepPlaceholders = {
  name: 'Enter the name.',  /* intended dupe: common */
  description: 'Enter the description.',  /* intended dupe: common */
  sourceFormat: 'Choose the format of the source files.',
  targetDatabase: 'Choose where to store the processed data.',  /* intended dupe: common */
  targetFormat: 'Choose the format for the resulting documents.',  /* intended dupe: common */
  sourceName: 'Enter a name for the source.',
  sourceType: 'Enter the type of the source.',
  fieldSeparator: 'Choose the delimiter.',
  outputURIPrefix: 'Enter the URI prefix for the loaded records.'
    /* Can we use an example like this?
    '/myUriPrefix/'
    */
};

const LoadingStepMessages = {
};


/* --- STEPS - MAPPING --- */

const MappingStepIntros = {
};

const MappingStepTooltips = {
  name: 'The name of this mapping step configuration. This cannot be changed after the step is created.',
  nameField: 'The step name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the step is created.',
  description: 'A description of this mapping step configuration.',
  sourceQuery: 'The collection or CTS query that selects the source data to process in this configuration.',
  sourceDatabase: 'The database where the input data is read from. For mapping, the default is data-hub-STAGING.',
  targetDatabase: 'The database where to store the processed data. For mapping, the default is data-hub-FINAL.',
  provGranularity: 'The level of detail logged for provenance. Choose *coarse* for the default level or *off* for no provenance logging.'
};

const MappingStepPlaceholders = {
  name: 'Enter the name.',  /* intended dupe: common */
  description: 'Enter the description.',  /* intended dupe: common */
  sourceQuery: 'Enter a collection tag or CTS query.',  /* intended dupe: common */
  sourceDatabase: 'Choose where to get the data.',  /* intended dupe: common */
  targetDatabase: 'Choose where to store the processed data.',  /* intended dupe: common */
  provGranularity: 'Choose the level of provenance detail.'  /* intended dupe: common */
};

const MappingStepMessages = {
};


/* --- STEPS - MATCHING --- */

const MatchingStepIntros = {
  main: 'The Matching step defines the criteria for comparing documents, as well as the actions to take based on the degree of similarity, which is measured as weights.',
  threshold: 'A match threshold specifies what action is taken when the total match weight is within a defined range. Create a threshold, select the action, then move the node along the slider to specify the minimum weight required to trigger the action; the maximum is defined by the next higher node or the end of the scale.',
  ruleset: 'A match ruleset defines the criteria for what is considered a match. Create the ruleset, select the properties to compare, then move the node along the slider to specify its relative importance or weight.',
  reviewcombos: 'To fine-tune which ruleset combinations trigger a specific action, adjust the positions of the thresholds and the rulesets along their respective sliders.',
  testmatching: 'Test your thresholds and rulesets on a set of sample documents. The documents are not modified by this test.'
}

const MatchingStepTooltips = {
  name: 'The name of this matching step configuration. This cannot be changed after the step is created.',
  nameField: 'The step name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the step is created.',
  description: 'A description of this matching configuration.',
  sourceQuery: 'The collection or CTS query that selects the source data to process in this configuration.',
  sourceDatabase: 'The database where the input data is read from. For matching, the default is data-hub-FINAL.',
  targetDatabase: 'The database where to store the processed data. Must be the same as the Matching Step *Source Database*.',
  filter: 'A node in the thesaurus to use as a filter. Example: <thsr:qualifier>birds</thsr:qualifier>',
  collation: 'The URI for a collation, which specifies the order for sorting strings.',
  function: 'The function to run if this action definition is selected.',
  uri: 'The path to the module that contains the function.',  /* intended dupe: match-merge */
  namespace: 'The namespace of the module that contains the function.',  /* intended dupe: match-merge */
  distanceThreshold: 'The threshold below which the phonetic difference (distance) between two strings is considered insignificant; i.e., the strings are similar to each other.',
  dictionaryUri: 'The location of the phonetic dictionary that is stored in a database and used when comparing words phonetically.',
  thesaurusUri: 'The location of the thesaurus that is stored in a MarkLogic Server database and used to determine synonyms.',
  provGranularity: 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.'
};

const MatchingStepPlaceholders = {
  name: 'Enter the name.',  /* intended dupe: common */
  description: 'Enter the description.',  /* intended dupe: common */
  sourceQuery: 'Enter a collection tag or CTS query.',  /* intended dupe: common */
  sourceDatabase: 'Choose where to get the data.',  /* intended dupe: common */
  targetDatabase: 'Choose where to store the processed data.',  /* intended dupe: common */
  filter: 'Enter the thesaurus node to use as filter.',
  collation: 'Enter the URI for collation to use as sorting order.',
  function: 'Enter the function to run.',  /* intended dupe: match-merge */
  uri: 'Enter the path to the module with the function.',  /* intended dupe: match-merge */
  namespace: 'Enter the namespace of the module.',  /* intended dupe: match-merge */
  distanceThreshold: 'Enter the threshold for phonetic difference.',
  dictionaryUri: 'Enter the location of the phonetic dictionary.',
  thesaurusUri: 'Enter the location of the thesaurus.',
  provGranularity: 'Choose the level of provenance detail.'  /* intended dupe: common */
};

const MatchingStepMessages = {
};


/* --- STEPS - MERGING --- */

const MergingStepIntros = {
  main: 'The Merging step defines how to combine documents that the Matching step identified as similar.',
  strategy: 'A merge strategy is a predefined set of merge options that you can name and reuse.',
  ruleset: 'A merge ruleset is a set of merge options that define how similar documents are combined based on certain conditions.'
}

const MergingStepTooltips = {
  name: 'The name of this merging step configuration. This cannot be changed after the step is created.',
  description: 'A description of this merging step configuration.',
  timestampPath: 'The path to a timestamp field within the record. This field is used to determine which values to include in the merged property, based on their recency.',
  sourceDatabase: 'The database where the input data is read from. Must be the same as the Matching Step *Source Database*.',
  targetDatabase: 'The database where to store the processed data. Must be the same as the Matching Step *Source Database*.',
  provGranularity: 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.',

  /* For strategies */
  nameStrategy: 'The name of this strategy.',

  /* For rulesets */
  function: 'The merge function to run.',
  uri: 'The path to the module that contains the function.',  /* intended dupe: match-merge */
  namespace: 'The namespace of the module that contains the function.',  /* intended dupe: match-merge */
  rulesetStrategy: 'The predefined strategy to use for this ruleset.',
  maxValues: 'The maximum number of values to allow in the merged property. The default is 99.',
  maxSources: 'The maximum number of data sources from which to get values to merge. To copy values from a single source, set to 1.',
  priorityOrder: 'The relative importance of each metadata when merging documents.'
};

const MergingStepPlaceholders = {
  name: 'Enter the name.',  /* intended dupe: common */
  description: 'Enter the description.',  /* intended dupe: common */
  timestampPath: 'Enter the path to a timestamp field.',
  sourceDatabase: 'Choose where to get the data.',  /* intended dupe: common */
  targetDatabase: 'Choose where to store the processed data.',  /* intended dupe: common */
  provGranularity: 'Choose the level of provenance detail.',  /* intended dupe: common */

  /* For strategies */
  nameStrategy: 'Enter the name.',  /* intended dupe (value only): common */

  /* For rulesets: */
  function: 'Enter the function to run.',  /* intended dupe: match-merge */
  uri: 'Enter the path to the module with the function.',  /* intended dupe: match-merge */
  namespace: 'Enter the namespace of the module.',  /* intended dupe: match-merge */
  rulesetStrategy: 'Choose the strategy.',
  maxValues: 'Enter the max number of values.',
  maxSources: 'Enter the max number of data sources.',
};

const MergingStepMessages = {
  delete: 'Strategies that are used by a merge rule cannot be deleted.'
}


/* --- STEPS - CUSTOM --- */

const CustomStepIntros = {
};

const CustomStepTooltips = {
  name: 'The name of this custom step configuration. This cannot be changed after the step is created.',
  nameField: 'The step name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the step is created.',
  description: 'A description of this custom step configuration.',
  sourceQuery: 'The collection or CTS query that selects the source data to process in this configuration.',
  additionalSettings: 'A JSON object containing key-value pairs to pass to the custom step module.',
  settings: 'Settings',
  viewCustom: 'View'
};

const CustomStepPlaceholders = {
  name: 'Enter the name.',  /* intended dupe: common */
  description: 'Enter the description.',  /* intended dupe: common */
  sourceQuery: 'Enter a collection tag or CTS query.',  /* intended dupe: common */
  additionalSettings: 'Enter the parameters for the module.',
  settings: 'Settings',
  viewCustom: 'View'
};

const CustomStepMessages = {
};


/* --- RUN --- */

const RunIntros = {
};

const RunToolTips = {
  /* Buttons */
  createFlow: 'Create a new flow.',
  addStep: 'Add a step to a flow.',

  /* Values made into links */
  flowName: 'Click to view or edit this flow.',

  /* Icons for flows */
  deleteFlow: 'Delete this flow.',

  /* Icons in step cards */
  ingestionStep: 'Run this step to select and ingest files, up to a total of 100MB.',
  otherSteps: 'Run this step.',
  removeStep: 'Remove this step from the flow.'
};

const RunPlaceholders = {
};

const RunMessages = {
};


/* --- EXPLORE --- */

const ExploreIntros = {
};

const ExploreToolTips = {
  nameQuery: 'The name of this query.',
  descriptionQuery: 'A description of this query.',
};

const ExplorePlaceholders = {
  nameQuery: 'Enter the name.',  /* intended dupe (value only): common */
  descriptionQuery: 'Enter the description.',  /* intended dupe (value only): common */
  searchText: 'Enter the text to search for.',
  searchQuery: 'Enter your search query.'
};

const ExploreMessages = {
};


/* --- SECURITY --- */

const SecurityIntros = {
  login: 'Enter your login credentials.',
};

const SecurityTooltips = {
  missingPermission: 'Contact your security administrator for access.'
};

const SecurityPlaceholders = {
  username: 'Enter your username.',
  password: 'Enter your password.'
};

const SecurityMessages = {
};

/* --- ERROR --- */
const ErrorTooltips = {
  disabledTab: 'You must correct the errors in \nthe current tab before switching.'
};

/* --- SLIDER --- */
const multiSliderTooltips = {
  priorityOrder: 'The length weights and source weights plotted on a continuum from low to high. Each weight indicates the importance of the length or source when merging documents.',
  timeStamp: 'Timestamp cannot be moved or deleted.'
};

/* ===== CONSTANTS TO BE DEPRECATED ===== */

/* TO BE DEPRECATED. Please use FlowTooltips. */
const NewFlowTooltips = {
  name: 'The name of this flow configuration. This cannot be changed after the flow is created.',
  nameField: 'The flow name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the flow is created.',
  description: 'A description of this flow configuration.'
};

/* TO BE DEPRECATED. Please use CommonStepTooltips. */
const AdvancedSettingsTooltips = {
  name: 'The name of this step definition.',
  description: 'A description of this step definition.',
  sourceQuery: 'The collection tag or CTS query that selects the source data to process in this step.',
  targetFormat: 'The format of the records in the target database.',
  additionalCollections: 'The collection tags to add to the default tags assigned to the processed record.',
  targetPermissions: (
    <span>A comma-delimited string that defines permissions required to access the processed record. The string must be in the format 
      <span style={{fontFamily: "monospace"}}> role,capability,role,capability,...</span>, where 
      <i> capability</i> can be <span style={{fontFamily: "monospace"}}>read</span>,
      <span style={{fontFamily: "monospace"}}> insert</span>,
      <span style={{fontFamily: "monospace"}}> update</span>, or
      <span style={{fontFamily: "monospace"}}> execute</span>.</span>
      ),
  headers: 'A JSON object that represents additional metadata to add to the header section of the envelope of each record.',
  provGranularity: 'The level of detail logged for provenance. Choose *coarse* for the default level or *off* for no provenance logging.',
  validateEntity: 'Choose whether to validate each document against the entity type definition and how to handle documents with errors.',
  processors: 'Custom modules that perform additional processes after the core step processes are completed and before the results are saved.',
  customHook: 'A custom module that performs additional processes in its own transaction before or after the core step transaction. Results are saved within a transaction.',
  sourceDatabase: 'The database where the input data is read from.',
  targetDatabase: 'The database where to store the processed data.',
  options: 'Key-value pairs to pass as parameters to the custom module.',
  customModuleURI: 'The path to your custom step module.',
  batchSize : 'The maximum number of items to process in a batch.',

  /* TO BE DEPRECATED. Please use SecurityTooltips.missingPermission. */
  missingPermission: 'Contact your security administrator for access.',
};

/* TO BE DEPRECATED. Please use LoadingStepTooltips. */
const NewLoadTooltips = {
  name: 'The name of this loading step configuration. This cannot be changed after the step is created.',
  nameField: 'The step name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the step is created.',
  description: 'A description of this loading step configuration.',
  files: 'Click *Upload* to select the source files. The total size of the files must be 100MB or less.',
  sourceFormat: 'The format of the source files to load.',
  targetFormat: 'The format of the processed record.',
  sourceName: 'The name of the source.',
  sourceType: 'The type of the source.',
  fieldSeparator: 'The delimiter in source files. Required if *Source Format* is *Delimited Text*.',
  outputURIPrefix: 'The prefix you want for the URIs of the loaded records. Example: If your prefix is /rawData/ and you load a file called customer1.json, the URI of the loaded record becomes /rawData/customer1.json.',

  /* TO BE DEPRECATED. Please use SecurityTooltips.missingPermission. */
  missingPermission: 'Contact your security administrator for access.'
};

/* TO BE DEPRECATED. Please use LoadingStepTooltips. */
const AdvLoadTooltips = {
  targetDatabase: 'The database where to store the processed data. For loading, the default is data-hub-STAGING.',
  mlcpCommand: 'To load files using MLCP, copy and paste this entire code to a command line. This code passes your step settings as parameter values to MLCP. Note: MLCP and Data Hub generate different URIs for the same delimited file.'
};

/* TO BE DEPRECATED. Please use MappingStepTooltips. */
const NewMapTooltips = {
  name: 'The name of this mapping step configuration. This cannot be changed after the step is created.',
  nameField: 'The step name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the step is created.',
  description: 'A description of this mapping step configuration.',
  sourceQuery: 'The collection or CTS query that selects the source data to process in this configuration.',

  /* TO BE DEPRECATED. Please use SecurityTooltips.missingPermission. */
  missingPermission: 'Contact your security administrator for access.'
};

/* TO BE DEPRECATED. Please use MappingStepTooltips. */
const AdvMapTooltips = {
  sourceDatabase: 'The database where the input data is read from. For mapping, the default is data-hub-STAGING.',
  targetDatabase: 'The database where to store the processed data. For mapping, the default is data-hub-FINAL.',
  provGranularity: 'The level of detail logged for provenance. Choose *coarse* for the default level or *off* for no provenance logging.',

  /* TO BE DEPRECATED. Please use SecurityTooltips.missingPermission. */
  missingPermission: 'Contact your security administrator for access.'
};

/* TO BE DEPRECATED. Please use MatchingStepTooltips. */
const NewMatchTooltips = {
  sourceDatabase: 'The database where the input data is read from. For matching, the default is data-hub-FINAL.',
  description: 'A description of this matching configuration.',
  targetDatabase: 'The database where to store the processed data. Must be the same as the Matching Step *Source Database*.',
  sourceQuery: 'The collection or CTS query that selects the source data to process in this configuration.',
  filter: 'A node in the thesaurus to use as a filter. Example: <thsr:qualifier>birds</thsr:qualifier>',
  collation: 'The URI for a collation, which specifies the order for sorting strings.',
  namespace: 'The namespace of the module that contains the function.',  /* intended dupe: match-merge */
  function: 'The function to run if this action definition is selected.',
  name: 'The name of this matching step configuration. This cannot be changed after the step is created.',
  nameField: 'The step name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the step is created.',
  uri: 'The path to the module that contains the function.',  /* intended dupe: match-merge */
  distanceThreshold: 'The threshold below which the phonetic difference (distance) between two strings is considered insignificant; i.e., the strings are similar to each other.',
  dictionaryUri: 'The location of the phonetic dictionary that is stored in a database and used when comparing words phonetically.',
  thesaurusUri: 'The location of the thesaurus that is stored in a MarkLogic Server database and used to determine synonyms.'
};

/* TO BE DEPRECATED. Please use MatchingStepTooltips. */
const AdvMatchTooltips = {
  sourceDatabase: 'The database where the input data is read from. For matching, the default is data-hub-FINAL.',
  targetDatabase: 'The database where to store the processed data. Must be the same as the *Source Database*.',
  provGranularity: 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.'
};

/* TO BE DEPRECATED. Please use MatchingStepIntros.main. */
const MatchingStepDetailText = {
  description: 'The Matching step defines the criteria for comparing documents, as well as the actions to take based on the degree of similarity, which is measured as weights.'
};

/* TO BE DEPRECATED. Please use MergingStepTooltips. */
const NewMergeTooltips = {
  timestampPath: 'The path to a timestamp field within the record. This field is used to determine which values to include in the merged property, based on their recency.',
  name: 'The name of this merging step configuration. This cannot be changed after the step is created.',
  description: 'A description of this merging step configuration.',

  /* TO BE DEPRECATED. Please use SecurityTooltips.missingPermission. */
  missingPermission: 'Contact your security administrator for access.'
};

/* TO BE DEPRECATED. Please use MergingStepTooltips. */
const AdvMergeTooltips = {
  sourceDatabase: 'The database where the input data is read from. Must be the same as the Matching Step *Source Database*.',
  targetDatabase: 'The database where to store the processed data. Must be the same as the Matching Step *Source Database*.',
  provGranularity: 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.'
};

/* TO BE DEPRECATED. Please use MergingStepTooltips. */
const MergeRuleTooltips = {
  uri: 'The path to the custom module that contains the merge function to run.',
  function: 'The merge function to run.',
  namespace: 'The namespace of the module that contains the function to run.',
  maxValues: 'The maximum number of values to allow in the merged property. The default is 99.',
  maxSources: 'The maximum number of data sources from which to get values to merge. To copy values from a single source, set to 1.',
  priorityOrder: 'The relative importance of each metadata when merging documents.'
};

/* TO BE DEPRECATED. Please use MergingStepIntros.main. */
const MergingStepDetailText = {
  description: 'The Merging step defines how to combine documents that the Matching step identified as similar.'
};

/* TO BE DEPRECATED. Please use MergingStepMessages.delete. */
const MergeStrategyTooltips = {
  delete: 'Strategies that are used by a merge rule cannot be deleted.'
};

/* TO BE DEPRECATED. Please use CustomStepTooltips. */
const NewCustomTooltips = {
  name: 'The name of this custom step configuration. This cannot be changed after the step is created.',
  nameField: 'The step name is used as part of filenames, as a collection name, and as metadata in logs. It cannot be changed after the step is created.',
  description: 'A description of this custom step configuration.',
  sourceQuery: 'The collection or CTS query that selects the source data to process in this configuration.'
};


/* TO BE DEPRECATED. Please use CustomStepTooltips. */
const AdvCustomTooltips = {
  additionalSettings: 'A JSON object containing key-value pairs to pass to the custom step module.',
  settings: 'Settings',
  viewCustom: 'View'
};



/* ===== */

export {
  ModelingIntros,
  ModelingTooltips,
  ModelingPlaceholders,
  ModelingMessages,
  FlowIntros,
  FlowTooltips,
  FlowPlaceholders,
  FlowMessages,
  CommonStepTooltips,
  CommonStepPlaceholders,
  CommonStepMessages,
  LoadingStepIntros,
  LoadingStepTooltips,
  LoadingStepPlaceholders,
  LoadingStepMessages,
  MappingStepIntros,
  MappingStepTooltips,
  MappingStepPlaceholders,
  MappingStepMessages,
  MatchingStepIntros,
  MatchingStepTooltips,
  MatchingStepPlaceholders,
  MatchingStepMessages,
  MergingStepIntros,
  MergingStepTooltips,
  MergingStepPlaceholders,
  MergingStepMessages,
  multiSliderTooltips,
  CustomStepIntros,
  CustomStepTooltips,
  CustomStepPlaceholders,
  CustomStepMessages,
  RunIntros,
  RunToolTips,
  RunPlaceholders,
  RunMessages,
  ErrorTooltips,
  ExploreIntros,
  ExploreToolTips,
  ExplorePlaceholders,
  ExploreMessages,
  SecurityIntros,
  SecurityTooltips,
  SecurityPlaceholders,
  SecurityMessages,

  /* ===== TO BE DEPRECATED ===== */
  NewFlowTooltips,
  AdvancedSettingsTooltips,
  NewLoadTooltips,
  AdvLoadTooltips,
  NewMapTooltips,
  AdvMapTooltips,
  NewMatchTooltips,
  AdvMatchTooltips,
  MatchingStepDetailText,
  NewMergeTooltips,
  AdvMergeTooltips,
  MergeRuleTooltips,
  MergingStepDetailText,
  MergeStrategyTooltips,
  NewCustomTooltips,
  AdvCustomTooltips
}
