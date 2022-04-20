import React, { useContext } from "react";
import { SearchContext } from "../../store/SearchContext";
import Badge from "react-bootstrap/Badge";
import styles from "./SelectedFacets.module.scss";
import "./SelectedFacets.scss";

type Props = {
  config?: any;
};

/**
 * Component for showing selected facets in current search query.
 * Selected facet information is provided by {@link SearchContext}.
 *
 * @component
 * @example
 * <SelectedFacets />
 */
const SelectedFacets: React.FC<Props> = (props) => {

  const searchContext = useContext(SearchContext);

  const getFacetType = (facetValue) => {
    const regexDateRange = /^\d{4}-\d{2}-\d{2} ~ \d{4}-\d{2}-\d{2}$/
    if (regexDateRange.test(facetValue)) {
      return "dateRange";
    } else {
      return "category";
    }
  }

  const handleClose = (e) => {
    let parts = e.target.id.split(":");
    if (getFacetType(parts[1]) === "category") {
      searchContext.handleFacetString(parts[0], parts[1], false);
    } else if (getFacetType(parts[1]) === "dateRange") {
      searchContext.handleFacetDateRange(parts[0], parts[1], false);
    }
  };

  const getSelected = () => {
    const fsObj = {};
    searchContext.facetStrings.forEach(fs => {
      const parts = fs.split(":");
      if (fsObj[parts[0]] === undefined) {
        fsObj[parts[0]] = [{
          value: parts[1],
          type: parts[2]
        }];
      } else {
        fsObj[parts[0]].push({
          value: parts[1],
          type: parts[2]
        });
      }
    })
    const keys = Object.keys(fsObj);
    let res = keys.map((k, index) => {
        return (
          <span key={"selected-" + index} className={styles.badge}>
            <Badge bg="light" text="dark">
              <span className={styles.facetLabel}>{k}</span>
              {fsObj[k].map((v, index2) => {
                return (
                  <span key={"selectedValue-" + index2} className={styles.name}>
                    <span className={styles.nameLabel}>{v.value}</span>
                    <span className={styles.close} id={k + ":" + v.value} onClick={handleClose}>X</span>
                  </span>
                );
              })}
            </Badge>
          </span>
        );
    });
    return res;
  };

  return (
    <div className={styles.selected}>
      {(searchContext.facetStrings && searchContext.facetStrings.length) > 0 ? (
        <span className={styles.facetStrings}>{getSelected()}</span>
      ) : null
      }
    </div>
  );
};

export default SelectedFacets;
