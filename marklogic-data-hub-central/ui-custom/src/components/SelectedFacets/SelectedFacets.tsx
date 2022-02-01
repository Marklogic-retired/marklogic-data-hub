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

  const handleClose = (e) => {
    let parts = e.target.id.split(":");
    searchContext.handleFacetString(parts[0], parts[1], false);
  };

  const getSelected = () => {
    const fsObj = {};
    searchContext.facetStrings.forEach(fs => {
      let parts = fs.split(":");
      if (fsObj[parts[0]] === undefined) {
        fsObj[parts[0]] = [parts[1]];
      } else {
        fsObj[parts[0]].push(parts[1]);
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
                    <span className={styles.nameLabel}>{v}</span>
                    <span className={styles.close} id={k + ":" + v} onClick={handleClose}>X</span>
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
