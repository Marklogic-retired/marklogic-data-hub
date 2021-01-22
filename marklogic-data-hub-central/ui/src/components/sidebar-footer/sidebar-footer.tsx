import React, {useContext} from "react";
import styles from "./sidebar-footer.module.scss";
import {MLButton, MLDivider} from "@marklogic/design-system";
import {SearchContext} from "../../util/search-context";


const SidebarFooter: React.FC = () => {
  const {
    searchOptions,
    greyedOptions,
    clearAllFacets,
    setAllSearchFacets,
    clearAllGreyFacets,
  } = useContext(SearchContext);

  const applyFacets = () => {
    let facets = {...greyedOptions.selectedFacets};
    for (let constraint in searchOptions.selectedFacets) {
      if (facets.hasOwnProperty(constraint)) {
        if (searchOptions.selectedFacets[constraint].hasOwnProperty("rangeValues")) { continue; }
        for (let sValue of searchOptions.selectedFacets[constraint].stringValues) {
          if (facets[constraint].stringValues.indexOf(sValue) === -1) { facets[constraint].stringValues.push(sValue); }
        }
      } else { facets[constraint] = searchOptions.selectedFacets[constraint]; }
    }
    setAllSearchFacets(facets);
    clearAllGreyFacets();
  };

  return (
    <div>
      <MLDivider style={{"backgroundColor": "#CCCCCC", "height": "1px", "opacity": "0.5", "margin": "10px 0px 0px 0px"}} />
      <div className={styles.facetFooter}>
        <MLButton className={styles.button} aria-label="clear-facets-button" disabled={Object.keys(searchOptions.selectedFacets).length === 0 && Object.keys(greyedOptions.selectedFacets).length === 0} onClick={() => clearAllFacets()}>Clear All Facets</MLButton>
        <MLButton className={styles.button} aria-label="apply-facets-button" disabled={Object.keys(greyedOptions.selectedFacets).length === 0} onClick={() => applyFacets()} type="primary" >Apply Facets</MLButton>
      </div>
    </div>
  );
};

export default SidebarFooter;
