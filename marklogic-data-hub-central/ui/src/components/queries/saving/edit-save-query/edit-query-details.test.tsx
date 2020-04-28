import React from 'react';
import {fireEvent, render, wait } from "@testing-library/react";
import EditQueryDetails from "./edit-query-details";
import axiosMock from 'axios'
import userEvent from "@testing-library/user-event";
import {putQueryResponse} from "../../../../assets/mock-data/query";
jest.mock('axios');


describe("<EditQueryDetails/>", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    let queryField, queryDescription;
    let currentQuery = {"savedQuery": {
            "description": "save query description",
            "id": "123",
            "name": "save new query",
            "propertiesToDisplay": "['']",
            "query": {
                "entityTypeIds": "",
                "searchText": "",
                "selectedFacets": ""
            }
        }}

    test("Verify Edit Query Detail modal fields are rendered and can take input", async () => {
        const { getByPlaceholderText } = render(<EditQueryDetails
            setEditQueryDetailVisibility={jest.fn()}
            currentQuery={{}}
            currentQueryName={''}
            setCurrentQueryName={jest.fn()}
        />)
        queryField = getByPlaceholderText("Enter new query name");
        fireEvent.change(queryField, { target: {value: 'edit new query'} });
        queryDescription = getByPlaceholderText("Enter new query description");
        fireEvent.change(queryDescription, { target: {value: 'edit query description'} });
        expect(queryField).toHaveAttribute('value', 'edit new query');
        expect(queryDescription).toHaveAttribute('value', 'edit query description');
    });

    test("Verify Edit Query Details can be saved", async () => {
        axiosMock.put.mockImplementationOnce(jest.fn(() => Promise.resolve({status: 200, data: putQueryResponse})));

        const { getByPlaceholderText, getByText } = render(<EditQueryDetails
            setEditQueryDetailVisibility={jest.fn()}
            currentQuery={currentQuery}
            currentQueryName={''}
            setCurrentQueryName={jest.fn()}
        />)
        queryField = getByPlaceholderText("Enter new query name");
        fireEvent.change(queryField, { target: {value: 'edit new query'} });
        queryDescription = getByPlaceholderText("Enter new query description");
        fireEvent.change(queryDescription, { target: {value: 'edit query description'} });
        expect(queryField).toHaveAttribute('value', 'edit new query');
        expect(queryDescription).toHaveAttribute('value', 'edit query description');
        await wait(() => {
            userEvent.click(getByText('Save'));
        });

        let url = "/api/entitySearch/savedQueries";
        let payload = {"savedQuery": {
                    "description": "edit query description",
                    "id": "123",
                    "name": "edit new query",
                    "propertiesToDisplay": "['']",
                    "query": {
                        "entityTypeIds": "",
                        "searchText": "",
                        "selectedFacets": ""
                    }
                }}
        expect(axiosMock.put).toHaveBeenCalledWith(url, payload);
        expect(axiosMock.put).toHaveBeenCalledTimes(1);
    });

});
