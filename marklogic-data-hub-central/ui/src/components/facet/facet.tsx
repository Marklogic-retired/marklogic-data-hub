import React, {useState, useContext, useEffect} from "react";
import {SearchContext} from "@util/search-context";
import FacetName from "./facet-name";
import styles from "./facet.module.scss";
import {stringConverter} from "@util/string-conversion";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PopOverSearch from "../pop-over-search/pop-over-search";
import {ChevronDown, ChevronRight} from "react-bootstrap-icons";
import {HCTooltip} from "@components/common";

interface Props {
  name: string;
  constraint: string;
  facetCategory: string;
  facetType: any;
  facetValues: any[];
  tooltip: string;
  referenceType: string;
  entityTypeId: any;
  propertyPath: any;
  maxQuantityOnFacets?: number;
  updateSelectedFacets: (constraint: string, vals: string[], datatype: string, isNested: boolean, toDelete?: boolean, toDeleteAll?: boolean) => void;
  addFacetValues: (constraint: string, vals: string[], datatype: string, facetCategory: string) => void;
}

const Facet: React.FC<Props> = ({name, facetType, facetCategory, facetValues, constraint, tooltip, referenceType, entityTypeId, updateSelectedFacets, addFacetValues, propertyPath, maxQuantityOnFacets}) => {
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
    if (selectedOptions.selectedFacets.hasOwnProperty(constraint)) {
      facetName = constraint;
    } else if (selectedOptions.selectedFacets.hasOwnProperty(propertyPath) && constraint !== propertyPath) {
      facetName = propertyPath;
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
    if (Object.entries(searchOptions.selectedFacets).length !== 0 && searchOptions.selectedFacets.hasOwnProperty(constraint)) {
      setCheckedOptions(searchOptions);
    } else if ((Object.entries(greyedOptions.selectedFacets).length === 0 || (!greyedOptions.selectedFacets.hasOwnProperty(constraint)))) {
      setChecked([]);
    }
  }, [searchOptions]);

  useEffect(() => {
    if (Object.entries(greyedOptions.selectedFacets).length !== 0 && greyedOptions.selectedFacets.hasOwnProperty(constraint)) {
      setCheckedOptions(greyedOptions);
    } else { setCheckedOptions(searchOptions); }
  }, [greyedOptions]);

  const checkFacetValues = (checkedValues) => {
    let updatedChecked = [...checked];
    for (let value of checkedValues) {
      if (updatedChecked.indexOf(value) === -1) { updatedChecked.push(value); }
    }
    setChecked(updatedChecked);
    addFacetValues(constraint, updatedChecked, facetType, facetCategory);
  };

  const handleClick = (e, _constraint?, value?, _facetType?) => {

    if (e?.target) {
      let index = checked.indexOf(e.target.value);
      let isNested = constraint === propertyPath ? false : true;
      // Selection
      if (e.target.checked && index === -1) {
        setChecked([...checked, e.target.value]);
        updateSelectedFacets(constraint, [...checked, e.target.value], facetType, isNested);
      } else if (index !== -1) {     // Deselection
        let remChecked = [e.target.value];
        updateSelectedFacets(constraint, remChecked, facetType, isNested, true, false);
      }
    } else {
      let isNested = constraint === propertyPath ? false : true;
      setChecked([...checked, value]);
      updateSelectedFacets(_constraint, [...checked, value], _facetType, isNested);
    }
  };

  const handleClear = () => {
    setChecked([]);
    updateSelectedFacets(constraint, checked, facetType, false, false, true);
  };

  const showMore = () => {
    let toggle = !more;
    let showNumber = SHOW_MINIMUM;
    if (toggle && facetValues.length > SHOW_MINIMUM) {
      showNumber = facetValues.length;
    }
    toggleMore(!more);
    setShowFacets(showNumber);
  };

  if (facetValues?.length === 0 && checked.length > 0) {
    checkedFacets = checked.map(item => {
      return {name: item, count: 0, value: item};
    });
  } else if (facetValues?.length > 0) {
    checkedFacets = facetValues;
  }

  const renderValues = checkedFacets.slice(0, showFacets).map((facet, index) => {
    facet.max = maxQuantityOnFacets;
    return (
      <FacetName facet={facet} index={index} key={index} handleClick={handleClick} name={name} checked={checked} category={facetCategory} />
    );
  });

  const formatTitle = () => {
    let objects = name.split(".");
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
    return <b>{name}</b>;
  };

  return (
    <div className={styles.facetContainer} data-cy={stringConverter(name) + "-facet-block"}>
      {facetCategory !== "concept" && <div className={styles.header}>
        <div
          className={styles.name}
          data-cy={stringConverter(name) + "-facet"}
          data-testid={stringConverter(name) + "-facet"}
        >
          <HCTooltip text={name.replace(/\./g, " > ")} id="name-prop-tooltip" placement="top">{formatTitle()}</HCTooltip>
          <HCTooltip text={tooltip} id="props-tooltip" placement="top-start">
            <span>{tooltip ?
              <i><FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" data-testid={`info-tooltip-${name}`} /></i> : ""}
            </span>
          </HCTooltip>
        </div>
        <div className={styles.summary}>
          {checked.length > 0 ? <div className={styles.selected}
            data-cy={stringConverter(name) + "-selected-count"}>{checked.length} selected</div> : ""}
          <div
            className={(checked.length > 0 ? styles.clearActive : styles.clearInactive)}
            onClick={() => handleClear()}
            data-cy={stringConverter(name) + "-clear"}
          >Clear
          </div>
          <div className={styles.toggle} onClick={() => toggleShow(!show)} data-testid={stringConverter(name) + "-toggle"}>
            {show ? <ChevronDown className={styles.toggleIcon} aria-label="icon: chevron-down" /> : <ChevronRight className={styles.toggleIcon} aria-label="icon: chevron-right" />}
          </div>
        </div>
      </div>}
      <div style={{display: (show) ? "block" : "none", marginLeft: "5px"}}>
        {renderValues}
        <div
          className={styles.more}
          style={{display: (facetValues?.length > SHOW_MINIMUM) ? "block" : "none"}}
          onClick={() => showMore()}
          data-cy="show-more"
          data-testid={`show-more-${stringConverter(name)}`}
        >{(more) ? "<< less" : "more >>"}</div>
        {(facetType === "xs:string" || "collection") && (checkedFacets.length >= SEARCH_MINIMUM) &&
          <div className={styles.searchValues}>
            <PopOverSearch
              referenceType={referenceType}
              entityTypeId={entityTypeId}
              propertyPath={propertyPath}
              checkFacetValues={checkFacetValues}
              popOvercheckedValues={checked}
              facetValues={checkedFacets}
              facetName={name}
            />
          </div>}
      </div>
    </div>
  );
};

export default Facet;
