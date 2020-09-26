import React from 'react';
import { render } from '@testing-library/react';
import { entitySearch } from "../../../assets/mock-data/entity-search";
import { BrowserRouter as Router } from 'react-router-dom';
import RawDataCardView from './raw-data-card-view';

describe("Raw data card view component", () => {
    test('Raw data card with data renders', () => {
        const { getByTestId } = render(
            <Router>
                <RawDataCardView
                    data={entitySearch.results}
                />
            </Router>
        )
        // Check raw data cards are rendered
        expect(getByTestId('/Customer/Cust1.json-URI')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust1.json-InfoIcon')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust1.json-sourceFormat')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust1.json-detailViewIcon')).toBeInTheDocument();

        expect(getByTestId('/Customer/Cust2.json-URI')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust2.json-InfoIcon')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust2.json-sourceFormat')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust2.json-detailViewIcon')).toBeInTheDocument();

        expect(getByTestId('/Customer/Cust3.json-URI')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust3.json-InfoIcon')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust3.json-sourceFormat')).toBeInTheDocument();
        expect(getByTestId('/Customer/Cust3.json-detailViewIcon')).toBeInTheDocument();
    });
})
