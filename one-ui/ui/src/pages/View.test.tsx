import React from 'react';
import { render } from '@testing-library/react';
import nock from 'nock';
import View from './View';

import modelResponse from '../assets/mock-data/model-response';
import searchPayloadResults from '../assets/mock-data/search-payload-results';
import latestJobs from '../assets/mock-data/jobs';

describe('View Page', () => {
  const getEntityModel = nock('http://localhost:8080')
  .get('/api/models')
  .reply(200, modelResponse);

  const getSearchResults = nock('http://localhost:8080')
  .post('/api/search', {
    query: {
      searchStr: '',
      entityNames: 'Order',
      facets: {}
    },
    start: 1,
    pageLength: 1,
  })
  .reply(200, searchPayloadResults);

  const getEntityCollectionDetails = nock('http://localhost:8080')
  .get('/api/jobs/models')
  .reply(200, latestJobs);

  test('View', () => {
    const { getByTestId, debug } = render(
      <View />,
    )
    debug()
    // const container = getByTestId('selected-facet-block')
    // expect(container).toHaveStyle('visibility: hidden');
  });

});