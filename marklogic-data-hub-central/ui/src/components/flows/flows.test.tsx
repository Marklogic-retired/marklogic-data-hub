import React from 'react';
import { shallow } from 'enzyme';
import Flows from './flows';

describe('Flows component', () => {
    let flows = [];
    let loads = [];
    let mappings = [];
    let deleteFlow = () => null;
    let createFlow = () => null;
    let updateFlow = () => null;
    let runStep = () => null;
    let deleteStep = () => null;
    let canReadFlow = false;
    let canWriteFlow = false;
    let hasOperatorRole = false;
    let running = [];
    it('should render correctly', () => {
        shallow(<Flows 
            flows={flows} 
            loads={loads} 
            mappings={mappings} 
            deleteFlow={deleteFlow} 
            createFlow={createFlow} 
            updateFlow={updateFlow} 
            runStep={runStep} 
            deleteStep={deleteStep} 
            canReadFlow={canReadFlow}
            canWriteFlow={canWriteFlow}
            hasOperatorRole={hasOperatorRole}
            running={running}
        />);
    });
});