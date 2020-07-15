import React, {useContext} from 'react';
import {render, fireEvent, waitForElement, cleanup} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import {AuthoritiesContext, AuthoritiesService} from '../util/authorities';
import axiosMock from 'axios';
import mocks from '../api/__mocks__/mocks.data';
import Curate from "./Curate";
import {MemoryRouter} from "react-router-dom";

jest.mock('axios');

describe('Curate component', () => {

    beforeEach(() => {
        mocks.curateAPI(axiosMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    })

    test('Verify readMapping authority can only view mapping configs and settings', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readMapping']);

        const { getByText, getAllByText, queryByText, getByTestId, queryByTestId, debug } = await render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Curate/></AuthoritiesContext.Provider></MemoryRouter>);

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
        expect(queryByText('Add New')).not.toBeInTheDocument();

        // test settings
        fireEvent.click(getByTestId('Mapping1-settings'));
        expect(await(waitForElement(() => getByText('Target Database')))).toBeInTheDocument();
        expect(getAllByText('Save')[0]).toBeDisabled();
        fireEvent.click(getAllByText('Cancel')[0]);

        //test edit
        fireEvent.click(getByTestId('Mapping1-edit'));
        expect(await(waitForElement(() => getByText('Edit Mapping Step')))).toBeInTheDocument();
        expect(getAllByText('Save')[0]).toBeDisabled();
        fireEvent.click(getAllByText('Cancel')[0]);

        // test delete
        expect(queryByTestId('Mapping1-delete')).not.toBeInTheDocument();
    });

    test('Verify writeMapping authority can edit mapping configs and settings', async () => {
        const authorityService = new AuthoritiesService();
        authorityService.setAuthorities(['readMapping','writeMapping']);

        const { getByText, getAllByText, queryByText, getByTitle, getByTestId } = await render(<MemoryRouter><AuthoritiesContext.Provider value={authorityService}><Curate/></AuthoritiesContext.Provider></MemoryRouter>);

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

        // test settings
        fireEvent.click(getByTestId('Mapping1-settings'));
        expect(await(waitForElement(() => getByText('Target Database')))).toBeInTheDocument();
        expect(getByTestId('Mapping1-save-settings')).not.toBeDisabled();
        fireEvent.click(getByTestId('Mapping1-cancel-settings'));

        //test edit
        fireEvent.click(getByTestId('Mapping1-edit'));
        expect(await(waitForElement(() => getByText('Edit Mapping Step')))).toBeInTheDocument();
        expect(getByTestId('Mapping1-edit-save')).not.toBeDisabled();
        fireEvent.click(getByTestId('Mapping1-edit-cancel'));

        // test delete
        fireEvent.click(getByTestId('Mapping1-delete'));
        fireEvent.click(getByText('No'));
        fireEvent.click(getByTestId('Mapping1-delete'));
        fireEvent.click(getByText('Yes'));
        expect(axiosMock.delete).toHaveBeenNthCalledWith(1,'/api/steps/mapping/Mapping1');
    });
});
