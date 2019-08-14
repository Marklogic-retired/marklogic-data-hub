import React from 'react';
import ReactJson from 'react-json-view'
import ExampleJson from '../../assets/example';

const JsonView: React.FC = () => {

    return (
        <ReactJson src={ExampleJson} />
    );
}

export default JsonView;