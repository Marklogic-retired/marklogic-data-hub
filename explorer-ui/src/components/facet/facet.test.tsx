import React from 'react';
import { shallow } from 'enzyme';
import Facet from './facet';
import { entityFromJSON, facetParser, entityParser } from '../../util/data-conversion';
import modelResponse from '../../assets/mock-data/model-response';
import searchPayloadFacets from '../../assets/mock-data/search-payload-facets';

describe("Facet component", () => {
    let wrapper;
    const parsedModelData = entityFromJSON(modelResponse);
    const entityDefArray = entityParser(parsedModelData);
    const parsedFacets = facetParser(searchPayloadFacets);

    describe('Facet component renders correctly', () => {
      beforeEach(() => {
        const entityDef = entityDefArray.find(entity => entity.name === 'Customer');

        const filteredEntityFacets = entityDef.rangeIndex.length && entityDef.rangeIndex.map( rangeIndex => {
          let entityFacetValues = parsedFacets.find(facet => facet.facetName === rangeIndex);
          return {...entityFacetValues}
        });
        wrapper = shallow(
          <Facet
            name={filteredEntityFacets[0].hasOwnProperty('displayName') ? filteredEntityFacets[0].displayName : filteredEntityFacets[0].facetName}
            constraint={filteredEntityFacets[0].facetName}
            facetValues={filteredEntityFacets[0].facetValues}
            key={filteredEntityFacets[0].facetName}
            tooltip=""
            updateSelectedFacets={jest.fn()}
            applyAllFacets={jest.fn()}
            addFacetValues={jest.fn()}
            referenceType={''}
            entityTypeId={''}
            propertyPath={''}
            facetType={'xs:string'}
            facetCategory={'hub'}
          />
        )
      });
  
      it('should render Checkboxes and item count', () => {
        expect(wrapper.exists('[data-cy="gender-facet"]')).toBe(true);
        expect(wrapper.exists('[data-cy="gender-facet-item-count"]')).toBe(true);
      });
      it('should not render apply button', () => {
        expect(wrapper.exists('[data-cy="gender-facet-apply-button"]')).toBe(false);

      });
    });
})
