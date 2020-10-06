import React from 'react';
import {render, fireEvent, getByPlaceholderText, wait} from '@testing-library/react';
import PopOverSearch from './pop-over-search';
import axiosMock from 'axios';
import {stringSearchResponse} from "../../assets/mock-data/explore/facet-props";
jest.mock('axios');


describe("<PopOverSearch/>", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Popover component renders without crashing, has an input field and a checked icon", async () => {
        axiosMock.post['mockImplementationOnce'](jest.fn(() => Promise.resolve({status: 200, data: stringSearchResponse})));
        const {getByText, getByPlaceholderText, getByLabelText} = render(<PopOverSearch
            referenceType={'path'}
            entityTypeId={'http://example.org/Customer-0.0.1/Customer'}
            propertyPath={'name'}
            checkFacetValues={jest.fn()}
            popOvercheckedValues={[]}
            facetValues= {[]}
            facetName={''}
            database='final'
        />);
        expect(getByText("Search")).toBeInTheDocument();
        fireEvent.click(getByText("Search"));
        let inputField = getByPlaceholderText('Search');
        await wait(() => {
            fireEvent.change(inputField, { target: {value: 'ad'} });
        });
        let url = "/api/entitySearch/facet-values?database=final";
        let payload = {
            'referenceType':'path',
            'entityTypeId':'http://example.org/Customer-0.0.1/Customer',
            'propertyPath':'name',
            'limit':10,
            'dataType':'string',
            'pattern':'ad'
        };
        expect(axiosMock.post).toHaveBeenCalledWith(url, payload);
        expect(axiosMock.post).toHaveBeenCalledTimes(1);
        expect(getByText('Adams Cole')).toBeInTheDocument();
        expect(getByLabelText('icon: check-square-o')).toBeInTheDocument();
    });

});


