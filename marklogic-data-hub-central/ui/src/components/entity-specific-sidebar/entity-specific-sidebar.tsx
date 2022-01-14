import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import styles from "./entity-specific-sidebar.module.scss";
import Facet from "@components/facet/facet";
import DateFacet from "@components/date-facet/date-facet";
import DateTimeFacet from "@components/date-time-facet/date-time-facet";
import {HCInput} from "@components/common";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

interface Props {
  entitySelected: any;
}

const EntitySpecificSidebar: React.FC<Props> = (props) => {
  const {entitySelected: {entity: {name, icon}, entityFacets}} = props;
  const entityIcon = Icons[icon];

  return (
    <div aria-label={`specif-sidebar-${name}`} className={styles.specificSidebar}>
      <div className={styles.entityHeader}>
        <FontAwesomeIcon aria-label={`specif-icon-${name}`} icon={entityIcon} className={styles.entityHeaderIcon}/>
        <span className={styles.entityHeaderName} aria-label={`specif-title-${name}`}>{name}</span>
      </div>
      <div className={styles.entitySearchText} aria-label="specif-search-field">
        <HCInput aria-label="specif-search-field" id="specif-search-input" suffix={<FontAwesomeIcon icon={faSearch} size="sm" className={styles.searchIcon}/>} placeholder="Search" size="sm" />
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
                  updateSelectedFacets={() => {}}
                  addFacetValues={() => {}}
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
                  onChange={() => {}}
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
                  onChange={() => {}}
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
