import React from 'react';
import {shallow} from 'enzyme';
import SelectedFacets from './selected-facets';


describe("Selected Facets", () => {
    let wrapper;

    describe('No facets selected', () => {
        beforeEach(() => {
            wrapper = shallow(
                <SelectedFacets
                    selectedFacets={[]}
                />);
        });

        it('should hide the selected facets panel', () => {
            expect(wrapper.find('#selected-facets').prop('style')).toHaveProperty('visibility', 'hidden')
        })

    })


    describe('If facets are selected', () => {
        const facets = [{constraint: 'Collection', facet: 'productMapping'}];
        beforeEach(() => {
            wrapper = shallow(
                <SelectedFacets
                    selectedFacets={facets}
                />);
        });

        it('should show the selected facets panel', () => {
            expect(wrapper.exists('[data-cy="clear-all-button"]')).toBe(true);
            expect(wrapper.exists('[data-cy="clear-productMapping"]')).toBe(true);
        })

    })


    describe('If date facets are selected', () => {
        const dateFacets = [{constraint: 'createdOnRange', facet: ['2019-10-15', '2019-11-10']}];
        beforeEach(() => {
            wrapper = shallow(
                <SelectedFacets
                    selectedFacets={dateFacets}
                />);
        });

        it('should show selected date facet', () => {
            expect(wrapper.exists('[data-cy="clear-all-button"]')).toBe(true);
            expect(wrapper.exists('[data-cy="clear-date-facet"]')).toBe(true);
        })

    })

})