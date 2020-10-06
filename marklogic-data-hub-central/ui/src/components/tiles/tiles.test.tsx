import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Tiles from './tiles';
import { faCube } from "@fortawesome/free-solid-svg-icons";
import TestComponent from '../../assets/mock-data/test-component';

describe('Tiles component', () => {
    test('renders with a FontAwesome icon', () => {
        const color = '#000';
        const text = 'test';
        const options = {
            title: text, 
            iconType: 'fa', 
            icon: faCube, 
            color: color, 
            bgColor: color, 
            border: color,
            controls: []
        };
        const {getByLabelText} = render(
            <Tiles 
                id={text}
                view={<TestComponent/>}
                currentNode={text}
                options={options}
                onMenuClick={jest.fn()}
                onTileClose={jest.fn()}
                newStepToFlowOptions={jest.fn()}
            />
        );
        expect(getByLabelText('icon-' + text)).toBeInTheDocument();
        expect(getByLabelText('title-' + text)).toBeInTheDocument();
    });
    test('renders with a custom icon', () => {
        const color = '#000';
        const text = 'test';
        const options = {
            title: text, 
            iconType: 'custom', 
            icon: 'exploreIcon', 
            color: color, 
            bgColor: color, 
            border: color,
            controls: []
        };
        const {getByLabelText} = render(
            <Tiles 
                id={text}
                view={<TestComponent/>}
                currentNode={text}
                options={options}
                onMenuClick={jest.fn()}
                onTileClose={jest.fn()}
                newStepToFlowOptions={jest.fn()}
            />
        );
        expect(getByLabelText('icon-' + text)).toBeInTheDocument();
        expect(getByLabelText('title-' + text)).toBeInTheDocument();
    });
});
