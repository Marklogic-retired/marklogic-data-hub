import React from 'react';
import {fireEvent, render, wait } from "@testing-library/react";
import Query from "./queries";

describe('Queries Component', () => {
    test('Verify save query button does not exist', () => {
        const { queryByTitle } = render(<Query
            isSavedQueryUser={false}
            selectedFacets={[{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            greyFacets={[{constraint: "lastname", facet: "paul", displayName: ''},
                {constraint: "lastname", facet: "avalon", displayName: ''}]}
        />);
        expect(queryByTitle('save-query')).not.toBeInTheDocument();
    });

    test('Verify edit query button does not exist', () => {
        const { queryByTitle } = render(<Query
            isSavedQueryUser={false}
            selectedFacets={[{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            greyFacets={[]}
        />);
        expect(queryByTitle('edit-query')).not.toBeInTheDocument();
    });

    test('Verify discard changes button does not exist', () => {
        const { queryByTitle } = render(<Query
            isSavedQueryUser={false}
            selectedFacets={[{constraint: "lastname", facet: "Adams", displayName: ''},
                {constraint: "lastname", facet: "Coleman", displayName: ''}]}
            greyFacets={[{constraint: "lastname", facet: "paul", displayName: ''},
                {constraint: "lastname", facet: "avalon", displayName: ''}]}
        />);
        expect(queryByTitle('discard-changes')).not.toBeInTheDocument();
    });
});
