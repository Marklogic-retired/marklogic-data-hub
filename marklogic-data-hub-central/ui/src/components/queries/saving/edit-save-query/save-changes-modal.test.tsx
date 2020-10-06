import React from 'react';
import {fireEvent, render, wait} from "@testing-library/react";
import SaveChangesModal from "./save-changes-modal";
import axiosMock from 'axios';
import {saveQueryResponse, putQueryResponse, duplicateQueryNameErrorResponse} from "../../../../assets/mock-data/explore/query";
import userEvent from "@testing-library/user-event";
jest.mock('axios');


describe("<SaveChangesModal/>", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    let queryField, queryDescription, saveButton;
    let currentQuery = saveQueryResponse;

    test("Verify Save Changes modal fields are rendered with previous saved query values", async () => {
        const { getByPlaceholderText,getByText } = render(<SaveChangesModal
            setSaveChangesModalVisibility={jest.fn()}
            savedQueryList={[]}
            getSaveQueryWithId ={jest.fn()}
            greyFacets= { [{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            toggleApply={jest.fn()}
            toggleApplyClicked={jest.fn()}
            setSaveNewIconVisibility={jest.fn()}
            currentQuery={currentQuery}
            currentQueryName={''}
            setCurrentQueryName={jest.fn()}
            setCurrentQueryDescription={jest.fn()}
            nextQueryName = {''}
            setCurrentQueryOnEntityChange={jest.fn()}
            toggleEntityQueryUpdate={jest.fn()}
            entityQueryUpdate={false}
            isSaveQueryChanged={jest.fn()}
            resetYesClicked={false}
        />);
        queryField = getByPlaceholderText("Enter query name");
        expect(queryField).toHaveAttribute('value', 'Order query');
        queryDescription = getByPlaceholderText("Enter query description");
        expect(queryDescription).toHaveAttribute('value', 'saved order query');
        expect(getByText('Apply before saving')).toBeVisible();
        expect(getByText('Save as is, keep unapplied facets')).toBeVisible();
        expect(getByText('Discard unapplied facets')).toBeVisible();
    });

    test("Verify save changes modal details can be edited and saved", async () => {
        axiosMock.put['mockImplementationOnce'](jest.fn(() => Promise.resolve({status: 200, data: putQueryResponse})));

        const { getByPlaceholderText, getByText } = render(<SaveChangesModal
            setSaveChangesModalVisibility={jest.fn()}
            savedQueryList={[]}
            getSaveQueryWithId ={jest.fn()}
            greyFacets= { []}
            toggleApply={jest.fn()}
            toggleApplyClicked={jest.fn()}
            setSaveNewIconVisibility={jest.fn()}
            currentQuery={currentQuery}
            currentQueryName={''}
            setCurrentQueryName={jest.fn()}
            setCurrentQueryDescription={jest.fn()}
            nextQueryName = {''}
            setCurrentQueryOnEntityChange={jest.fn()}
            toggleEntityQueryUpdate={jest.fn()}
            entityQueryUpdate={false}
            isSaveQueryChanged={jest.fn()}
            resetYesClicked={false}
            setColumnSelectorTouched={jest.fn()}
        />);
        queryField = getByPlaceholderText("Enter query name");
        fireEvent.change(queryField, { target: {value: ''} });
        fireEvent.change(queryField, { target: {value: 'Edit new query'} });
        expect(queryField).toHaveAttribute('value', 'Edit new query');
        queryDescription = getByPlaceholderText("Enter query description");
        expect(queryDescription).toHaveAttribute('value', 'saved order query');
        await wait(() => {
            userEvent.click(getByText('Save'));
        });
       let payload = {
                "savedQuery": {
                    "id": "",
                    "name": "Edit new query",
                    "description": "saved order query",
                    "query": {
                       "entityTypeIds": [],
                        "searchText": "",
                         "selectedFacets": {},
                    },
                    "propertiesToDisplay": [],
                    "sortOrder": []
                }
        };


        let url = "/api/entitySearch/savedQueries";
        expect(axiosMock.put).toHaveBeenCalledWith(url, payload);
        expect(axiosMock.put).toHaveBeenCalledTimes(1);
    });

    test("Verify save changes modal throws error with duplicate query name", async () => {
        axiosMock.put['mockImplementationOnce'](jest.fn(() =>
            Promise.reject({ response: {status: 400, data: duplicateQueryNameErrorResponse } })));

        const { getByPlaceholderText, getByText } = render(<SaveChangesModal
            setSaveChangesModalVisibility={jest.fn()}
            savedQueryList={[]}
            getSaveQueryWithId ={jest.fn()}
            greyFacets= { [{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            toggleApply={jest.fn()}
            toggleApplyClicked={jest.fn()}
            setSaveNewIconVisibility={jest.fn()}
            currentQuery={currentQuery}
            currentQueryName={''}
            setCurrentQueryName={jest.fn()}
            setCurrentQueryDescription={jest.fn()}
            nextQueryName = {''}
            setCurrentQueryOnEntityChange={jest.fn()}
            toggleEntityQueryUpdate={jest.fn()}
            entityQueryUpdate={false}
            isSaveQueryChanged={jest.fn()}
            resetYesClicked={false}
            setColumnSelectorTouched={jest.fn()}
        />);
        queryField = getByPlaceholderText("Enter query name");
        fireEvent.change(queryField, { target: {value: 'Edit new query'} });
        await wait(() => {
            userEvent.click(getByText('Save'));
        });
        let payload = {
            "savedQuery": {
                "id": "",
                "name": "Edit new query",
                "description": "saved order query",
                "query": {
                    "entityTypeIds": [],
                    "searchText": "",
                    "selectedFacets": {},
                },
                "propertiesToDisplay": [],
                "sortOrder": [],
            }
        };


        let url = "/api/entitySearch/savedQueries";
        expect(axiosMock.put).toHaveBeenCalledWith(url, payload);
        expect(axiosMock.put).toHaveBeenCalledTimes(1);
        expect(getByText('You already have a saved query with a name of edit new query')).toBeInTheDocument();
    });

});
