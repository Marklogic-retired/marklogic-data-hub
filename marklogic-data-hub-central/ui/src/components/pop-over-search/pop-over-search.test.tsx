import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PopOverSearch from './pop-over-search';

describe("<PopOverSearch/>", () => {

    test("Popover component renders without crashing, has an input field and a checked icon", async () => {
        const {getByTestId} = render(<PopOverSearch
            referenceType={''}
            entityTypeId={''}
            propertyPath={''}
            checkFacetValues={jest.fn()}
        />);
        expect(getByTestId("search-input")).toBeInTheDocument();
        fireEvent.click(getByTestId("search-input"));
        expect(getByTestId("input-field")).toBeInTheDocument();
        expect(getByTestId("check-icon")).toBeInTheDocument();
    });

});


