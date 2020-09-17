import React from 'react';
import { Router } from 'react-router'
import { createMemoryHistory } from 'history'
import {render, fireEvent } from "@testing-library/react";
import Overview from './Overview';

describe('Overview component', () => {

    it('Verify content display', async () => {

        const { getByText, getByLabelText } = render(<Overview/>);

        expect(getByLabelText('overview')).toBeInTheDocument();

        expect(getByText('Welcome to MarkLogic Data Hub Central')).toBeInTheDocument();
        expect(getByText('Load')).toBeInTheDocument();
        expect(getByLabelText('load-icon')).toBeInTheDocument();
        expect(getByText('Model')).toBeInTheDocument();
        expect(getByLabelText('model-icon')).toBeInTheDocument();
        expect(getByText('Curate')).toBeInTheDocument();
        expect(getByLabelText('curate-icon')).toBeInTheDocument();
        expect(getByText('Run')).toBeInTheDocument();
        expect(getByLabelText('run-icon')).toBeInTheDocument();
        expect(getByText('Explore')).toBeInTheDocument();
        expect(getByLabelText('explore-icon')).toBeInTheDocument();

    });

    it('Verify enabled cards are clickable', async () => {

        const history = createMemoryHistory();
        history.push('/tiles'); // initial state

        let enabled = ['load', 'model', 'curate', 'run', 'explore']
        const {getByLabelText} = render(<Router history={history}><Overview enabled={enabled}/></Router>);

        enabled.forEach((card, i) => {
            expect(getByLabelText(card + "-card")).toHaveClass(`enabled`);
            fireEvent.click(getByLabelText(card + "-card"));
            expect(history.location.pathname).toEqual(`/tiles/${card}`);
        })

    });

    it('Verify disabled cards are not clickable', async () => {

        const history = createMemoryHistory();
        history.push('/tiles'); // initial state

        let disabled = ['load', 'model', 'curate', 'run', 'explore']
        const {getByLabelText} = render(<Router history={history}><Overview enabled={[]}/></Router>);

        disabled.forEach((card, i) => {
            expect(getByLabelText(card + "-card")).toHaveClass(`disabled`);
            fireEvent.click(getByLabelText(card + "-card"));
            expect(history.location.pathname).toEqual(`/tiles`); // no change
        })

    });

});
