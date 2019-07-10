import React from 'react';
import Counter from '../components/test';

const Home: React.FC = () => {
  return (
    <div>
      Home View
      <Counter initial={10}/>
    </div>
  );
}

export default Home;