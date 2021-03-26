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

const SystemInfoMessages = {
    downloadHubCentralFiles: "Download a zip file containing only artifacts (models, steps, and flows) that were created or modified through Hub Central. You can apply these files to an existing local project.",
    downloadProjectFiles: "Download a zip file containing all Data Hub project files (project configurations) and artifacts (models, steps, step definitions, flows, and modules) that were created or modified through Hub Central. You can use these files to set up the project locally and check them into a version control system.",
    clearAllUserData: "Delete all user data in the STAGING, FINAL, and JOBS databases. Project files and artifacts remain."
}

const MissingPagePermission = "You do not have permission to view this page.";

export {
    AdvancedSettingsMessages,
    ConfirmYesNoMessages,
    SystemInfoMessages,
    MissingPagePermission
};
