import React from "react";
import oneToManyIcon from "../assets/one-to-many-white.svg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faKey, faLayerGroup} from "@fortawesome/free-solid-svg-icons";
import styles from "../components/tiles/tiles.module.scss";
import modelIcon from "../assets/model-overview-helpInfo.svg";
import "./tooltips.config.scss";
import {Tooltip} from "react-bootstrap";

/* --- MODELING --- */

const ModelingIntros = {
  main: 'The entity model is comprised of entity types that describe and standardize your data. You need these entity types to curate your data.'
};

const keyboardNavigationTooltips = {
    dropdownUserInfo: <span>Press <strong>Tab</strong> and then the <strong>Down arrow</strong> key to expand the drop-down menu. Select an option using the <strong>Up arrow</strong> key and <strong>Down arrow</strong> key, and then press <strong>Enter</strong>.</span>
}

const ModelingTooltips = {
  /* Buttons */
  addNewEntity: 'Add a new entity type.',
  addNewEntityGraph: 'Add a new entity type or relationship.',
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
  viewGraph: 'View entity in graph view.',

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
  nameEntityProperty: 'Names must start with a letter and can contain letters, numbers, hyphens, and underscores. ' +
    'Property names cannot use the same name as the associated entity type or its existing properties.',
  descriptionEntityProperty: 'A description of this entity property.',
  namespace: 'Use of entity type namespaces is optional. If you choose to use a namespace, you must specify both a namespace URI and a prefix in your entity type definition.',

  /* Form fields */
  joinProperty: 'Structured type properties, arrays, and unsaved properties cannot be used as join properties.',

   /* Foreign key relationship tooltip in mapping tile*/
   foreignKeyMapping: function (relatedEntityName, joinPropertyName, sourceEntityName, propertyName) {
    return (
      <span>
        The <strong>{sourceEntityName}</strong> and <strong>{relatedEntityName}</strong> entity types are connected using the <strong>{joinPropertyName}</strong> property. <br/>
        The <strong>{propertyName}</strong> property (<strong>{sourceEntityName}</strong>) and the <strong>{joinPropertyName}</strong> property (<strong>{relatedEntityName}</strong>) must return the same value.
      </span>
    )
  },

    /* Foreign key relationship in modeling tile*/
    foreignKeyModeling: function (relatedEntityName, joinPropertyName, sourceEntityName) {
      return (
          <span>
              The <strong>{sourceEntityName}</strong> and <strong>{relatedEntityName}</strong> entity types are connected using the <strong>{joinPropertyName}</strong> property.
           </span>
      )
    },
    /*Relationship without Foreign Key in modeling tile*/
    relationshipNoForeignKey: function (relatedEntityName, sourceEntityName) {
      return(
          <span>
            There is a relationship between the <strong>{sourceEntityName}</strong> and <strong>{relatedEntityName}</strong> entity types.<br/>To connect the entity types using a foreign key, go to the <strong>Model</strong> screen and then add a foreign key to the relationship.
          </span>
      )
    },

    completeRelationship: function (relatedEntityName, sourceEntityName) {
      return(
          <span>
            There is a relationship between the <strong>{sourceEntityName}</strong> and <strong>{relatedEntityName}</strong> entity types.
          </span>
      )
    },

  publish: "Publishing will apply your changes to the application. Changes are saved automatically.",

  /* Graph view */
  exportGraph: "Export graph as PNG",
  relationshipEmpty: "Relationship name is required",
  targetEntityEmpty: "Target entity type is required",
  foreignKeyInfo: "A foreign key is a property that can be used to connect two entity types in a relationship. Select a property in the target entity type to connect the source and target entity types. A foreign key cannot allow multiple values, be a structured type property, or be an unpublished property.",
  deleteRelationshipIcon: "Delete this relationship",
  editModeInfo: <span>To add a relationship between entity types, drag the source entity type to the target entity type. You can also click the source entity type to configure a relationship. Press <strong>Esc</strong> to exit this mode.</span>,
  addRelationshipHeader: <span aria-label="addRelationshipHeader">Set the relationship type, relationship name, and foreign key. You are not required to specify a foreign key to save the relationship.</span>,
  duplicatePropertyError: function (relationshipName) {
    return (
    <span data-testid="property-name-error">
      The associated entity type or one of its properties is already using the name <b>{relationshipName}</b>. A property cannot use the same name as the associated entity type or its existing properties.
    </span>
    )
  },
  relationshipNameInfo: function (entityName) {
    return (
      <span>
        The name that identifies the relationship between the source and target entity types. The relationship is saved as a property in the <strong>{entityName}</strong> entity type.<br/>Names must start with a letter and can contain letters, numbers, hyphens, and underscores. Property names cannot use the same name as the associated entity type or its existing properties.
      </span>
    )
  },
  cardinalityButton: function () {
    return (
      <span>
        Click to toggle between one [ | ] and many [<img src={oneToManyIcon}></img>] relationship types. Choose one [ | ] to specify that one instance of the target entity type can be related to an instance of the source entity type.
        Choose many [<img src={oneToManyIcon}></img>] to specify that many instances of the target entity type can be related to an instance of the source entity type.
      </span>
    )
  },

  /* TO BE DEPRECATED. Use ModelingTooltips.nameEntityType. */
  nameRegex: 'Names must start with a letter and can contain letters, numbers, hyphens, and underscores. Entity names cannot use the same name as an existing entity type.',

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
  entityEditedAlert: <span>You have unpublished changes for one or more entity types. Unpublished changes are saved automatically and have no impact on your project. Click the <strong>Publish</strong> button to apply changes to the rest of your project.</span>,
  saveEntityConfirm: <span>You have unpublished changes that are only available in the <strong>Model</strong> screen. Publish changes to apply changes to the rest of your project. Publishing changes could trigger a reindex of your data.</span>,
  titleNoDefinition: <span>Unable to display properties because the definition cannot be found for this entity type. To learn more, see <a href="https://docs.marklogic.com/datahub/refs/troubleshooting.html" target="_blank">Troubleshooting</a> in the documentation.</span>,
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
  interceptors: 'Custom modules that perform additional processes after the core step processes are completed and before the results are saved.',
  customHook: 'A custom module that performs additional processes in its own transaction before or after the core step transaction. Results are saved within a transaction.',
  options: 'Key-value pairs to pass as parameters to the custom module.',
  customModuleURI: 'The path to your custom step module.',
  radioQuery: 'A single collection that selects the source data to process in this configuration.',
  radioCollection: <span>The CTS query that selects the source data to process in this configuration. CTS queries can be written in JavaScript or XQuery, and must return the URIs to be processed by the step. For XQuery, the query has to be passed as a string to xdmp.xqueryEval(), as shown in the example below.  Learn more: <a target="_blank" href="https://docs.marklogic.com/guide/search-dev/cts_query" style={{color: "5B69AF"}}>CTS Query.</a><br/><br/>
  The following example source queries select data from multiple collections.<br/><br/>
  JavaScript:<br/>
  <span style={{fontFamily: "monospace"}}>cts.collectionQuery(['collection1', 'collection2'])</span><br/><br/>
  XQuery:<br/>
  <span style={{fontFamily: "monospace"}}>xdmp.xqueryEval("cts:collection-query(('loadCustomersJSON', 'loadCustomersXML'))"</span>)</span>
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
  interceptors: 'Enter the array of interceptor settings.',
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

const MappingDetailsTooltips = {
  context: "An element in the source data from which to derive the values of this entity property's children. Both the source data element and the entity property must be of the same type (Object or an array of Object instances). Use a slash (\"/\") if the source model is flat.",
  uri: "URI for the records created by the mapping step for this entity."
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
  interceptorMessage: <span>These records are the output of an interceptor configured to run before this step. See <b>Step Settings</b> for more details.</span>,
  interceptorError: "An error prevented the interceptor from completing successfully. The source data will be visible once you resolve the error.",
  titleNoDefinition: <span>Unable to add steps because the definition cannot be found for this entity type. To learn more, see <a href="https://docs.marklogic.com/datahub/refs/troubleshooting.html" target="_blank">Troubleshooting</a> in the documentation.</span>
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
  provGranularity: 'The level of detail logged for provenance. Choose *fine* for more detailed logging, *coarse* for the default level, or *off* for no provenance logging.',
  testUris: 'Tests the configuration on entered URIs with each other (requires at least two URIs)',
  testUrisAllData: 'Tests the configuration on entered URIs with all the data in your source query (a subset of Test All Data)',
  testAllData: 'Tests the configuration on all the URIs in your source query with each other',
  reduceToggle: 'The Reduce match type reduces the weight of a match and makes the weight negative for the entire ruleset. Use the Reduce match type when a combination of matching properties suggests a match when there should be none. When toggled on, no other match type may be selected.',
  thresholdScale: 'Enable the scale to position, edit or delete thresholds.',
    rulesetScale: 'Enable the scale to position, edit or delete rulesets.'
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
  main: 'Each merge step is associated with a match step. After the match step is run, there is a set of matched entities associated with each match threshold. Depending on the action specified for the match threshold, the merge step will either merge the matched entities, create notifications for the matched entities, or perform a custom action. When entities are merged, all the property values from the matched entities are combined into the merged entity by default. To define exceptions to this default behavior, create merge strategies and merge rules.',
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
  strategyScale: 'Enable the scale to position or delete length and sources.',

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
  viewCustom: 'Edit'
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
  numberOfResults: "Pan around the graph to view more results."
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
  disabledTab: 'You must correct any errors and provide all required information in the current tab before switching.',
  entityErrorServerResp: function (entityName) {
    return `An entity type is already using the name ${entityName}. An entity type cannot use the same name as an existing entity type.`
  }
};

/* --- SLIDER --- */
const multiSliderTooltips = {
  priorityOrder: <span aria-label="priorityOrderTooltip">The length weights and source weights plotted on a slider from low to high. Each weight indicates the importance of the length or source when merging documents. The <b>Timestamp</b> node cannot be deleted.</span>,
  timeStamp: 'The Timestamp node cannot be deleted.',
  viewOnlyTooltip: 'Click the strategy name to change the priority order.'
};

/* ===== CONSTANTS TO BE DEPRECATED ===== */

/* TO BE DEPRECATED. Please use FlowTooltips. */
const NewFlowTooltips = {
  name: 'The name of this flow configuration. This cannot be changed after the flow is created. Names must start with a letter and contain letters, numbers, hyphens, and underscores only.',
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
  sourceRecordScope: (
    <span>The scope of the source record you want to map to. Choose <strong>Instance Only</strong> to map to the source instance in your envelope. Choose <strong>Entire Record</strong> to map to any of the source fields in your envelope.</span>
  ),
  attachSourceDocument: 'Specifies whether the source document should be copied into the mapped entity instance',
  interceptors: <span>An array of JSON objects specifying the custom modules that perform additional processes on a batch.<br/><br/>
  <strong>Syntax:</strong><br/><span style={{fontFamily: "monospace"}}>{'{'}[<br/>&nbsp;&nbsp;"path": "/uri/of/custom/module/in/modules/database/a.sjs",<br/>&nbsp;&nbsp;"vars":{"{"}"myParameter": "myParameterValue"{"}"},<br/>
  &nbsp;&nbsp;"when": "beforeMain | beforeContentPersisted"<br/>]{'}'}</span><br/><br/><strong>Parameters:</strong><br/>path: The URI of the interceptor module in the MODULES database that the user running the step can read and execute.<br/>
  vars (optional): A JSON object containing parameters to pass to the interceptor.<br/>when: Defines when the interceptor will be invoked. Allowed values are <span style={{fontFamily: "monospace"}}>"beforeMain"</span> or <span style={{fontFamily: "monospace"}}>"beforeContentPersisted"</span>.<br/><br/>
  The module identified by the <span style={{fontFamily: "monospace"}}>"path"</span> property will be invoked via MarkLogic's <a href="https://docs.marklogic.com/xdmp.invoke">xdmp.invoke function</a> with the default arguments for options. The module will be passed two arguments:<br/><br/>
  &nbsp;&nbsp;1. contentArray: The array of content objects<br/><ul style={{}}><li>When the <span style={{fontFamily: "monospace"}}>"when"</span> property is <span style={{fontFamily: "monospace"}}>"beforeMain"</span>, this will be the array of content objects that will be passed to the <span style={{fontFamily: "monospace"}}>"main"</span> function of the step module.</li>
  <li>When the <span style={{fontFamily: "monospace"}}>"when"</span> property is <span style={{fontFamily: "monospace"}}>"beforeContentPersisted"</span>, this will be the array of content objects returned by the <span style={{fontFamily: "monospace"}}>"main"</span> function of the step module.</li></ul>
  &nbsp;&nbsp;2. options: The set of combined options from the step definition, flow, step, and &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;runtime options<br/><br/>
  For a working example of step interceptors along with more details, please see the <a href="https://github.com/marklogic/marklogic-data-hub/tree/master/examples/step-interceptors/">Step Interceptors example</a>.</span>,
  customHook: 'A custom module that performs additional processes in its own transaction before or after the core step transaction. Results are saved within a transaction.',
  sourceDatabase: 'The database where the input data is read from.',
  targetDatabase: 'The database where to store the processed data.',
  options: 'Key-value pairs to pass as parameters to the custom module.',
  customModuleURI: 'The path to your custom step module.',
  batchSize : 'The maximum number of items to process in a batch.',
  customHookDeprecated: 'Custom hooks are deprecated and will be removed in a future version. Please use interceptors instead.',

  /* TO BE DEPRECATED. Please use SecurityTooltips.missingPermission. */
  missingPermission: 'Contact your security administrator for access.',
};

/* TO BE DEPRECATED. Please use LoadingStepTooltips. */
const NewLoadTooltips = {
  name: 'The name of this loading step configuration. This cannot be changed after the step is created. Names must start with a letter and contain letters, numbers, hyphens, and underscores only.',
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
  name: 'The name of this mapping step configuration. This cannot be changed after the step is created. Names must start with a letter and contain letters, numbers, hyphens, and underscores only.',
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
  name: 'The name of this matching step configuration. This cannot be changed after the step is created. Names must start with a letter and contain letters, numbers, hyphens, and underscores only.',
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
  description: 'The Matching step defines the criteria for determining whether the values from entities match, and the action to take based on how close of a match they are.'
};

/* TO BE DEPRECATED. Please use MergingStepTooltips. */
const NewMergeTooltips = {
  timestampPath: 'The path to a timestamp field within the record. This field is used to determine which values to include in the merged property, based on their recency.',
  name: 'The name of this merging step configuration. This cannot be changed after the step is created. Names must start with a letter and contain letters, numbers, hyphens, and underscores only.',
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
  priorityOrder: 'The relative importance of each metadata when merging documents.',
  disabledProperties: 'Disabled properties in the list are already used in other rules.',
  strategyScale: 'Enable the scale to position or delete length and sources.',
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
  name: 'The name of this custom step configuration. This cannot be changed after the step is created. Names must start with a letter and contain letters, numbers, hyphens, and underscores only.',
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

const ToolbarBulbIconInfo = {
    modelingInfo: <div><strong>Effective data curation begins with defining an entity model.</strong><br/><br/>
    A model is composed of one or more entity types, which represent the high-level business objects in your enterprise. Employee, product, purchase order, and department are all examples of entity types. Each entity type is composed of properties. Properties can have single or multiple values, and you can arrange them in a flat or hierarchical structure.<br/><br/>
    Unlike relational models, you do not have to worry about building the perfect model upfront; you can <strong>evolve the model</strong> as you learn more about your data or bring in new data. As your business needs change, it’s normal to add new properties to existing entity types, or add new entity types entirely.<br/><br/>
    The entity type is comprised of properties, which can be of any of the following types:<br/><br/>
  <ul>
    <li>A <strong>basic</strong> data type, including integer, string, dateTime, boolean, or other less common data types.</li><br/>
    <li><FontAwesomeIcon className={styles.structuredIcon} icon={faLayerGroup}/> A <strong>structured</strong> type, which is comprised of its own properties, which can also be of other structured types. Use structured types to create hierarchies of properties within your entity type. For example, the structured type property <span className={styles.lightFont}>FullName</span> of the entity <span className={styles.lightFont}>Employee</span> might have a <span className={styles.lightFont}>firstName, middleName</span>, and <span className={styles.lightFont}>lastName</span> properties within it. The depth of nested structured types is not limited.</li><br/>
    <li><FontAwesomeIcon className={styles.foreignKeyIcon} icon={faKey}/> A <strong>relationship</strong> type, which links to an entity of the selected type. Use a relationship type when there's a relationship between two entities — for example, an employee belongs to a department, so there's a relationship between Employee and Department.</li>
  </ul></div>,
  homePageInfo: <div>
      <span style={{fontSize:"larger"}}><strong>Ready to get started?</strong></span><br/><br/>
      To understand exactly what Data Hub Central can do for you, first try to get a very simple use case working. When you are happy with the results, you can build on it to satisfy all your requirements.<br/><br/>
      <div style={{display: "flex"}}><div className={"modelIconHeader"} style={{color: "#999999"}}></div><div>Start by creating a simple entity type from the <strong>Model</strong> screen. The entity type defines the standard structures to be populated with values from your source file. Add just a few properties to start.</div></div><br/>
      <div style={{display: "flex"}}><div style={{display: "flex", flexDirection:"column"}}><div className={"loadIconHeader"} style={{color: "#999999", marginBottom:"1.2vh"}}></div><div className={"runIconHeader"} style={{color: "#999999", marginBottom:"1.2vh"}}></div><div className={"exploreIconHeader"} style={{color: "#999999"}}></div></div>      <div>      Next, load some data from your first source system and map it to the entity type. Start by loading one source file by creating and running a Load step from the <strong>Load</strong> screen. Once you have loaded the file, create and run a Mapping step from the <strong>Curate</strong> screen. The Mapping step transforms the data from your source file to the structure defined in your entity type. Once you have this working, add the rest of the properties to your entity type and map to them. You can view and export the final data from the <strong>Explore</strong> screen.<br/><br/></div></div>
      Once you are happy with the way the data from your first source system looks, you are ready to load and map data from additional sources. You will need to create a new Load and Mapping step for each new source.<br/><br/>
      After you have finished mapping, if there are duplicate records from various sources that you would like to merge, do the following from the <strong>Curate</strong> screen:<br/>
      &nbsp;&nbsp;1. Create a Matching step to identify the duplicates.<br/>
      &nbsp;&nbsp;2. Create a Merging step to merge duplicates.
  </div>
}

/* ===== */

export {
  ModelingIntros,
  keyboardNavigationTooltips,
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
  MappingDetailsTooltips,
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
  ToolbarBulbIconInfo,

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
