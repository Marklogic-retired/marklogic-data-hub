import React from 'react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
const history = createMemoryHistory();
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Toolbar from './toolbar';
import tiles from '../../config/tiles.config';


describe('Toolbar component', () => {

    it('renders with clickable tools', () => {
        const tools = Object.keys(tiles);
        const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={tools}/></Router>);

        expect(getByLabelText("toolbar")).toBeInTheDocument();

        tools.forEach((tool, i) => {
            expect(getByLabelText("tool-" + tool)).toBeInTheDocument();
            fireEvent.click(getByLabelText("tool-" + tool));
            expect(history.location.pathname).toEqual(`/tiles/${tool}`);
        });

    });

    it('verify rendering of disabled tile icons', () => {
        let disabledTiles = ['load', 'model', 'curate', 'run', 'explore'];
        const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={[]}/></Router>);
        expect(getByLabelText("toolbar")).toBeInTheDocument();

        disabledTiles.forEach((tile, i) => {
            expect(getByLabelText("tool-" + tile)).toHaveStyle('color: grey; opacity: 0.5; cursor: not-allowed;');
        });
    });

    it('verify rendering of enabled tile icons', () => {
        let enabledTiles = ['load', 'model', 'curate', 'run', 'explore'];
        const {getByLabelText} = render(<Router history={history}><Toolbar tiles={tiles} enabled={enabledTiles}/></Router>);
        expect(getByLabelText("toolbar")).toBeInTheDocument();

        enabledTiles.forEach((tile, i) => {
            expect(getByLabelText("tool-" + tile)).not.toHaveStyle('color: grey; opacity: 0.5; cursor: not-allowed;');
        });
    });

});
