import React, {useContext, useEffect} from "react";
import {SearchContext} from "@util/search-context";
import styles from "./selected-facets.module.scss";
import dayjs from "dayjs";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckSquare, faWindowClose} from "@fortawesome/free-solid-svg-icons";
import {XLg} from "react-bootstrap-icons";
import {HCButton, HCTooltip} from "@components/common";
import {getUserPreferences, updateUserPreferences} from "../../services/user-preferences";
import {UserContext} from "@util/user-context";
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
    clearAllFacetsLS,
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

  const {user} = useContext(UserContext);

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
    clearAllFacetsLS();
  };

  const clearGreyFacets = () => {
    clearAllGreyFacets();
    props.toggleApplyClicked(true);
    props.toggleApply(false);

    const defaultPreferences = getUserPreferences(user.name);
    if (defaultPreferences !== null) {
      let oldOptions = JSON.parse(defaultPreferences);
      let newOptions = {
        ...oldOptions, preselectedFacets: undefined
      };
      updateUserPreferences(user.name, newOptions);
    }
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
        let facetName = item.displayName ? item.displayName : (item.constraint === "RelatedConcepts" ? "Concept" : item.constraint);
        let facetLabel = item.constraint === "RelatedConcepts" ? item.facet.split("/").pop() : item.facet;
        if (facetName === "createdOnRange") {
          let dateValues: any = [];
          if (item.facet.rangeValues.lowerBound && item.facet.rangeValues.upperBound) {
            const startDate = dayjs(item.facet.rangeValues.lowerBound).format("YYYY-MM-DD");
            const endDate = dayjs(item.facet.rangeValues.upperBound).format("YYYY-MM-DD");
            dateValues.push(startDate, endDate);
          } else {
            dateValues.push(item.facet.stringValues[0]);
          }
          return (
            <HCButton
              size="sm"
              variant="outline-blue"
              className={styles.facetButton}
              key={index}
              onClick={() => clearDateFacet()}
              data-cy="clear-date-facet"
              data-testid="clear-date-facet"
            >
              {dateValues.join(" ~ ")}
              <XLg className={styles.closeTime} />
            </HCButton>
          );
        } else if (item.rangeValues) {
          if (dayjs(item.rangeValues.lowerBound).isValid() && dayjs(item.rangeValues.upperBound).isValid()) {
            let dateValues: any = [];
            dateValues.push(item.rangeValues.lowerBound, item.rangeValues.upperBound);
            return (
              <HCButton
                size="sm"
                variant="outline-blue"
                className={styles.facetButton}
                key={index}
                onClick={() => clearRangeFacet(item.constraint)}
                data-cy={`clear-${item.rangeValues.lowerBound}`}
                data-testid={`clear-${item.displayName}`}
              >
                {facetName + ": " + item.rangeValues.lowerBound + " ~ " + item.rangeValues.upperBound}
                <XLg className={styles.close} />
              </HCButton>
            );
          } else {
            return (
              <HCButton
                size="sm"
                variant="outline-blue"
                className={styles.facetButton}
                key={index}
                onClick={() => clearRangeFacet(item.constraint)}
                data-cy={`clear-${item.rangeValues.lowerBound}`}
                data-testid="clear-range-facet"
              >
                {facetName + ": " + item.rangeValues.lowerBound + " - " + item.rangeValues.upperBound}
                <XLg className={styles.close} />
              </HCButton>
            );
          }
        }
        return (
          <HCButton
            size="sm"
            variant="outline-blue"
            className={styles.facetButton}
            key={index}
            onClick={() => clearFacet(item.constraint, item.facet)}
            data-cy={`clear-${facetLabel}`}
            data-testid={`clear-${facetLabel}`}
          >
            {facetName + ": " + facetLabel}
            <XLg className={styles.close} />
          </HCButton>
        );
      })}
      {props.greyFacets.map((item, index) => {
        let facetName = item.displayName ? item.displayName : (item.constraint === "RelatedConcepts" ? "Concept" : item.constraint);
        let facetLabel = item.constraint === "RelatedConcepts" ? item.facet.split("/").pop() : item.facet;
        if (item.constraint === "createdOnRange") {
          let dateValues: any = [];
          if (item.facet.rangeValues.lowerBound && item.facet.rangeValues.upperBound) {
            const startDate = dayjs(item.facet.rangeValues.lowerBound).format("YYYY-MM-DD");
            const endDate = dayjs(item.facet.rangeValues.upperBound).format("YYYY-MM-DD");
            dateValues.push(startDate, endDate);
          } else {
            dateValues.push(item.facet.stringValues[0]);
          }
          return ((unCheckRest(item.constraint, item.facet)) &&
            <HCButton
              size="sm"
              variant="outline-blue"
              className={styles.facetGreyButton}
              key={index}
              onClick={() => clearGreyDateFacet()}
              data-cy="clear-date-facet"
              data-testid="clear-date-facet"
            >
              {dateValues.join(" ~ ")}
              <XLg className={styles.close} />
            </HCButton>
          );
        } else if (item.rangeValues) {
          if (dayjs(item.rangeValues.lowerBound).isValid() && dayjs(item.rangeValues.upperBound).isValid()) {
            let dateValues: any = [];
            dateValues.push(item.rangeValues.lowerBound, item.rangeValues.upperBound);
            return ((unCheckRest(item.constraint, item.facet, item.rangeValues)) &&
              <HCButton
                size="sm"
                variant="outline-blue"
                className={styles.facetGreyButton}
                key={index}
                onClick={() => clearGreyRangeFacet(item.constraint)}
                data-cy={`clear-grey-${item.rangeValues.lowerBound}`}
              >
                {facetName + ": " + item.rangeValues.lowerBound + " ~ " + item.rangeValues.upperBound}
                <XLg className={styles.close} />
              </HCButton>
            );
          } else {
            return ((unCheckRest(item.constraint, item.facet)) &&
              <HCButton
                size="sm"
                variant="outline-blue"
                className={styles.facetGreyButton}
                key={index}
                onClick={() => clearGreyRangeFacet(item.constraint)}
                data-cy="clear-range-facet"
                data-testid="clear-range-facet"
              >
                {facetName + ": " + item.rangeValues.lowerBound + " - " + item.rangeValues.upperBound}
                <XLg className={styles.close} />
              </HCButton>
            );
          }
        }
        return (
          (unCheckRest(item.constraint, item.facet)) &&
          <HCTooltip
            id={index + "-" + item.facet}
            key={index + "-" + item.facet}
            text={"Not yet applied"}
            placement={"top"}
          >
            <span>
              <HCButton
                size="sm"
                variant="outline-blue"
                className={styles.facetGreyButton}
                key={index}
                onClick={() => clearGreyFacet(item.constraint, item.facet)}
                data-cy={`clear-grey-${facetLabel}`}
                data-testid={`clear-grey-${facetLabel}`}
              >
                {facetName + ": " + facetLabel}
                <XLg className={styles.close} />
              </HCButton>
            </span>
          </HCTooltip>
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
            size="lg"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                clearGreyFacets();
              }
            }}
          /></i>
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
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                applyFacet();
              }
            }}
          /></i>
        </HCTooltip>
      }
    </div>
  );
};

export default SelectedFacets;
