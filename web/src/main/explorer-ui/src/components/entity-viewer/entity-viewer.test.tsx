import React from 'react';
import { shallow } from 'enzyme';
import EntityViewer from './entity-viewer';

it('component runs without data', () => {
  shallow(<EntityViewer data={null} />);
});
