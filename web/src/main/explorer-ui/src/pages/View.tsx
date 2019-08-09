import React from 'react';
import ViewEntities from '../components/view-entities/view-entities';
import exampleEntity from '../assets/entity';

const Browse: React.FC = () => {

  const test = exampleEntity;

  console.log('exampleEntity', test);


  return <ViewEntities />;
}

export default Browse;