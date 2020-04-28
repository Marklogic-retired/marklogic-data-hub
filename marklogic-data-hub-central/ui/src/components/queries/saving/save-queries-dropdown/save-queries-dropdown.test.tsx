import React from 'react';
import { render } from "@testing-library/react";
import SaveQueryDropdown from './save-queries-dropdown';



describe("<SaveQueryDropdown/>", () => {


    test("Save query dropdown renders without crashing", async () => {
        const { getByTitle } = render(<SaveQueryDropdown
            savedQueryList={[]}
            greyFacets= {[]}
            toggleApply={jest.fn()}
            currentQueryName={''}
            setCurrentQueryName={jest.fn()}
            setCurrentQueryFn={jest.fn()}
            currentQuery={{}}
            setSaveNewIconVisibility={jest.fn()}
        />)

        expect(getByTitle("select a query")).toBeInTheDocument();
    });

});
