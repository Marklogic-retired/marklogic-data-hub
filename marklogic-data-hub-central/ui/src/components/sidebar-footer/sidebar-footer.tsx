import React, {useContext} from "react";
import styles from "./sidebar-footer.module.scss";
import {SearchContext} from "../../util/search-context";
import {MonitorContext} from "../../util/monitor-context";
import {HCButton, HCDivider} from "@components/common";

const SidebarFooter: React.FC = () => {
  const {
    searchOptions,
    greyedOptions,
    clearAllFacets,
    setSearchOptions,
    clearAllGreyFacets,
    setQuery,
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
    if (Object.keys(facets).length !== 0) {
      for (let constraint in searchOptions.selectedFacets) {
        if (facets.hasOwnProperty(constraint)) {
          if (searchOptions.selectedFacets[constraint].hasOwnProperty("rangeValues")) { continue; }
          for (let sValue of searchOptions.selectedFacets[constraint].stringValues) {
            if (facets[constraint].stringValues.indexOf(sValue) === -1) { facets[constraint].stringValues.push(sValue); }
          }
        } else { facets[constraint] = searchOptions.selectedFacets[constraint]; }
      }
      setSearchOptions({
        ...searchOptions,
        query: greyedOptions.query,
        selectedFacets: facets,
        start: 1,
        pageNumber: 1,
        pageLength: searchOptions.pageSize
      });
      clearAllGreyFacets();
    } else {
      if (greyedOptions.query !== searchOptions.query) setQuery(greyedOptions.query);
    }

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

  const clearFacets = () => {
    clearAllFacets();
    setQuery("");
  };

  return (
    <div>
      <HCDivider style={{"backgroundColor": "#CCCCCC", "height": "1px", "opacity": "0.5", "margin": "10px 0px 0px 0px"}} />
      <div className={styles.facetFooter}>
        <HCButton variant="outline-light" size="sm" aria-label="clear-facets-button" disabled={searchOptions.tileId === "explore" ?
          (Object.keys(searchOptions.selectedFacets).length === 0 && Object.keys(greyedOptions.selectedFacets).length === 0 && greyedOptions.query === "")
          : (Object.keys(monitorOptions.selectedFacets).length === 0 && Object.keys(monitorGreyedOptions.selectedFacets).length === 0)} onClick={searchOptions.tileId === "explore" ? () => clearFacets() : () => clearAllMonitorFacets()}>Clear All Facets</HCButton>
        <HCButton className={styles.button} size="sm" aria-label="apply-facets-button" disabled={searchOptions.tileId === "explore" ? (Object.keys(greyedOptions.selectedFacets).length === 0 && greyedOptions.query === searchOptions.query) : Object.keys(monitorGreyedOptions.selectedFacets).length === 0} onClick={searchOptions.tileId === "explore" ? () => applyFacets() : () => applyMonitorFacets()} variant="primary" >Apply Facets</HCButton>
      </div>
    </div>
  );
};

export default SidebarFooter;
