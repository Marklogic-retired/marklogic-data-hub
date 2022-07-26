import React from "react";

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
    <div className="occupations">
        Occupations content...
    </div>
  );
};

export default Occupations;
