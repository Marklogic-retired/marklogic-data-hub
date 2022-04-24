import React from "react";

const AdvancedSettingsMessages = {
    'targetPermissions': {
        'incorrectFormat' : (
        <span>The format of the string is incorrect. The required format is 
            <span style={{fontFamily: "monospace"}}> role,capability,role,capability,....</span> 
        </span>),
        'invalidCapabilities' : (
        <span>The string contains invalid capabilities. Capabilities must be 
            <span style={{fontFamily: "monospace"}}> read</span>,
            <span style={{fontFamily: "monospace"}}> insert</span>,
            <span style={{fontFamily: "monospace"}}> update</span>, or
            <span style={{fontFamily: "monospace"}}> execute</span>.
        </span>)
    }
};

const ConfirmYesNoMessages = {
    'discardChanges' : 'Discard changes?',
    'saveChanges' : 'Save changes?'
};

const ClearDataMessages = {
  clearAllConfirmation: function(databaseOptions) {
    return <span aria-label="clear-all-data-confirm">Are you sure you want to clear all user data in the FINAL, STAGING, and JOBS databases? 
        <br/> This action will clear all documents not including project files and artifacts. 
        <br/><br/> FINAL: <strong>{databaseOptions[0]}</strong>
        <br/><br/> STAGING: <strong> {databaseOptions[1]}</strong> 
        <br/><br/> JOBS: <strong> {databaseOptions[2]}</strong> 
      </span>
  },
  clearSubsetConfirmation: function(targetDb, basedOn, collection, entity) {

    const givenSource = basedOn !== "None" ? basedOn : "";
    if (givenSource === "Collection") {
      return <span aria-label="clear-collection-subset-confirm">Are you sure you want to clear this subset of user data in the <strong>{targetDb}</strong> database based on the <strong>{collection}</strong> collection? 
          <br/><br/> This action will clear all documents in the <strong>{targetDb}</strong> database based on the <strong>{collection}</strong> collection, not including project files and artifacts. 
        </span>
    } else if (givenSource === "Entity") {
      return <span aria-label="clear-entity-subset-confirm">Are you sure you want to clear this subset of user data in the <strong>{targetDb}</strong> database based on the <strong>{entity}</strong> entity? 
          <br/><br/> This action will clear all documents in the <strong>{targetDb}</strong> database based on the <strong>{entity}</strong> entity, not including project files and artifacts. 
        </span>    
    }    
    else {
    return <span aria-label="clear-db-subset-confirm">Are you sure you want to clear this subset of user data in the <strong>{targetDb}</strong> database? 
          <br/><br/> This action will clear all documents in the <strong>{targetDb}</strong> database, not including project files and artifacts. 
        </span>
    }
  },
  emptyCollectionError: "You must specify an existing collection.",
  emptyEntityError: "You must specify an existing entity.",
  databaseSelectionTooltip: "Choose a database from which to clear user data.",
  basedOnTooltip: "Clear user data based on a collection or entity."
}



const SystemInfoMessages = {
    downloadHubCentralFiles: "Download a zip file containing only artifacts (models, steps, and flows) that were created or modified through Hub Central. You can apply these files to an existing local project.",
    downloadProjectFiles: "Download a zip file containing all Data Hub project files (project configurations) and artifacts (models, steps, and flows) that were created or modified through Hub Central. You can use these files to set up the project locally and check them into a version control system.",
    clearAllUserData: "Clear all user data in the STAGING, FINAL, and JOBS databases. Project files and artifacts remain."
}

const MissingPagePermission = "You do not have permission to view this page.";

export {
    AdvancedSettingsMessages,
    ClearDataMessages,
    ConfirmYesNoMessages,
    SystemInfoMessages,
    MissingPagePermission
};
