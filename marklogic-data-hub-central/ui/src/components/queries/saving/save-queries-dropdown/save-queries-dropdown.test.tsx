import React from 'react';
import { render } from "@testing-library/react";
import SaveQueryDropdown from './save-queries-dropdown';



describe("<SaveQueryDropdown/>", () => {


    test("Save query dropdown renders without crashing", async () => {
        const { getByTitle } = render(<SaveQueryDropdown
            savedQueryList={[]}
            toggleApply={jest.fn()}
            greyFacets= {[]}
            currentQueryName={''}
            setCurrentQueryName={jest.fn()}
            setCurrentQueryFn={jest.fn()}
            currentQuery={{}}
            setSaveNewIconVisibility={jest.fn()}
            setSaveChangesIconVisibility={jest.fn()}
            setDiscardChangesIconVisibility={jest.fn()}
            currentQueryDescription={''}
            setCurrentQueryDescription={jest.fn()}
        />)

        expect(getByTitle("select a query")).toBeInTheDocument();
    });

});
