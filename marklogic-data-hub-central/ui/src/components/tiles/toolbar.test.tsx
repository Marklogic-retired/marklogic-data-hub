import React from 'react';
import { Router } from 'react-router'
import { createMemoryHistory } from 'history'
const history = createMemoryHistory()
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Toolbar from './toolbar';
import tiles from '../../config/tiles.config'


describe('Toolbar component', () => {

    it('renders with clickable tools', () => {
        const tools = Object.keys(tiles);
        const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={tools}/></Router>);

        expect(getByLabelText("toolbar")).toBeInTheDocument();

        tools.forEach((tool, i) => {
            expect(getByLabelText("tool-" + tool)).toBeInTheDocument();
            fireEvent.click(getByLabelText("tool-" + tool));
            expect(history.location.pathname).toEqual(`/tiles/${tool}`);
        })

    });

});
