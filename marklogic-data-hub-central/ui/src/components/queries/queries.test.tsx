import React from 'react';
import {fireEvent, render, wait } from "@testing-library/react";
import Query from "./queries";
import { getQueriesResponse } from '../../assets/mock-data/explore/query';

describe('Queries Component', () => {
    test('Verify save query button does not exist', () => {
        const { queryByTitle } = render(<Query
            queries={getQueriesResponse}
            setQueries={jest.fn()}
            isSavedQueryUser={false}
            selectedFacets={[{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            greyFacets={[{constraint: "lastname", facet: "paul", displayName: ''},
                {constraint: "lastname", facet: "avalon", displayName: ''}]}
            setColumnSelectorTouched={jest.fn()}
        />);
        expect(queryByTitle('save-query')).not.toBeInTheDocument();
    });

    test('Verify edit query button does not exist', () => {
        const { queryByTitle } = render(<Query
            queries={getQueriesResponse}
            setQueries={jest.fn()}
            isSavedQueryUser={false}
            selectedFacets={[{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            greyFacets={[]}
            setColumnSelectorTouched={jest.fn()}
        />);
        expect(queryByTitle('edit-query')).not.toBeInTheDocument();
    });

    test('Verify discard changes button does not exist', () => {
        const { queryByTitle } = render(<Query
            queries={getQueriesResponse}
            setQueries={jest.fn()}
            isSavedQueryUser={false}
            selectedFacets={[{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            greyFacets={[{constraint: "lastname", facet: "paul", displayName: ''},
                {constraint: "lastname", facet: "avalon", displayName: ''}]}
            setColumnSelectorTouched={jest.fn()}
        />);
        expect(queryByTitle('discard-changes')).not.toBeInTheDocument();
    });

    test('Verify save changes button does not exist', () => {
        const { queryByTitle } = render(<Query
            queries={getQueriesResponse}
            setQueries={jest.fn()}
            isSavedQueryUser={false}
            selectedFacets={[]}
            greyFacets={[]}
            setColumnSelectorTouched={jest.fn()}
        />);
        expect(queryByTitle('save-changes')).not.toBeInTheDocument();
    });

    test('Verify reset changes button does not exist', () => {
        const { queryByTitle } = render(<Query
            queries={getQueriesResponse}
            setQueries={jest.fn()}
            isSavedQueryUser={false}
            selectedFacets={[]}
            greyFacets={[]}
            setColumnSelectorTouched={jest.fn()}
        />);
        expect(queryByTitle('reset-changes')).not.toBeInTheDocument();
    });

});
