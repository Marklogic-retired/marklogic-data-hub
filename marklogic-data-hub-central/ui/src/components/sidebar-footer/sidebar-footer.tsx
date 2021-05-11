import React, {useContext} from "react";
import styles from "./sidebar-footer.module.scss";
import {MLButton, MLDivider} from "@marklogic/design-system";
import {SearchContext} from "../../util/search-context";
import {MonitorContext} from "../../util/monitor-context";


const SidebarFooter: React.FC = () => {
  const {
    searchOptions,
    greyedOptions,
    clearAllFacets,
    setAllSearchFacets,
    clearAllGreyFacets,
  } = useContext(SearchContext);
  const {
    monitorOptions,
    monitorGreyedOptions,
    clearAllMonitorFacets,
    setAllMonitorFacets,
    clearAllMonitorGreyFacets,
  } = useContext(MonitorContext);


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

  const applyMonitorFacets = () => {
    let facets = {...monitorGreyedOptions.selectedFacets};
    for (let constraint in monitorOptions.selectedFacets) {
      if (facets.hasOwnProperty(constraint)) {
        for (let sValue of monitorOptions.selectedFacets[constraint]) {
          if (facets[constraint].indexOf(sValue) === -1) { facets[constraint].push(sValue); }
        }
      } else { facets[constraint] = monitorOptions.selectedFacets[constraint]; }
    }
    setAllMonitorFacets(facets);
    clearAllMonitorGreyFacets();
  };

  return (
    <div>
      <MLDivider style={{"backgroundColor": "#CCCCCC", "height": "1px", "opacity": "0.5", "margin": "10px 0px 0px 0px"}} />
      <div className={styles.facetFooter}>
        <MLButton className={styles.button} aria-label="clear-facets-button" disabled={searchOptions.tileId === "explore" ?
          (Object.keys(searchOptions.selectedFacets).length === 0 && Object.keys(greyedOptions.selectedFacets).length === 0)
          : (Object.keys(monitorOptions.selectedFacets).length === 0 && Object.keys(monitorGreyedOptions.selectedFacets).length === 0)} onClick={searchOptions.tileId === "explore" ? () => clearAllFacets() : () => clearAllMonitorFacets()}>Clear All Facets</MLButton>
        <MLButton className={styles.button} aria-label="apply-facets-button" disabled={searchOptions.tileId === "explore" ? Object.keys(greyedOptions.selectedFacets).length === 0 : Object.keys(monitorGreyedOptions.selectedFacets).length === 0} onClick={searchOptions.tileId === "explore" ? () => applyFacets() : () => applyMonitorFacets()} type="primary" >Apply Facets</MLButton>
      </div>
    </div>
  );
};

export default SidebarFooter;
