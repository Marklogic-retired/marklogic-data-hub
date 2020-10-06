import React from 'react';

interface Props {
  id?: string;
}

const TestComponent: React.FC<Props> = (props) => {
  return (<div>Test</div>);
};

export default TestComponent;
