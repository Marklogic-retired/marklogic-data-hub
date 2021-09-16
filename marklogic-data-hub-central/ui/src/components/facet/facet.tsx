import React, {useState, useContext, useEffect} from "react";
import {SearchContext} from "../../util/search-context";
import {FacetName} from "./facet-element";
import styles from "./facet.module.scss";
import {stringConverter} from "../../util/string-conversion";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PopOverSearch from "../pop-over-search/pop-over-search";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";
import {ChevronDown, ChevronRight} from "react-bootstrap-icons";

interface Props {
  name: string;
  facetType: any;
  constraint: string;
  facetValues: any[];
  tooltip: string;
  facetCategory: string;
  referenceType: string;
  entityTypeId: any;
  propertyPath: any;
  updateSelectedFacets: (constraint: string, vals: string[], datatype: string, isNested: boolean, toDelete?: boolean, toDeleteAll?: boolean) => void;
  addFacetValues: (constraint: string, vals: string[], datatype: string, facetCategory: string) => void;
}

const Facet: React.FC<Props> = (props) => {
  const SHOW_MINIMUM = 3;
  const SEARCH_MINIMUM = 20;

  const {searchOptions, greyedOptions} = useContext(SearchContext);
  const [showFacets, setShowFacets] = useState(SHOW_MINIMUM);
  const [show, toggleShow] = useState(true);
  const [more, toggleMore] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  let checkedFacets: any[] = [];

  const setCheckedOptions = (selectedOptions) => {
    let facetName: string = "";
    if (selectedOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      facetName = props.constraint;
    } else if (selectedOptions.selectedFacets.hasOwnProperty(props.propertyPath) && props.constraint !== props.propertyPath) {
      facetName = props.propertyPath;
    }
    if (facetName) {
      if (searchOptions.selectedFacets.length === 0) { setChecked([]); }
      for (let facet in selectedOptions.selectedFacets) {
        if (facet === facetName) {
          let valueType = "";
          if (selectedOptions.selectedFacets[facet].dataType === "xs:string") {
            valueType = "stringValues";
          }
          // TODO add support for non string facets
          const checkedArray = selectedOptions.selectedFacets[facet][valueType];
          if (checkedArray && checkedArray.length) {
            // checking if arrays are equivalent
            if (!(JSON.stringify(checked) === JSON.stringify(checkedArray))) {
              setChecked(checkedArray);
            }
          }
        }
      }
    } else {
      setChecked([]);
    }
  };

  useEffect(() => {
    if (Object.entries(searchOptions.selectedFacets).length !== 0 && searchOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      setCheckedOptions(searchOptions);
    } else if ((Object.entries(greyedOptions.selectedFacets).length === 0 || (!greyedOptions.selectedFacets.hasOwnProperty(props.constraint)))) {
      setChecked([]);
    }
  }, [searchOptions]);

  useEffect(() => {
    if (Object.entries(greyedOptions.selectedFacets).length !== 0 && greyedOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      setCheckedOptions(greyedOptions);
    } else { setCheckedOptions(searchOptions); }
  }, [greyedOptions]);

  const checkFacetValues = (checkedValues) => {
    let updatedChecked = [...checked];
    for (let value of checkedValues) {
      if (updatedChecked.indexOf(value) === -1) { updatedChecked.push(value); }
    }
    setChecked(updatedChecked);
    props.addFacetValues(props.constraint, updatedChecked, props.facetType, props.facetCategory);
  };

  const handleClick = (e) => {
    let index = checked.indexOf(e.target.value);
    let isNested = props.constraint === props.propertyPath ? false : true;
    // Selection
    if (e.target.checked && index === -1) {
      setChecked([...checked, e.target.value]);
      props.updateSelectedFacets(props.constraint, [...checked, e.target.value], props.facetType, isNested);
    } else if (index !== -1) {     // Deselection
      let remChecked = [e.target.value];
      props.updateSelectedFacets(props.constraint, remChecked, props.facetType, isNested, true, false);
    }
  };

  const handleClear = () => {
    setChecked([]);
    props.updateSelectedFacets(props.constraint, checked, props.facetType, false, false, true);
  };

  const showMore = () => {
    let toggle = !more;
    let showNumber = SHOW_MINIMUM;
    if (toggle && props.facetValues.length > SHOW_MINIMUM) {
      showNumber = props.facetValues.length;
    }
    toggleMore(!more);
    setShowFacets(showNumber);
  };

  if (props.facetValues.length === 0 && checked.length > 0) {
    checkedFacets = checked.map(item => {
      return {name: item, count: 0, value: item};
    });
  } else if (props.facetValues.length > 0) {
    checkedFacets = props.facetValues;
  }

  const renderValues = checkedFacets.slice(0, showFacets).map((facet, index) => {
    return (
      <FacetName facet={facet} index={index} key={index} handleClick={handleClick} name={props.name} checked={checked} />
    );
  });

  const formatTitle = () => {
    let objects = props.name.split(".");
    if (objects.length > 2) {
      let first = objects[0];
      let last = objects.slice(-1);
      // returns an array for rendering that looks like "first > ... > last"
      return <p>{first} &gt; ... &gt; <b>{last}</b></p>;
    } else if (objects.length === 2) {
      let first = objects[0];
      let last = objects.slice(-1);
      return <p>{first} &gt; <b>{last}</b></p>;
    }
    return <b>{props.name}</b>;
  };

  return (
    <div className={styles.facetContainer} data-cy={stringConverter(props.name) + "-facet-block"}>
      <div className={styles.header}>
        <div
          className={styles.name}
          data-cy={stringConverter(props.name) + "-facet"}
          data-testid={stringConverter(props.name) + "-facet"}
        >
          <HCTooltip text={props.name.replace(/\./g, " > ")} id="name-prop-tooltip" placement="top">{formatTitle()}</HCTooltip>
          <HCTooltip text={props.tooltip} id="props-tooltip" placement="top-start">
            <span>{props.tooltip ?
              <i><FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" data-testid={`info-tooltip-${props.name}`} /></i> : ""}
            </span>
          </HCTooltip>
        </div>
        <div className={styles.summary}>
          {checked.length > 0 ? <div className={styles.selected}
            data-cy={stringConverter(props.name) + "-selected-count"}>{checked.length} selected</div> : ""}
          <div
            className={(checked.length > 0 ? styles.clearActive : styles.clearInactive)}
            onClick={() => handleClear()}
            data-cy={stringConverter(props.name) + "-clear"}
          >Clear
          </div>
          <div className={styles.toggle} onClick={() => toggleShow(!show)} data-testid={stringConverter(props.name) + "-toggle"}>
            {show ? <ChevronDown className={styles.toggleIcon} aria-label="icon: chevron-down"/> : <ChevronRight className={styles.toggleIcon} aria-label="icon: chevron-right"/>}
          </div>
        </div>
      </div>
      <div style={{display: (show) ? "block" : "none"}}>
        {renderValues}
        <div
          className={styles.more}
          style={{display: (props.facetValues.length > SHOW_MINIMUM) ? "block" : "none"}}
          onClick={() => showMore()}
          data-cy="show-more"
          data-testid={`show-more-${stringConverter(props.name)}`}
        >{(more) ? "<< less" : "more >>"}</div>
        {(props.facetType === "xs:string" || "collection") && (checkedFacets.length >= SEARCH_MINIMUM) &&
        <div className={styles.searchValues}>
          <PopOverSearch
            referenceType={props.referenceType}
            entityTypeId={props.entityTypeId}
            propertyPath={props.propertyPath}
            checkFacetValues={checkFacetValues}
            popOvercheckedValues={checked}
            facetValues={checkedFacets}
            facetName={props.name}
          />
        </div>}
      </div>
    </div>
  );
};

export default Facet;
