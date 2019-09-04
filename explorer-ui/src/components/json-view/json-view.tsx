import React from 'react';
import ReactJson from 'react-json-view'

const JsonView = (props) => {

    return (
        <ReactJson src={props.document} />
    );
}

export default JsonView;