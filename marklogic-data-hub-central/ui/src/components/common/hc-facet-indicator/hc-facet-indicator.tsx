import React from "react";
import styles from "./hc-facet-indicator.module.scss";
import {themeColors} from "@config/themes.config";

interface Props {
  identifier?: string;
  isActive?: boolean;
  percentage: number;
}

const HCFacetIndicator: React.FC<Props> = ({identifier, isActive, percentage}) => {
  return (
    <span aria-label={`${identifier}-hc-facet-indicator`} className={`${styles.hcfiComponent}`} style={{minWidth: 20, width: percentage/2, height: 8, overflow: "hidden"}}>
      <span aria-label={`${identifier}-bar-wrapper`} className={`${styles.hcfiBarWrapper}`}>
        <span
          aria-label={`${identifier}-bar`}
          className={styles.hcfiBar}
          style={{
            width: `${percentage}%`,
            backgroundColor: isActive ? themeColors.facetIndicator.active : themeColors.facetIndicator.inactive
          }}
        >
        </span>
      </span>
    </span>
  );
};

HCFacetIndicator.defaultProps = {
  identifier: "default",
  isActive: false
};

export default HCFacetIndicator;