import React from 'react';
import {render } from "@testing-library/react";
import Overview from './Overview';

describe('Overview component', () => {

    test('Verify static display', async () => {

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

});
