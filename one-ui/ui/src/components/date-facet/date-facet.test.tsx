import React from 'react';
import { render } from '@testing-library/react';
import DateFacet from './date-facet';

describe("Date facet", () => {

    test("Date facet component renders without crashing", async () => {
        const {getByTestId} = render(<DateFacet
            name={'date-facet'}
            constraint={'date-facet'}
            datatype={'date'}
            key={'0'}
            onChange={jest.fn()}
            applyAllFacets={jest.fn()}
        />);

        const dateFacet = getByTestId("facet-date-picker");
        expect(dateFacet).toBeInTheDocument();
        expect(dateFacet).toHaveTextContent('date-facet')
    });

});