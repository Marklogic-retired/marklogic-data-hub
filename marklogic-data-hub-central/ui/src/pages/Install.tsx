import React from 'react';
import styles from './Install.module.scss';
import InstallForm from '../components/install-form/install-form';
const Install: React.FC = () => {

  return (
    <div>
      <div className={styles.content}>
        <div className={styles.installContainer}>
          <InstallForm/>
        </div>
      </div>
    </div>
  );
}

export default Install;