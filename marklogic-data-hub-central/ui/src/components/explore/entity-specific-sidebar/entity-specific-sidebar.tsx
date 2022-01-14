import React, {useContext, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import styles from "./entity-specific-sidebar.module.scss";
import Facet from "@components/facet/facet";
import DateFacet from "@components/date-facet/date-facet";
import DateTimeFacet from "@components/date-time-facet/date-time-facet";
import {HCInput} from "@components/common";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import {SearchContext} from "../../../util/search-context";

interface Props {
  entitySelected: any;
  checkFacetRender: (facets: any) => void;
  facetRender: (facets: any) => void;
  updateSpecificFacets: any;
}

const EntitySpecificSidebar: React.FC<Props> = (props) => {
  const {
    entitySelected: {entity: {name, icon}, entityFacets},
    updateSpecificFacets,
    checkFacetRender,
    facetRender
  } = props;
  const entityIcon = Icons[icon];

  const {
    searchOptions,
    clearConstraint,
    clearFacet,
    clearGreyFacet,
    clearRangeFacet,
    clearGreyRangeFacet,
    greyedOptions,
    setAllGreyedOptions,
    entitySpecificSearch,
    setEntitySpecificSearch,
  } = useContext(SearchContext);

  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(searchOptions.selectedFacets);

  let integers = ["int", "integer", "short", "long"];
  let decimals = ["decimal", "double", "float"];

  useEffect(() => {
    if (entityFacets || updateSpecificFacets) {
      if (Object.entries(searchOptions.selectedFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for (let constraint in searchOptions.selectedFacets) {
          let displayName = "";
          let entityFacet = entityFacets && entityFacets.find(facet => facet.facetName === constraint);
          if (entityFacet && entityFacet.propertyPath !== constraint) {
            displayName = entityFacet.propertyPath;
          }
          if (constraint === "createdOnRange") {
            selectedFacets.push({constraint, facet: searchOptions.selectedFacets[constraint], displayName});
          } else {
            let datatype = searchOptions.selectedFacets[constraint].dataType;
            if (datatype === "xs:string" || datatype === "string") {
              searchOptions.selectedFacets[constraint]["stringValues"].forEach(facet => {
                selectedFacets.push({constraint, facet, displayName});
              });
            } else if (integers.includes(datatype) || decimals.includes(datatype)) {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            } else if (datatype === "xs:date" || datatype === "date") {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            } else if (datatype === "xs:dateTime" || datatype === "dateTime") {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            }
          }
          facetRender(selectedFacets);
        }
      } else {
        if (updateSpecificFacets) {
          facetRender([]);
          setAllSelectedFacets({});
        }
      }
    }
  }, [searchOptions.selectedFacets, updateSpecificFacets]);

  useEffect(() => {
    if (Object.entries(greyedOptions.selectedFacets).length !== 0) {
      let checkedFacets: any[] = [];
      for (let constraint in greyedOptions.selectedFacets) {
        let displayName = "";
        let entityFacet = entityFacets && entityFacets.find(facet => facet.facetName === constraint);
        if (entityFacet && entityFacet.propertyPath !== constraint) {
          displayName = entityFacet.propertyPath;
        }
        if (constraint === "createdOnRange") {
          checkedFacets.push({constraint, facet: greyedOptions.selectedFacets[constraint], displayName});
        } else {
          let datatype = greyedOptions.selectedFacets[constraint].dataType;
          if (datatype === "xs:string" || datatype === "string") {
            greyedOptions.selectedFacets[constraint]["stringValues"].map(facet => {
              checkedFacets.push({constraint, facet, displayName});
            });
          } else if (integers.includes(datatype) || decimals.includes(datatype)) {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          } else if (datatype === "xs:date" || datatype === "date") {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          } else if (datatype === "xs:dateTime" || datatype === "dateTime") {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          }
        }
        checkFacetRender(checkedFacets);
      }
    } else {
      if (Object.entries(searchOptions.selectedFacets).length === 0) {
        setAllSelectedFacets({});
      } else {
        setAllSelectedFacets(searchOptions.selectedFacets);
      }
      checkFacetRender([]);
    }
  }, [greyedOptions]);

  const onDateFacetChange = (datatype, facet, value, isNested) => {
    let updateFacets = {...allSelectedFacets};
    if (value.length > 1 && value[0]) {
      updateFacets = {...updateFacets, [facet]: {dataType: datatype, rangeValues: {lowerBound: moment(value[0]).format("YYYY-MM-DD"), upperBound: moment(value[1]).format("YYYY-MM-DD")}}};
      setAllGreyedOptions(updateFacets);
      setAllSelectedFacets(updateFacets);
    } else if (value.length === 0) {
      clearRangeFacet(facet);
      clearGreyRangeFacet(facet);
    }
  };

  const updateEntitySpecifSearch = ({target}) => {
    const {value} = target;
    setEntitySpecificSearch(value);
  };

  const updateSelectedFacets = (constraint: string, vals: string[], datatype: string, isNested: boolean, toDelete = false, toDeleteAll: boolean = false) => {
    let facets = {...allSelectedFacets};
    let greyFacets = {...greyedOptions.selectedFacets};
    let type = "";
    let valueKey = "";
    let facetName = constraint;

    switch (datatype) {
    case "xs:string":
    case "collection": {
      type = "xs:string";
      valueKey = "stringValues";
      break;
    }
    case "xs:integer": {
      type = "xs:integer";
      valueKey = "rangeValues";
      break;
    }
    case "xs:decimal": {
      type = "xs:decimal";
      valueKey = "rangeValues";
      break;
    }
    default:
      break;
    }

    if (vals.length > 0) {
      facets = {
        ...facets,
        [facetName]: {
          dataType: type,
          [valueKey]: vals
        }
      };
      greyFacets = {
        ...greyFacets,
        [facetName]: {
          dataType: type,
          [valueKey]: vals
        }
      };
    } else {
      delete facets[facetName];
    }
    if (toDelete) {
      if (Object.entries(searchOptions.selectedFacets).length > 0 && searchOptions.selectedFacets.hasOwnProperty(constraint)) {
        clearFacet(constraint, vals[0]);
      } else if (Object.entries(greyedOptions.selectedFacets).length > 0 && greyedOptions.selectedFacets.hasOwnProperty(constraint)) {
        clearGreyFacet(constraint, vals[0]);
      }
    } else if (toDeleteAll) {
      clearConstraint(constraint);
    } else {
      setAllSelectedFacets(facets);
      setAllGreyedOptions(greyFacets);
    }
  };


  const addFacetValues = (constraint: string, vals: string[], dataType: string, facetCategory: string) => {
    let newAllSelectedfacets = {...allSelectedFacets};
    let valueKey = "stringValues";
    // TODO add support for non string facets
    if (dataType === "xs:string") {
      valueKey = "stringValues";
    }
    let type = "";
    switch (dataType) {
    case "xs:string":
    case "collection": {
      type = "xs:string";
      valueKey = "stringValues";
      break;
    }
    case "xs:integer": {
      type = "xs:integer";
      valueKey = "rangeValues";
      break;
    }
    case "xs:decimal": {
      type = "xs:decimal";
      valueKey = "rangeValues";
      break;
    }
    default:
      break;
    }
    if (vals.length > 0) {
      newAllSelectedfacets = {
        ...newAllSelectedfacets,
        [constraint]: {
          dataType: type,
          [valueKey]: vals
        }
      };
    } else {
      delete newAllSelectedfacets[constraint];
    }

    setAllSelectedFacets(newAllSelectedfacets);
    setAllGreyedOptions(newAllSelectedfacets);
  };

  return (
    <div aria-label={`specif-sidebar-${name}`} className={styles.specificSidebar}>
      <div className={styles.entityHeader}>
        <FontAwesomeIcon aria-label={`specif-icon-${name}`} icon={entityIcon} className={styles.entityHeaderIcon}/>
        <span className={styles.entityHeaderName} aria-label={`specif-title-${name}`}>{name}</span>
      </div>
      <div className={styles.entitySearchText} aria-label="specif-search-field">
        <HCInput
          aria-label="specif-search-field"
          id="specif-search-input"
          suffix={<FontAwesomeIcon icon={faSearch} size="sm" className={styles.searchIcon}/>}
          placeholder="Search"
          size="sm"
          onChange={updateEntitySpecifSearch}
          value={entitySpecificSearch ? entitySpecificSearch : " "}/>
      </div>
      <div>
        {entityFacets.length
          ? entityFacets.map((facet, index) => {
            let datatype = "";
            switch (facet.type) {
            case "xs:string": {
              return Object.entries(facet).length !== 0 && facet.facetValues.length > 0 && (
                <Facet
                  name={facet.propertyPath}
                  constraint={facet.facetName}
                  facetValues={facet.facetValues}
                  key={facet.facetName}
                  tooltip=""
                  facetType={facet.type}
                  facetCategory="entity"
                  referenceType={facet.referenceType}
                  entityTypeId={facet.entityTypeId}
                  propertyPath={facet.propertyPath}
                  updateSelectedFacets={updateSelectedFacets}
                  addFacetValues={addFacetValues}
                />
              );
            }
            case "xs:date": {
              datatype = "date";
              return Object.entries(facet).length !== 0 && (
                <DateFacet
                  constraint={facet.facetName}
                  name={facet.propertyPath}
                  datatype={datatype}
                  key={facet.facetName}
                  propertyPath={facet.propertyPath}
                  onChange={onDateFacetChange}
                />
              );
            }
            case "xs:dateTime": {
              datatype = "dateTime";
              return Object.entries(facet).length !== 0 && (
                <DateTimeFacet
                  constraint={facet.facetName}
                  name={facet.propertyPath}
                  datatype={datatype}
                  key={facet.facetName}
                  propertyPath={facet.propertyPath}
                  onChange={onDateFacetChange}
                />
              );
            }
            case "xs:int": {
              datatype = "int";
              break;
            }
            case "xs:integer": {
              datatype = "integer";
              break;
            }
            case "xs:short": {
              datatype = "short";
              break;
            }
            case "xs:long": {
              datatype = "long";
              break;
            }
            case "xs:decimal": {
              datatype = "decimal";
              break;
            }
            case "xs:double": {
              datatype = "double";
              break;
            }
            case "xs:float": {
              datatype = "float";
              break;
            }
            //add date type cases

            default:
              break;
            }
          })
          : <div aria-label={`no-facets-${name}`}>No Facets</div>}
      </div>
    </div>
  );
};

export default EntitySpecificSidebar;
