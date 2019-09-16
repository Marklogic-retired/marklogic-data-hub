import React from 'react'
import XMLViewer from 'react-xml-viewer'

const XmlView = (props) => {

    return (
        <div> 
        <XMLViewer xml={props.document} />
        </div>
    );
}

export default XmlView;
