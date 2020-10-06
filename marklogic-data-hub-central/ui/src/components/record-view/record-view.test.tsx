import React from 'react';
import { render, fireEvent, waitForElement } from '@testing-library/react';
import { entitySearch } from "../../assets/mock-data/explore/entity-search";
import { BrowserRouter as Router } from 'react-router-dom';
import RecordCardView from './record-view';

describe("Raw data card view component", () => {

    test('Raw data card with data renders', async () => {
        const { getByTestId, getByText, getAllByText } = render(
            <Router>
                <RecordCardView
                    data={entitySearch.results}
                />
            </Router>
        );
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

        //verify tooltips
        fireEvent.mouseOver(getByTestId('/Customer/Cust1.json-URI'));
        await waitForElement(() => getByText('/Customer/Cust1.json'));

        fireEvent.mouseOver(getByTestId('/Customer/Cust1.json-InfoIcon'));
        await waitForElement(() => getByText('View info'));

        fireEvent.mouseOver(getByTestId('/Customer/Cust1.json-detailViewIcon'));
        await waitForElement(() => getByText('Detail view'));

        //verify snippet content for json/xml/text docs
        expect(getByTestId('/Customer/Cust1.json-snippet').textContent).toContain(entitySearch.results[0].matches[0]['match-text'][0]);
        expect(getByTestId('/Customer.xml-snippet').textContent).toContain(entitySearch.results[6].matches[0]['match-text'][0]);
        expect(getByTestId('/Customer.txt-snippet').textContent).toContain(entitySearch.results[7].matches[0]['match-text'][0]);

        //verify snippet content for binary doc
        expect(getByTestId('/Customer/Customer.pdf-noPreview').textContent).toContain('No preview available');

        //verify popover metadata info
        fireEvent.click(getByTestId('/Customer/Cust1.json-InfoIcon'));
        expect(getByTestId('/Customer/Cust1.json-sources')).toBeInTheDocument();
        expect(getByText('loadPersonJSON')).toBeInTheDocument();
        expect(getByText('personJSON')).toBeInTheDocument();
        expect(getByText('mapPersonJSON')).toBeInTheDocument();
        expect(getByText('2020-October-09')).toBeInTheDocument();
        //verify popover metadata info for missing properties
        fireEvent.click(getByTestId('/Customer/Cust2.json-InfoIcon'));
        expect(getAllByText('none')).toHaveLength(4);
    });
});