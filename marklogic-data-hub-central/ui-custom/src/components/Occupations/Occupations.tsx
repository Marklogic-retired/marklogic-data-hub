import React from "react";
import styles from "./Occupations.module.scss";

type Props = {
  data?: any;
  config?: any
};

/**
 * Component for showing occupation information for record.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object[]} config  Array of configuration objects.
 * @example
 * TBD
 */
const Occupations: React.FC<Props> = (props) => {

  return (
    <div className={styles.occupations}>
        Occupations content...
    </div>
  );
};

export default Occupations;
