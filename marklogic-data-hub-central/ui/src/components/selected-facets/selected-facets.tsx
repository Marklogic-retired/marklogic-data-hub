import React, {useContext, useEffect} from "react";
import {Icon, Tooltip} from "antd";
import {SearchContext} from "../../util/search-context";
import styles from "./selected-facets.module.scss";
import moment from "moment";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckSquare, faWindowClose} from "@fortawesome/free-solid-svg-icons";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";
import HCButton from "../common/hc-button/hc-button";



interface Props {
  selectedFacets: any[];
  greyFacets: any[];
  toggleApply: (clicked: boolean) => void;
  toggleApplyClicked: (clicked: boolean) => void;
  showApply: boolean
  applyClicked: boolean
}

const SelectedFacets: React.FC<Props> = (props) => {
  const {
    clearFacet,
    searchOptions,
    clearDateFacet,
    clearRangeFacet,
    clearAllGreyFacets,
    clearGreyFacet,
    clearGreyDateFacet,
    clearGreyRangeFacet,
    greyedOptions,
    setAllSearchFacets,
  } = useContext(SearchContext);

  useEffect(() => {
    if ((props.greyFacets.length > 0 || props.selectedFacets.length > 0) && (!props.applyClicked)) {
      props.toggleApply(true);
    } else {
      props.toggleApply(false);
    }
    props.toggleApplyClicked(false);
  }, [props.greyFacets]);


  const applyFacet = () => {
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
    props.toggleApplyClicked(true);
    props.toggleApply(false);
  };

  const clearGreyFacets = () => {
    clearAllGreyFacets();
    props.toggleApplyClicked(true);
    props.toggleApply(false);
  };


  const unCheckRest = (constraint, facet, rangeValues: any = {}) => {
    if (props.selectedFacets.length === 0) { return true; }
    for (let item of props.selectedFacets) {
      if (item.rangeValues && JSON.stringify(rangeValues) === JSON.stringify(item.rangeValues)) { return false; }
      if (item.constraint === constraint && item.facet !== undefined && item.facet === facet) { return false; }
    }
    return true;
  };

  return (
    <div
      id="selected-facets"
      data-testid="selected-facet-block"
      data-cy="selected-facet-block"
      className={styles.clearContainer}
      style={(Object.entries(searchOptions.selectedFacets).length === 0 && Object.entries(greyedOptions.selectedFacets).length === 0) ? {"visibility": "hidden"} : {"visibility": "visible"}}
    >
      {props.selectedFacets.map((item, index) => {
        let facetName = item.displayName ? item.displayName : item.constraint;
        if (facetName === "createdOnRange") {
          let dateValues: any = [];
          if (item.facet.rangeValues.lowerBound && item.facet.rangeValues.upperBound) {
            const startDate = moment(item.facet.rangeValues.lowerBound).format("YYYY-MM-DD");
            const endDate = moment(item.facet.rangeValues.upperBound).format("YYYY-MM-DD");
            dateValues.push(startDate, endDate);
          } else {
            dateValues.push(item.facet.stringValues[0]);
          }
          return (
            <HCButton
              size="sm"
              variant="outline-light"
              className={styles.dateFacet}
              key={index}
              onClick={() => clearDateFacet()}
              data-cy="clear-date-facet"
              data-testid="clear-date-facet"
            >
              {dateValues.join(" ~ ")}
              <Icon type="close" />
            </HCButton>
          );
        } else if (item.rangeValues) {
          if (moment(item.rangeValues.lowerBound).isValid() && moment(item.rangeValues.upperBound).isValid()) {
            let dateValues: any = [];
            dateValues.push(item.rangeValues.lowerBound, item.rangeValues.upperBound);
            return (
              <HCButton
                size="sm"
                variant="outline-light"
                className={styles.dateFacet}
                key={index}
                onClick={() => clearRangeFacet(item.constraint)}
                data-cy={`clear-${item.rangeValues.lowerBound}`}
                data-testid={`clear-${item.displayName}`}
              >
                {facetName + ": " + item.rangeValues.lowerBound + " ~ " + item.rangeValues.upperBound}
                <Icon type="close" />
              </HCButton>
            );
          } else {
            return (
              <HCButton
                size="sm"
                variant="outline-light"
                className={styles.facetButton}
                key={index}
                onClick={() => clearRangeFacet(item.constraint)}
                data-cy={`clear-${item.rangeValues.lowerBound}`}
                data-testid="clear-range-facet"
              >
                {facetName + ": " + item.rangeValues.lowerBound + " - " + item.rangeValues.upperBound}
                <Icon type="close" />
              </HCButton>
            );
          }
        }
        return (
          <HCButton
            size="sm"
            variant="outline-light"
            className={styles.facetButton}
            key={index}
            onClick={() => clearFacet(item.constraint, item.facet)}
            data-cy={`clear-${item.facet}`}
            data-testid={`clear-${item.facet}`}
          >
            {facetName + ": " + item.facet}
            <Icon type="close" />
          </HCButton>
        );
      })}
      {props.greyFacets.map((item, index) => {
        let facetName = item.displayName ? item.displayName : item.constraint;
        if (item.constraint === "createdOnRange") {
          let dateValues: any = [];
          if (item.facet.rangeValues.lowerBound && item.facet.rangeValues.upperBound) {
            const startDate = moment(item.facet.rangeValues.lowerBound).format("YYYY-MM-DD");
            const endDate = moment(item.facet.rangeValues.upperBound).format("YYYY-MM-DD");
            dateValues.push(startDate, endDate);
          } else {
            dateValues.push(item.facet.stringValues[0]);
          }
          return ((unCheckRest(item.constraint, item.facet)) &&
            <HCButton
              size="sm"
              variant="outline-light"
              className={styles.facetGreyButton}
              key={index}
              onClick={() => clearGreyDateFacet()}
              data-cy="clear-date-facet"
              data-testid="clear-date-facet"
            >
              {dateValues.join(" ~ ")}
              <Icon type="close" />
            </HCButton>
          );
        } else if (item.rangeValues) {
          if (moment(item.rangeValues.lowerBound).isValid() && moment(item.rangeValues.upperBound).isValid()) {
            let dateValues: any = [];
            dateValues.push(item.rangeValues.lowerBound, item.rangeValues.upperBound);
            return ((unCheckRest(item.constraint, item.facet, item.rangeValues)) &&
              <HCButton
                size="sm"
                variant="outline-light"
                className={styles.facetGreyButton}
                key={index}
                onClick={() => clearGreyRangeFacet(item.constraint)}
                data-cy={`clear-grey-${item.rangeValues.lowerBound}`}
              >
                {facetName + ": " + item.rangeValues.lowerBound + " ~ " + item.rangeValues.upperBound}
                <Icon type="close" />
              </HCButton>
            );
          } else {
            return ((unCheckRest(item.constraint, item.facet)) &&
              <HCButton
                size="sm"
                variant="outline-light"
                className={styles.facetGreyButton}
                key={index}
                onClick={() => clearGreyRangeFacet(item.constraint)}
                data-cy="clear-range-facet"
                data-testid="clear-range-facet"
              >
                {facetName + ": " + item.rangeValues.lowerBound + " - " + item.rangeValues.upperBound}
                <Icon type="close" />
              </HCButton>
            );
          }
        }
        return (
          (unCheckRest(item.constraint, item.facet)) &&
          <Tooltip
            key={index + "-" + item.facet}
            title={"Not yet applied"}
          >
            <HCButton
              size="sm"
              variant="outline-light"
              className={styles.facetGreyButton}
              key={index}
              onClick={() => clearGreyFacet(item.constraint, item.facet)}
              data-cy={`clear-grey-${item.facet}`}
              data-testid={`clear-grey-${item.facet}`}
            >
              {facetName + ": " + item.facet}
              <Icon type="close" />
            </HCButton>
          </Tooltip>
        );
      })}
      {props.greyFacets.length > 0 &&
        <HCTooltip text="Clear unapplied facets" id="clear-facets-toolbar" placement="top">
          <i><FontAwesomeIcon
            icon={faWindowClose}
            onClick={clearGreyFacets}
            data-cy="clear-all-grey-button"
            data-testid="clear-all-grey-button"
            className={styles.closeIcon}
            size="lg" /></i>
        </HCTooltip>
      }
      {props.greyFacets.length > 0 &&
        <HCTooltip text="Apply facets" id="apply-facets-tooltip" placement="top">
          <i><FontAwesomeIcon
            icon={faCheckSquare}
            onClick={() => applyFacet()}
            size="lg"
            className={styles.checkIcon}
            data-cy="facet-apply-button"
            data-testid="facet-apply-button"
          /></i>
        </HCTooltip>
      }
    </div>
  );
};

export default SelectedFacets;
