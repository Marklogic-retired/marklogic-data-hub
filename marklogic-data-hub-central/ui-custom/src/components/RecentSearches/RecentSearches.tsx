import React, {useContext} from "react";
import {SearchContext} from "../../store/SearchContext";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "./RecentSearches.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPaste} from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";

type Props = {
  data?: any;
  config?: any
};

/**
 * Component for showing saved search queries.
 *
 * @component
 * @prop {object} data - Data payload. An array of queries.
 * @prop {object} config  Configuration object.
 * @prop {object[]} config.cols  Array of column configuration objects.
 * @prop {string} config.cols[].title  Column title (or null for no title).
 * @prop {string} config.cols[].type  Column type ("query" or "icon").
 * @example
 * { cols: [
 *    {
 *        title: "Search Criteria",
 *        type: "query"
 *    },
 *    {
 *        title: "Share",
 *        type: "icon"
 *     }
 * ]}
 */

const RecentSearches: React.FC<Props> = (props) => {

  const searchContext = useContext(SearchContext);

  const handleQueryClick = (queryObj) => () => {
    searchContext.handleQueryFromParam(queryObj);
  };

  const handleShareClick = (query) => () => {
    let str = window.location.origin + "/search?query=" + encodeURIComponent(JSON.stringify(query));
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) { return navigator.clipboard.writeText(str); }
    return Promise.reject("Clipboard not available.");
  };

  const formatQuery = (query) => {
    let entityTypeArr = _.isArray(query.entityTypeIds) ? query.entityTypeIds : [query.entityTypeIds];
    let entityFmt = <span className="entity">[{entityTypeArr.join(", ")}] </span>; // space at the end to help wrapping
    let qtextFmt = <span className={query.searchText ? "qtext" : "qtext empty"}>{query.searchText} </span>;
    let facetsFmt = Object.entries(query.selectedFacets).map((f: any, i) => {
      if (f[1].min) {
        return <span key={"facet-" + i} className="facet">{f[0]}:{f[1].min} ~ {f[1].max} </span>;
      } else {
        if (_.isArray(f[1])) {
          return f[1].map((v: any, i) => {
            return <span key={"facet-" + i} className="facet">{f[0]}:{v} </span>;
          })
        } else {
          return <span key={"facet-" + i} className="facet">{f[0]}:{f[1]} </span>;
        }
      }
    });
    return <span className="query" onClick={handleQueryClick(query)}>{entityFmt}{qtextFmt}{facetsFmt}</span>;
  };

  function display(cfg, row) {
    if (cfg.type === "query") {
      return formatQuery(row);
    } else if (cfg.type === "icon") {
      return <OverlayTrigger placement="left" overlay={props => (
        <Tooltip {...props}>Copy to clipboard</Tooltip>
      )}>
        <span className="icon" onClick={handleShareClick(row)} data-testid="share-icon">
          <FontAwesomeIcon size={"lg"} icon={faPaste} style={{color: "#394494"}}></FontAwesomeIcon>
        </span>
      </OverlayTrigger>;
    }
  }

  return (
    <div className="recentSearches">
      {(props.data && props.data.length > 0) ? (
        <Table>
          <thead>
            <tr>
              {_.isArray(props.config.cols) && props.config.cols.map((c, i) => {
                return (
                  <th key={"col-" + i} className={c.type}>{c.title}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {_.isArray(props.data) && props.data.map((r, i) => {
              return (
                <tr key={"row-" + i} data-testid={`query-row-${i}`}>
                  {_.isArray(props.config.cols) && props.config.cols.map((c, i) => {
                    return (
                      <td key={"dat-" + i} className={c.type}>{display(c, r)}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) :
        <div className="none-found">No recent searches found.</div>
      }
    </div>
  );
};

export default RecentSearches;
