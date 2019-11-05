import React from 'react'
import XMLViewer from 'react-xml-viewer'

interface Props {
  document: any;
}

const XmlView: React.FC<Props> = (props) => {

    return (
      <div data-cy='xml-document'> 
        <XMLViewer xml={props.document} />
      </div>
    );
}

export default XmlView;
