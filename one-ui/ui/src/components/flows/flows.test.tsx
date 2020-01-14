import React from 'react';
import { shallow } from 'enzyme';
import Flows from './flows';

describe('Flows component', () => {
    let data = [];
    let createFlow = () => null;
    let deleteFlow = () => null;
    it('should render correctly', () => {
        shallow(<Flows data={data} createFlow={createFlow} deleteFlow={deleteFlow} />);
    });
});