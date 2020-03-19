import React from 'react';
import { render } from '@testing-library/react';
import DateTimeFacet from './date-time-facet';

describe("DateTime facet", () => {

    test("DateTime facet component renders without crashing", async () => {
        const {getByTestId} = render(<DateTimeFacet
            name={'date-facet'}
            constraint={'date-facet'}
            datatype={'date'}
            key={'0'}
            onChange={jest.fn()}
            applyAllFacets={jest.fn()}
        />);

        const dateFacet = getByTestId("facet-date-time-picker");
        expect(dateFacet).toBeInTheDocument();
        expect(dateFacet).toHaveTextContent('date-facet')
    });

});