import React from 'react';
import { render } from '@testing-library/react';
import NumericFacet from './numeric-facet';
//jest.mock('./numeric-facet')

describe("<NumericFacet/>", () => {

    test("Numeric component renders without crashing, has range slider", () => {
        const {getByTestId} = render(<NumericFacet
            name={''}
            step={0}
            constraint={''}
            datatype={''}
            onChange={jest.fn()}
            applyAllFacets={jest.fn()}
            referenceType={''}
            entityTypeId={''}
            propertyPath={''}
        />);
        expect(getByTestId("numeric-slider")).toBeInTheDocument();
    })

});


