import React from 'react';
import styles from './Home.module.scss';
const Home: React.FC = () => {

  return (
    <div>
      <div className={styles.content}>
        <div style={{ color: '#666', fontSize: '20px'}}>Authenticated!</div>
      </div>
    </div>
  );
}

export default Home;