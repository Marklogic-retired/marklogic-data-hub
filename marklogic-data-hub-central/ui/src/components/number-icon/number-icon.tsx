import React from 'react';
import styles from './number-icon.module.scss';

type Props = {
  value: number
}

/**
  * Circular number icon that matches the Step Number Icon CSS from the Ant Design Steps component
  * https://3x.ant.design/components/steps/
  * @param value = Step number, works for single digit 0 - 9 only
  * @example 1
  **/
const NumberIcon: React.FC<Props> = (props) => {
  return (
    <div className={styles.numberIcon}>
      <span className={styles.numberValue}>{props.value}</span>
    </div>
  );
};

export default NumberIcon;
