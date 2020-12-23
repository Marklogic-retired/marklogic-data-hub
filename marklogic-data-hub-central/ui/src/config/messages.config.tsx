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

export {
    AdvancedSettingsMessages,
    ConfirmYesNoMessages
};
