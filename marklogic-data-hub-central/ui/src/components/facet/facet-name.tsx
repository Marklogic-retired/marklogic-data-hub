import React from "react";
import styles from "./facet.module.scss";
import {numberConverter} from "@util/number-conversion";
import {stringConverter} from "@util/string-conversion";
import {DynamicIcons, HCCheckbox, HCFacetIndicator} from "@components/common";
import {defaultConceptIcon} from "@config/explore.config";

interface Props {
  category?: string;
  name: string;
  facet: {value: string; count: number; max?: any; name: string};
  checked: string[];
  index: number;
  handleClick: (e: any, constraint?: any, value?: any, facetType?: any) => void;
}

const FacetName: React.FC<Props> = ({category, name, facet, checked, index, handleClick}) => {
  const facetValue: string = category && category === "concept" ? facet.value.split("/").pop()! : facet.value;
  const id = `${stringConverter(name)}-${facetValue}-checkbox`;
  const percentage = isNaN(facet.max) ? 0 : (facet.count * 100) / facet.max;
  const isActive = checked.includes(facet.value);
  const facetLabel =
    category && category === "concept" ? (
      <span>
        <DynamicIcons name={defaultConceptIcon} /> {facet.name}
      </span>
    ) : (
      facet.value
    );
  return (
    <div
      className={styles.checkContainer}
      key={index}
      data-testid={facet.value}
      data-cy={stringConverter(name) + "-facet-item"}
    >
      <HCCheckbox
        id={id}
        handleClick={handleClick}
        handleKeyDown={handleClick}
        value={facet.value}
        label={facetLabel}
        checked={isActive}
        dataTestId={id}
        removeMargin={true}
        tooltip={facetValue?.length > 25 ? facetValue : undefined}
      />
      <div className={styles.count} data-cy={`${stringConverter(name)}-${facet.value}-count`}>
        <HCFacetIndicator percentage={percentage} isActive={isActive} identifier={id} />
        <span className={`${styles.facetCount} d-inline-block text-end`}>
          {facet?.count && numberConverter(facet.count)}
        </span>
      </div>
    </div>
  );
};

export default FacetName;
