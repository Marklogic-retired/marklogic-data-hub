import React, { useContext } from "react";
import Address from "../Address/Address";
import Chiclet from "../Chiclet/Chiclet";
import DateTime from "../DateTime/DateTime";
import Image from "../Image/Image";
import List from "../List/List";
import Value from "../Value/Value";
import { SearchContext } from "../../store/SearchContext";
import { DetailContext } from "../../store/DetailContext";
import "./ResultsList.scss";
import { getValByConfig } from "../../util/util";
import Pagination from "../Pagination/Pagination";
import ResultActions from "../ResultActions/ResultActions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as FaDictionary from '@fortawesome/free-solid-svg-icons'
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";
import _ from "lodash";

import { Table, Row, Col } from "react-bootstrap";

type Props = {
  config?: any;
};

const COMPONENTS = {
  Address: Address,
  DateTime: DateTime,
  Image: Image,
  Value: Value,
  ResultActions: ResultActions
};

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

  const { returned, sortOrder, pageNumber, pageLength, handleSort } = searchContext;


  const handleSortClick = (e) => {
    if (sortOrder === "ascending") {
      handleSort(props.config?.sort.sortBy, "descending");
    } else if (sortOrder === "descending") {
      handleSort(props.config?.sort.sortBy, "");
    } else {
      handleSort(props.config?.sort.sortBy, "ascending");
    }
  };
  const handleNameClick = (e) => {
    detailContext.handleGetDetail(e.target.id);
  };

  const handleChangePage = (page: number) => {
    const startValue = page === 1 ? page : ((page - 1) * pageLength) + 1;
    searchContext.handlePagination(page, startValue, pageLength);
  };
  const handleChangesetPageLength = (length: number) => {
    searchContext.handlePagination(1, 1, length);
  };

  const getSort = () => {
    return (
      <div className="sortContainer">
        <div className="thumbnailClean"></div>
        <div className="detailClean"></div>
        {_.includes(props.config.sort.entities, searchContext.entityType) ?
          <div className="sortElements" onClick={handleSortClick}>
            <span className="sortName">{props?.config?.sort?.label}</span>
            <span className="sortIcons">
              <CaretUpFill color={sortOrder === "ascending" ? "#394494" : "#ccc"} />
              <CaretDownFill color={sortOrder === "descending" ? "#394494" : "#ccc"} />
            </span>
          </div>
          : null}
      </div>
    );
  };

  // Display URI and snippet (if available) if result entity not recognized
  const getResultNoEntity = (results, index) => {
    let titleValue = results?.uri ? results?.uri : "No record URI";
    let matchValue = results?.snippet?.match["#text"] ? results?.snippet?.match["#text"] : "";
    return (
      <div key={"result-" + index} className="result">
        <div className="details">
          <div className="title no-entity"><Value>{titleValue}</Value></div>
          <div className="subtitle no-entity">
            <div className="match"><Value id={"match-" + index}>{matchValue}</Value></div>
          </div>
        </div>
      </div>
    )
  }

  // Handle both singular and array cases for categories
  const getCategories = (results, config) => {
    let res = getValByConfig(results, config);
    return _.isArray(res) ? res : [res];
  }

  const getResults = () => {
    let results = searchContext.searchResults.result.map((results, index) => {
      const configEntityType = results.entityType && props.config.entities[results.entityType];
      if (!configEntityType) {
        return getResultNoEntity(results, index);
      }
      let defaultIcon = props.config.defaultIcon
      let iconElement = (configEntityType && configEntityType.icon) ? FaDictionary[configEntityType.icon.type] : FaDictionary[defaultIcon.type];
      let titleValue = getValByConfig(results, configEntityType.title, true);
      if (!titleValue) {
        if (results?.uri) {
          titleValue = results?.uri;
        }
      }
      return (
        <tr key={"result-" + index} className="result">
          <td width={20}>
            {<div className="entityIcon" data-testid={"entity-icon-" + index}><FontAwesomeIcon icon={iconElement} color={configEntityType.icon ? configEntityType.icon.color : defaultIcon.color} /></div>}
          </td>
          <td width={70}>
            <div className="thumbnail">
              {configEntityType.thumbnail ?
                <Image data={results} config={configEntityType.thumbnail.config} />
                : null}
            </div>
          </td>
          <td className="details py-2">
            <Row className="p-0">
              <Col xl={6}>
                <div className="title fw-bold" onClick={handleNameClick}>
                  <Value id={results?.uri}>{titleValue}</Value>
                </div>
              </Col>
              <Col xl={6} className="text-xl-end">
                {configEntityType.categories ?
                  <div className="categories">
                    {getCategories(results, configEntityType.categories)!.map((s, index2) => {
                      return (
                        <Chiclet
                          key={"category-" + index2}
                          config={configEntityType.categories}
                        >{s}</Chiclet>
                      );
                    })}
                  </div> : null}
              </Col>
            </Row>

            <div className="row p-0 subtitle">
              {configEntityType.items ?
                <List data={results} config={configEntityType.items} />
                : null}
            </div>
          </td>
          <td className="actions align-top">
            {configEntityType.timestamp ?
              <div className="timestamp">
                <DateTime config={configEntityType.timestamp} data={results} style={configEntityType.timestamp.style} />
              </div> : null}
            <div className="icons">
              {configEntityType.status ?
                <div className="status">
                  <Value data={results} config={configEntityType.status} getFirst={true} />
                </div> : null}
              {configEntityType.resultActions?.component ?
                React.createElement(
                  COMPONENTS[configEntityType.resultActions.component],
                  { config: configEntityType?.resultActions.config, data: results?.extracted }, null
                )
                : null}
            </div>
          </td>
        </tr>
      );
    });
    return results;
  };

  return (
    <div className="resultsList">
      {(searchContext.searchResults?.result?.length) > 0 ? (
        <div>
          <Pagination pageNumber={pageNumber} pageLength={pageLength} setPageNumber={handleChangePage} total={returned} pageLengths={pageLengths} setPageLength={handleChangesetPageLength} />
          {props?.config?.sort && Object.keys(props.config.sort).length !== 0 && getSort()}
           
            <Table responsive hover>
              {getResults()}
            </Table>
         
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
