import React, { useContext, useState } from "react";
import { SearchContext } from "../../store/SearchContext";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {InfoCircleFill, ChevronDoubleRight, ChevronDoubleLeft} from "react-bootstrap-icons";
import "./Facets.scss";

type Props = {
    config?: any;
};

/**
 * Component for showing selectable search facets.
 * Searches are executed by {@link SearchContext}.
 *
 * @component
 * @prop {object[]} config Configuration object for all facets.
 * @prop {string} config.selected  Color of selected facet bar (as HTML color).
 * @prop {string} config.selected  Color of unselected facet bar (as HTML color).
 * @prop {number} config.displayThreshold  Threshold value cotrolling the maximum number of facet 
 * values displayed without a more/less link.
 * @prop {number} config.displayShort Mximum number of facet values displayed without a more/less
 * link when the number of facets is at or below the `config.displayThreshold` value.
 * @prop {number} config.displayLong Maximum number of facet values displayed without a more/less
 * link when the number of facets is above the `config.displayThreshold` value.
 * @prop {object[]} config.items Configuration objects for each facet.
 * @prop {string} config.items.type - Type of facet ("category").
 * @prop {string} config.items.name - Name of the facet.
 * @prop {string} config.items.tooltip - Tooltip associated with the facet's information icon. If
 * no value is provided, no icon is displayed.
 * @prop {boolean} config.items.disabled - Whether the facet is disabled. Optional.
 * @example
 * facets: {
 *  selected: "#1acca8",
 *  unselected: "#dfdfdf",
 *  displayThreshold: 3,
 *  displayShort: 3,
 *  displayLong: 5,
 *  items: [
 *    {
 *      type: "category",
 *      name: "Collection",
 *      tooltip: "Filter by entity.",
 *      disabled: true
 *    },
 *    {
 *      type: "category",
 *      name: "sources",
 *      tooltip: "Filter by source."
 *    }
 *  ]
 * }
 */
const Facets: React.FC<Props> = (props) => {

  const searchContext = useContext(SearchContext);

  let moreLessInit: any = {};
  const moreLessDefault: boolean = true;
  if (props.config.items) {
    props.config.items.forEach(f => {moreLessInit[f.name] = moreLessDefault;});
  }

  const [moreLess, setMoreLess] = useState<any>(moreLessInit);
  const [tooltipShow, setTooltipShow] = useState<any>({});

  // Set up thresholds for more/less links
  const displayThreshold: number = props.config.displayThreshold || 3;
  let moreThreshold: number;
  if (props.config.items && props.config.items.length > displayThreshold) {
    moreThreshold = props.config.displayShort || 3;
  } else {
    moreThreshold = props.config.displayLong || 5;
  }

  const handleSelect = (e) => {
    let parts: any = e.target.id.split(":");
    searchContext.handleFacetString(parts[0], parts[1], e.target.checked);
  };

  const handleMoreLess = (value) => () => {
    setMoreLess(prevState => {
      let newState = Object.assign({}, prevState);
      newState[value] = !prevState[value];              
      return newState;
    })
  }

  // Only show/hide if label overflows (has ellipsis)
  const handleTooltip = (id) => () => {
    const label = document?.getElementById(id);
    setTooltipShow(prevState => {
      const tooltipCopy = Object.assign({}, prevState.tooltipShow);
      if (label !== null && (label.offsetWidth < label.scrollWidth)) {
        tooltipCopy[id] = !tooltipShow[id]; // toggle show/hide
      } else {
        tooltipCopy[id] = false; // never show
      }           
      return tooltipCopy;
    })
  }

  const displayFacetValues = (facetObj, disabled=false, moreLess) => {
    let total = 2000000; // TODO Remove: for testing larger counts
    let result = facetObj["facet-value"] ? 
      facetObj["facet-value"].map((fv, index) => {
        let value = Math.floor(Math.random() * (total + 1)); // TODO Remove: for testing larger counts
        if (!(moreLess && index >= moreThreshold)) {
          return (
            <tr className="facetValue" key={"facetValue-" + index}>
              <td className="label">
                  <Form.Check 
                    id={facetObj.name + ":" + fv.name}
                    type={"checkbox"}
                    checked={searchContext.facetStrings && searchContext.facetStrings.includes(facetObj.name + ":" + fv.name)}
                    disabled={disabled ? disabled : false}
                    data-testid={facetObj.name + ":" + fv.name}
                    title={fv.name}
                    className="shadow-none"
                    onChange={handleSelect}
                  />
                  <OverlayTrigger
                    overlay={<Tooltip>{fv.name}</Tooltip>}
                    onToggle={handleTooltip("tooltip-" + facetObj.name + ":" + fv.name)}
                    show={tooltipShow["tooltip-" + facetObj.name + ":" + fv.name]}
                    placement="right"
                  >
                    <label
                      id={"tooltip-" + facetObj.name + ":" + fv.name}
                      htmlFor={facetObj.name + ":" + fv.name}
                      className="form-check-label"
                    >{fv.name}</label>
                  </OverlayTrigger>
              </td>
              <td className="meter">
                <div className="total">
                  <div 
                    className="count"
                    data-testid={"meter-" + facetObj.name + ":" + fv.name}
                    style={{
                      width: (fv.count*100/searchContext.total).toString().concat("%"),
                      // width: (value*100/total).toString().concat("%"), // TODO Remove: for testing larger counts
                      backgroundColor: (searchContext.facetStrings && searchContext.facetStrings.includes(facetObj.name + ":" + fv.name)) ? 
                        props.config.selected : props.config.unselected
                    }}
                  ></div>
                </div>
              </td>
              <td className="count">{(fv.count).toLocaleString()}</td>
              {/* <td className="count">{(value).toLocaleString()}</td> */}
            </tr>
          )
        }
      }) : null;
    return <tbody>{result}</tbody>
  }

  // Get object for a facet based on facet name
  const getFacetObj = (facetName, facetObjs) => {
    return facetObjs ? facetObjs.find(obj => obj.name === facetName) : null;
  }

  // Get number of facet values for a facet based on facet name
  const getNumValues = (facetName, facetObjs) => {
    let facetObj = getFacetObj(facetName, facetObjs);
    return (facetObj && facetObj["facet-value"]) ? facetObj["facet-value"].length : 0;
  }

  return (
    <div className="facets">
      {/* Show each facet */}
      {props.config.items && searchContext.searchResults && props.config.items.map((f, index) => {
        return ( 
        <div className="facet" key={"facet-" + index}>
          <div className="title">
            {f.name}
            {f.tooltip &&
              <OverlayTrigger
                key={f.name}
                placement="right"
                overlay={<Tooltip>{f.tooltip}</Tooltip>}
              >
                <InfoCircleFill 
                  data-testid={"info-" + f.name}
                  color="#5d6aaa" 
                  size={21}
                  className="facetInfo" 
                />
              </OverlayTrigger>
            }
          </div>
          <div className="facetValues">
            {/* Show each facet value (and count) */}
            {searchContext.searchResults?.facet && searchContext.searchResults.facet?.length > 0 ?
            <Table size="sm" style={{padding: 0, margin: 0}}>
                {displayFacetValues(getFacetObj(f.name, searchContext.searchResults.facet), f.disabled, moreLess[f.name])}
            </Table> : null }
            {(getNumValues(f.name, searchContext.searchResults.facet) > moreThreshold) ? moreLess[f.name] ? 
              <div className="moreLess" data-testid={"more-" + f.name} onClick={handleMoreLess(f.name)}>
                {getNumValues(f.name, searchContext.searchResults.facet) - moreThreshold} more
                <ChevronDoubleRight 
                  data-testid="doubleRight"
                  color="#5d6aaa" 
                  size={11}
                  className="doubleRight" 
                /></div> :
              <div className="moreLess" data-testid={"less-" + f.name} onClick={handleMoreLess(f.name)}>
                <ChevronDoubleLeft 
                  data-testid="doubleLeft"
                  color="#5d6aaa" 
                  size={11}
                  className="doubleLeft" 
                />less</div> : null
            }
          </div>
      </div> ) 
    })}
    </div> 
  );
};

export default Facets;
