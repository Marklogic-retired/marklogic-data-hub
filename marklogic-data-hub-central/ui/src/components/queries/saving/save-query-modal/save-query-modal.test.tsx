import React from 'react';
import {fireEvent, render } from "@testing-library/react";
import SaveQueryModal from './save-query-modal';

describe("<SaveQueryModal/>", () => {

    let queryField, queryDescription;

    test("Verify Save modal fields are rendered and can take input", async () => {
        const { getByPlaceholderText } = render(<SaveQueryModal
            setSaveModalVisibility={jest.fn()}
            saveNewQuery={jest.fn()}
            greyFacets= { [{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            toggleApply= {jest.fn()}
            toggleApplyClicked={jest.fn()}
            currentQueryName= {''}
            setCurrentQueryName={jest.fn()}
            currentQueryDescription={''}
            setCurrentQueryDescription={jest.fn()}
            setSaveNewIconVisibility={jest.fn()}
        />);
        queryField = getByPlaceholderText("Enter query name");
        fireEvent.change(queryField, { target: {value: 'save new query'} });
        queryDescription = getByPlaceholderText("Enter query description");
        fireEvent.change(queryDescription, { target: {value: 'save query description'} });
        expect(queryField).toHaveAttribute('value', 'save new query');
        expect(queryDescription).toHaveAttribute('value', 'save query description');
    });
});
