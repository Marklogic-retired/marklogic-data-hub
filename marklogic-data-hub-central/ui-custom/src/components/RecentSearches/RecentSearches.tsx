import React, { useContext } from "react";
import { SearchContext } from "../../store/SearchContext";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import "./RecentSearches.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShareSquare} from "@fortawesome/free-solid-svg-icons";
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

  const handleQueryClick = (opts) => () => {
    console.log("handleQueryClick", opts);
    searchContext.handleSaved(opts);
  }

  const handleShareClick = (query) => () => {
    console.log("handleShareClick", query);
    // TODO build URL based on configured hostname, port, etc.
    let str = "http://localhost:8080/explore/search?query=" + encodeURIComponent(JSON.stringify(query));
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
      return navigator.clipboard.writeText(str);
    return Promise.reject('Clipboard not available.');
  }

  const formatQuery = (query) => {
    let qtextFmt = <span className={query.qtext ? "qtext" : "qtext empty"}>{query.qtext} </span>;
    let facetsFmt = query.facetStrings.map((f, i) => {
      return <span key={"facet-" + i} className="facet">{f} </span>; // space at the end to help wrapping
    });
    return <span className="query" onClick={handleQueryClick(query)}>{qtextFmt}{facetsFmt}</span>;
  }

  function display(cfg, row) {
    if (cfg.type === "query") {
      return formatQuery(row);
    } else if (cfg.type === "icon") {
      return <OverlayTrigger placement="left" overlay={props => (
        <Tooltip {...props}>Copy to clipboard</Tooltip>
      )}>
        <span className="icon" onClick={handleShareClick(row)} data-testid="share-icon">
          <FontAwesomeIcon size={"lg"} icon={faShareSquare} style={{color: "#394494"}}></FontAwesomeIcon>
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
              <tr key={"row-" + i}>
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
