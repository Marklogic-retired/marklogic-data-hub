import React from 'react';
import ViewEntities from '../components/view-entities/view-entities';
import { entityFromJSON } from '../util/data-conversion';
import modelResponse from '../assets/model-response';

const Browse: React.FC = () => {
  const entities = entityFromJSON(modelResponse);

  return <ViewEntities entities={entities} />;
}

export default Browse;