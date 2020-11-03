import React from 'react';
import {render, fireEvent, waitForElement, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {AuthoritiesContext, AuthoritiesService} from '../util/authorities';
import axiosMock from 'axios';
import mocks from '../api/__mocks__/mocks.data';
import Curate from "./Curate";
import {MemoryRouter} from "react-router-dom";
import tiles from '../config/tiles.config';

jest.mock('axios');

describe('Curate component', () => {

    beforeEach(() => {
        mocks.curateAPI(axiosMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    test('Verify readMapping authority can only view mapping configs and settings', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readMapping']);

        const { getByText, getAllByText, queryByText, getByTestId, queryByTestId } = await render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Curate/></AuthoritiesContext.Provider></MemoryRouter>);

        expect(await(waitForElement(() => getByText('Customer')))).toBeInTheDocument();

        expect(getByText(tiles.curate.intro)).toBeInTheDocument(); // tile intro text

        // Check for steps to be populated
        expect(axiosMock.get).toBeCalledWith('/api/steps/mapping');
        fireEvent.click(getByText('Customer'));
        //Mapping tab should show. Match/Merge should not
        expect(getByText('Map')).toBeInTheDocument();
        expect(queryByText('Match')).not.toBeInTheDocument();
        expect(queryByText('Merge')).not.toBeInTheDocument();

        expect(getByText('Mapping2')).toBeInTheDocument();

        // test 'Add New' button
        expect(queryByText('Add New')).not.toBeInTheDocument();

        // test edit
        fireEvent.click(getByTestId('Mapping2-edit'));
        expect(await(waitForElement(() => getByText('Mapping Step Settings')))).toBeInTheDocument();
        expect(getAllByText('Save')[0]).toBeDisabled();
        fireEvent.click(getAllByText('Cancel')[0]);

        // test delete
        expect(queryByTestId('Mapping2-delete')).not.toBeInTheDocument();
    });

    test('Verify writeMapping authority can edit mapping configs and settings', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readMapping','writeMapping']);

        const { getByText, queryByText, getByTestId } = await render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Curate/></AuthoritiesContext.Provider></MemoryRouter>);

        expect(await(waitForElement(() => getByText('Customer')))).toBeInTheDocument();
        // Check for steps to be populated
        expect(axiosMock.get).toBeCalledWith('/api/steps/mapping');
        fireEvent.click(getByText('Customer'));
        //Mapping tab should show. Match/Merge should not
        expect(getByText('Map')).toBeInTheDocument();
        expect(queryByText('Match')).not.toBeInTheDocument();
        expect(queryByText('Merge')).not.toBeInTheDocument();

        expect(getByText('Mapping1')).toBeInTheDocument();

        // test 'Add New' button
        expect(getByText('Add New')).toBeInTheDocument();

        // test edit
        fireEvent.click(getByTestId('Mapping1-edit'));
        expect(await(waitForElement(() => getByText('Mapping Step Settings')))).toBeInTheDocument();
        expect(getByTestId('mapping-dialog-save')).not.toBeDisabled();
        fireEvent.click(getByTestId('mapping-dialog-cancel'));

        // test delete
        fireEvent.click(getByTestId('Mapping1-delete'));
        fireEvent.click(getByText('No'));
        fireEvent.click(getByTestId('Mapping1-delete'));
        fireEvent.click(getByText('Yes'));
        expect(axiosMock.delete).toHaveBeenNthCalledWith(1,'/api/steps/mapping/Mapping1');
    });
});
