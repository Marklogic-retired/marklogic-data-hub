import React, {useContext, useEffect, useState} from "react";
import Address from "../Address/Address";
import Chiclet from "../Chiclet/Chiclet";
import DateTime from "../DateTime/DateTime";
import Image from "../Image/Image";
import List from "../List/List";
import Value from "../Value/Value";
import {SearchContext} from "../../store/SearchContext";
import {DetailContext} from "../../store/DetailContext";
import {GearFill, CodeSlash, ArrowRepeat} from "react-bootstrap-icons";
import "./ResultsList.scss";
import {getValByConfig} from "../../util/util";
import Pagination from "../Pagination/Pagination";

type Props = {
  config?: any;
};

const COMPONENTS = {
  Address: Address,
  DateTime: DateTime,
  Image: Image,
  Value: Value
}

/**
 * Component for showing search results in list format.
 * Data payload provided by {@link SearchContext}.
 *
 * @component
 * @prop {object} config  Configuration object.
 * @prop {string} config.id  Path to ID. Passed as identifier to Detail view. 
 * @prop {object} config.thumbnail  Thumbnail configuration object.
 * @prop {string} config.thumbnail.src  Path to thumbnail source URL.
 * @prop {string} config.thumbnail.width  Thumbnail width (as CSS width value).
 * @prop {string} config.thumbnail.height  Thumbnail height (as CSS width value).
 * @prop {string} config.title  Path to title associated with record. Clicking title in UI takes you to the 
 * Detail view for that result.
 * @prop {object[]} config.items  Array of item configuration objects. Item can be value-based or component-based.
 * @prop {string} config.items.value  Path to value-based item.
 * @prop {string} config.items.className  CSS class name to apply to item value.
 * @prop {string} config.items.component  Name of component used to render component-based item.
 * @prop {object} config.items.config  Object of configuration properties for item component.
 * @prop {object} config.categories  Categories configuration object.
 * @prop {string} config.categories.value  Path to categories.
 * @prop {object} config.categories.colors  Key/value pairs specifying categories and their colors.
 * @prop {object} config.timestamp  Timestamp configuration object.
 * @prop {string} config.timestamp.value  Path to timestamp.
 * @prop {string} config.timestamp.label  Label prefix for timestamp.
 * @prop {string} config.status  Path to status associated with record.
 * @example
 * // Configuration
 * const searchResultsConfig = { 
 *   id: "extracted.person.id",
 *   thumbnail: {
 *       src: "extracted.person.image",
 *       width: "70px",
 *       height: "70px"
 *   },
 *   title: "extracted.person.name",
 *   items: [
 *       // Component-based item example
 *       {
 *          component: "Address", 
 *          config: {
 *            city: "extracted.person.address.city",
 *            state: "extracted.person.address.state"
 *          }
 *       },
 *       // Value-based item examples
 *       {value: "extracted.person.phone", className: "phone"},
 *       {value: "extracted.person.ssn"}
 *   ],
 *   categories: {
 *       value: "extracted.person.sources",
 *       colors: "sourcesColors"
 *   },
 *   timestamp: {
 *       value: "extracted.person.createdOn",
 *       label: "Time is"
 *   },
 *   status: "extracted.person.status"
 * }
 * @example
 * // JSX
 * <ResultsList config={searchResultsConfig} />
 */
const ResultsList: React.FC<Props> = (props) => {

  const searchContext = useContext(SearchContext);
  const detailContext = useContext(DetailContext);

  const pageLengths = props?.config?.pageLengths ? props?.config?.pageLengths : [10, 20, 80, 100];

  const {returned, start, pageNumber, pageLength} = searchContext;

  const handleNameClick = (e) => {
    detailContext.handleGetDetail(e.target.id);
  };

  const handleChangePage = (page: number) => {
    const startValue = page === 1 ? page : ((page - 1) * pageLength) + 1;
    searchContext.handlePagination(page, startValue, pageLength);
  }
  const handleChangesetPageLength = (length: number) => {
    searchContext.handlePagination(1, 1, length);
  }

  const getResults = () => {
    let results = searchContext.searchResults.result.map((results, index) => {
      return (
        <div key={"result-" + index} className="result">
          <div className="thumbnail">
            {props.config.thumbnail ?
              <Image data={results} config={props.config.thumbnail.config} />
              : null}
          </div>
          <div className="details">
            <div className="title" onClick={handleNameClick}>
              <Value data={results} config={props.config.title} getFirst={true} />
            </div>
            <div className="subtitle">
              {props.config.items ?
                <List data={results} config={props.config.items} />
                : null}
            </div>
            {props.config.categories ?
              <div className="categories">
                {getValByConfig(results, props.config.categories)!.map((s, index2) => {
                  return (
                    <Chiclet
                      key={"category-" + index2}
                      config={props.config.categories}
                    >{s}</Chiclet>
                  )
                })}
              </div> : null}
          </div>
          <div className="actions">
            {props.config.timestamp ?
              <div className="timestamp">
                <DateTime config={props.config.timestamp} data={results} style={props.config.timestamp.style} />
              </div> : null}
            <div className="icons">
              {props.config.status ?
                <div className="status">
                  <Value data={results} config={props.config.status} getFirst={true} />
                </div> : null}
              <GearFill color="#5d6aaa" size={16} />
              <CodeSlash color="#5d6aaa" size={16} />
              <ArrowRepeat color="#5d6aaa" size={16} />
            </div>
          </div>
        </div>
      );
    });
    return results;
  };

  return (
    <div className="resultsList">
      {(searchContext.searchResults?.result?.length) > 0 ? (
        <div>
          <Pagination pageNumber={pageNumber} pageLength={pageLength} setPageNumber={handleChangePage} total={returned} pageLengths={pageLengths} setPageLength={handleChangesetPageLength} />
          {getResults()}
          <div className="pt-4">
            <Pagination pageNumber={pageNumber} pageLength={pageLength} setPageNumber={handleChangePage} total={returned} pageLengths={pageLengths} setPageLength={handleChangesetPageLength} />
          </div>
        </div>
      ) : <div className="noResults">No results</div>
      }
    </div>
  );
};

export default ResultsList;
