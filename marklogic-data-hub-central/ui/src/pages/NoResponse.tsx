import React from 'react';
import styles from './NoResponse.module.scss';

const NoResponse: React.FC = () => {

  return (
    <div className={styles.noResponseContainer} aria-label="noResponse">
      <div className={styles.title}>No response from MarkLogic Server.</div>
      <div className={styles.subtitle}>Contact your administrator.</div>
    </div>
  );
};

export default NoResponse;
