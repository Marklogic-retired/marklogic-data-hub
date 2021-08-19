import React, {useState, useContext} from "react";
import {Card, Select, Input, Button, Radio, Tooltip} from "antd";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styles from "./zero-state-explorer.module.scss";
import {SearchContext} from "../../util/search-context";
import graphic from "./explore_visual_big.png";
import {QueryOptions} from "../../types/query-types";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStream, faTable, faThLarge} from "@fortawesome/free-solid-svg-icons";
import tiles from "../../config/tiles.config";
import HCDivider from "../common/hc-divider/hc-divider";
import HCCard from "../common/hc-card/hc-card";

const ZeroStateExplorer = (props) => {
  const {
    searchOptions,
  } = useContext(SearchContext);

  const [dropDownValue, setDropdownValue] = useState<string>("All Entities");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [view, setView] = useState(props.tableView ? "table" : "snippet");
  const {Option} = Select;
  const dividerOption = <HCDivider className={styles.dividerOption} />;
  const dropdownOptions = ["All Data", dividerOption, "All Entities", dividerOption, ...props.entities];
  const [zeroStatePageDatabase, setZeroStatePageDatabase] = useState("final");
  const [cardView, setCardView] = useState(false);

  const {
    applySaveQuery,
  } = useContext(SearchContext);

  const onClickExplore = () => {
    props.setCardView(cardView);
    props.toggleDataHubArtifacts(true);
    let options: QueryOptions = {
      searchText: searchQuery,
      entityTypeIds: dropDownValue === "All Entities" || dropDownValue === "All Data" ? [] : [dropDownValue],
      selectedFacets: {},
      selectedQuery: "select a query",
      propertiesToDisplay: [],
      zeroState: false,
      sortOrder: [],
      database: zeroStatePageDatabase,
    };
    applySaveQuery(options);
  };

  const handleOptionSelect = (option: any) => {
    setDropdownValue(option);
    if (option === "All Data") {
      setView("card");
      setCardView(true);
    } else {
      setView("table");
      setCardView(false);
      props.toggleTableView(true);
    }
  };

  const onChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const options = dropdownOptions.map((entity, index) => {
    let renderEntity = entity;
    if (entity === "All Entities") {
      renderEntity = (
        <span className={styles.iconDropdownContainer}>
          <div id="all-entities" className="curateIcon"></div>
          <div>All Entities</div>
        </span>
      );
    } else if (entity === "All Data") {
      renderEntity = (
        <span className={styles.iconDropdownContainer}>
          <div id="all-data" className="loadIcon"></div>
          <div>All Data</div>
        </span>
      );
    }

    return index === 1 || index === 3 ? <Option key={index} value={index} disabled={true} style={{cursor: "default"}}>
      {entity}
    </Option> : <Option key={index} value={entity} data-cy={`entity-option-${entity}`}>
      {renderEntity}
    </Option>;
  });

  const entityMenu = (
    <Select
      defaultValue="All Entities"
      style={{width: 250}}
      id="entity-select"
      data-testid="entity-select"
      value={dropDownValue}
      onChange={value => handleOptionSelect(value)}
    >
      {options}
    </Select>
  );

  const onItemSelect = (e) => {
    props.queries.forEach(query => {
      if (e === query["savedQuery"]["name"]) {
        let options: QueryOptions = {
          searchText: query["savedQuery"]["query"]["searchText"],
          entityTypeIds: query["savedQuery"]["query"]["entityTypeIds"],
          selectedFacets: query["savedQuery"]["query"]["selectedFacets"],
          selectedQuery: query["savedQuery"]["name"],
          propertiesToDisplay: query.savedQuery.propertiesToDisplay,
          zeroState: false,
          sortOrder: query.savedQuery.sortOrder,
          database: searchOptions.database,
        };
        applySaveQuery(options);
      }
    });
  };

  const onViewChange = (val) => {
    setView(val);
    val === "table" ? props.toggleTableView(true) : props.toggleTableView(false);
  };

  const onDatabaseChange = (val) => {
    setZeroStatePageDatabase(val);
    if (val === "staging") {
      handleOptionSelect("All Data");
    } else {
      handleOptionSelect("All Entities");
    }
  };

  return (
    <div id="zero-state-explorer" className={styles.container} >
      <div className={styles.zeroContent}>
        <Row className={"g-0"}>
          <Col md={9}>
            <p className={styles.intro}>{tiles.explore.intro}</p>
          </Col>
          <Col md={3} >
            <div className={styles.image}>
              <img className={styles.graphic} src={graphic} alt={""} />
            </div>
          </Col>
        </Row>
        <Row className={"g-0"}>
          <Col xs={12} className={"py-3"}>
            <p className={styles.p}>What do you want to explore?</p>
          </Col>
        </Row>
        <Row className={"g-0"}>
          <Col xs={12}>
            <div className={styles.box}>
              <HCCard className={styles.largeCard}>
                <Row className={"g-0"}>
                  <Col xs={12}>
                    <div className={styles.database}>
                      <p className={styles.databaseLabel}>Database:</p>
                      <Radio.Group
                        className={styles.databaseSelector}
                        buttonStyle="solid"
                        defaultValue={props.zeroStatePageDatabase}
                        name="radiogroup"
                        onChange={e => onDatabaseChange(e.target.value)}
                        // size="medium"
                        id="database-switch"
                      >
                        <Radio.Button aria-label="switch-database-final" value={"final"} className={styles.button}>
                          Final
                        </Radio.Button>
                        <Radio.Button aria-label="switch-database-staging" value={"staging"} className={styles.button}>
                          Staging
                        </Radio.Button>
                      </Radio.Group>
                    </div>
                  </Col>
                </Row>
                <br />
                <Row>
                  <Col xs={12}>
                    <div className={styles.input}>
                      <Input
                        className={styles.searchBar}
                        placeholder="Enter text to search for"
                        addonBefore={entityMenu}
                        onChange={onChange}
                        allowClear
                        data-cy="search-bar"
                        data-testid="search-bar"
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} className={"py-3"}>
                    <div className={styles.viewAs}>
                      <p className={styles.viewAsLabel}>View As:</p>
                      <Radio.Group
                        style={{}}
                        buttonStyle="solid"
                        value={view}
                        name="radiogroup"
                        onChange={e => onViewChange(e.target.value)}
                        // size="medium"
                      >
                        <Tooltip
                          title={dropDownValue === "All Data" ? "View is not available for exploring all data." : ""}
                          placement="bottom"
                        ><Radio.Button aria-label="switch-view-table" value={"table"} className={styles.switchViewButton} disabled={dropDownValue === "All Data"}>
                            <i className={styles.switchViewIcon}><FontAwesomeIcon icon={faTable} /></i>Table
                          </Radio.Button>
                        </Tooltip>
                        <Tooltip
                          title={dropDownValue === "All Data" ? "View is not available for exploring all data." : ""}
                          placement="bottom"
                        ><Radio.Button aria-label="switch-view-snippet" value={"snippet"} className={styles.switchViewButton} disabled={dropDownValue === "All Data"}>
                            <i className={styles.switchViewIcon}><FontAwesomeIcon icon={faStream} /></i>Snippet
                          </Radio.Button>
                        </Tooltip>
                        <span id="viewAsCard" className={styles.viewAsCard}>
                          <Tooltip
                            title={dropDownValue !== "All Data" ? "View is not available for exploring entities." : ""}
                            placement="bottom"
                          ><Radio.Button  aria-label="switch-view-card" value={"card"} className={styles.switchViewButton} disabled={dropDownValue !== "All Data"}>
                              <i className={styles.switchViewIcon}><FontAwesomeIcon icon={faThLarge} /></i>Card
                            </Radio.Button>
                          </Tooltip>
                        </span>
                      </Radio.Group>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <br />
                  <Col xs={12}>
                    <div className={styles.exploreButton}>
                      <Button type="primary" data-cy="explore" className={styles.button} onClick={onClickExplore} >Explore</Button>
                    </div>
                  </Col>
                </Row>
              </HCCard>
            </div>
          </Col>
        </Row>
        {props.isSavedQueryUser && <Row className={"g-0"}>
          <Col xs={12} className={"py-3"}>
            <p className={styles.p}>- or -</p>
          </Col>
        </Row>}
        {props.isSavedQueryUser && <Row className={"g-0"}>
          <Col xs={12}>
            <div className={styles.box}>
              <Card className={styles.smallCard}>
                <Row>
                  <Col xs={12} >
                    <div id="query-selector" className={styles.query} >
                      <Select
                        className={styles.querySelector}
                        placeholder="Select a saved query"
                        onChange={onItemSelect}
                        data-testid="query-select"
                      >
                        {props.queries && props.queries.length && props.queries.map((key) => key.savedQuery.name).map((query, index) =>
                          <Option value={query} key={index + 1} data-cy={`query-option-${query}`}>{query}</Option>
                        )}
                      </Select>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>}
      </div>
      <div className={styles.footer}>
      </div>
    </div>
  );
};

export default ZeroStateExplorer;
