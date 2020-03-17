import React from 'react';
import { shallow } from 'enzyme';
import Flows from './flows';

describe('Flows component', () => {
    let flows = [];
    let loads = [];
    let deleteFlow = () => null;
    let createFlow = () => null;
    let updateFlow = () => null;
    let runStep = () => null;
    let deleteStep = () => null;
    let canReadFlows = false;
    let canWriteFlows = false;
    let hasOperatorRole = false;
    let running = [];
    it('should render correctly', () => {
        shallow(<Flows 
            flows={flows} 
            loads={loads} 
            deleteFlow={deleteFlow} 
            createFlow={createFlow} 
            updateFlow={updateFlow} 
            runStep={runStep} 
            deleteStep={deleteStep} 
            canReadFlows={canReadFlows} 
            canWriteFlows={canWriteFlows}
            hasOperatorRole={hasOperatorRole}
            running={running}
        />);
    });
});