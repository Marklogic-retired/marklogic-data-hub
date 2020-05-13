import React from 'react';
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Toolbar from './toolbar';
import tiles from '../../config/tiles.config'
import authorities from "../../config/authorities.config";
import Bench from "../../pages/Bench";
import {AuthoritiesContext} from "../../util/authorities";

const mockDevRolesService = authorities.DeveloperRolesService;

describe('Toolbar component', () => {

    it('renders with clickable tools', () => {
        const mockClick = jest.fn()
        const {getByLabelText} = render(<AuthoritiesContext.Provider value={ mockDevRolesService}><Toolbar tiles={tiles} onClick={mockClick} /></AuthoritiesContext.Provider>);
        const tools = Object.keys(tiles);

        expect(getByLabelText("toolbar")).toBeInTheDocument();

        tools.forEach((tool, i) => {
            expect(getByLabelText("tool-" + tool)).toBeInTheDocument();
            fireEvent.click(getByLabelText("tool-" + tool));
            expect(mockClick.mock.calls.length).toBe(i+1);
            expect(mockClick.mock.calls[i][0]).toBe(tool);
        })

    });

});
