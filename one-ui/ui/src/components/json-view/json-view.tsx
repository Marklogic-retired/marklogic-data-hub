import React from 'react';
import ReactJson from 'react-json-view'

interface Props {
  document: any;
}
const JsonView: React.FC<Props> = (props) => {

  return (
    <ReactJson src={props.document} />
  );
}

export default JsonView;