import React, { useState, useContext } from 'react';
import { Row, Col, Card, Select, Input, Divider } from 'antd';
import styles from './zero-state-explorer.module.scss';
import { SearchContext } from '../../util/search-context';
import graphic from './explore_visual_big.png';
import { QueryOptions } from '../../types/query-types';
import { MLButton, MLRadio,MLTooltip } from '@marklogic/design-system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStream, faTable, faThLarge } from '@fortawesome/free-solid-svg-icons'
import tiles from '../../config/tiles.config'

const ZeroStateExplorer = (props) => {

  const [dropDownValue, setDropdownValue] = useState<string>('All Entities');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { Option } = Select;
  const dividerOption = <Divider className={styles.dividerOption}/>;
  const dropdownOptions = ['All Data', dividerOption, 'All Entities', dividerOption, ...props.entities];
  let [view, setView] = useState(props.tableView ? 'table' : 'snippet');


  const {
    applySaveQuery,
  } = useContext(SearchContext);

  const onClickExplore = () => {
    let options: QueryOptions = {
      searchText: searchQuery,
      entityTypeIds: dropDownValue === 'All Entities' || dropDownValue === 'All Data' ? [] : [dropDownValue],
      selectedFacets: {},
      selectedQuery: 'select a query',
      propertiesToDisplay: [],
      zeroState: false,
      manageQueryModal: false,
      sortOrder: []
  }
  applySaveQuery(options);
  }

  const handleOptionSelect = (option: any) => {
    setDropdownValue(option)
    if(option === 'All Data'){
      setView('card');
      props.setCardView(true);
    } else {
      setView('table');
      props.setCardView(false);
      props.toggleTableView(true);
    }
  }

  const onChange = (e) => {
    setSearchQuery(e.target.value);
  }

  const entityMenu = (
    <Select
      defaultValue='All Entities'
      style={{ width: 250 }}
      id="entity-select"
      data-testid="entity-select"
      value={dropDownValue}
      onChange={value => handleOptionSelect(value)}
    >
      {
        dropdownOptions.map((entity, index) => {
          return index === 1 || index === 3 ? <Option key={index} value={index} disabled={true} style={{cursor: 'default'}}>
            {entity}
          </Option> : <Option key={index} value={entity}>
            {entity}
          </Option>
        })
      }
    </Select>
  );

  const onItemSelect = (e) => {
    props.queries.forEach(query => {
      if (e === query['savedQuery']['name']) {
        let options: QueryOptions = {
          searchText: query['savedQuery']['query']['searchText'],
          entityTypeIds: query['savedQuery']['query']['entityTypeIds'],
          selectedFacets: query['savedQuery']['query']['selectedFacets'],
          selectedQuery: query['savedQuery']['name'],
          propertiesToDisplay: query.savedQuery.propertiesToDisplay,
          zeroState: false,
          manageQueryModal: false,
          sortOrder: query.savedQuery.sortOrder
        }
        applySaveQuery(options);
      }
    })
  };

  const onViewChange = (val) => {
    setView(val);
    val === 'table' ? props.toggleTableView(true) : props.toggleTableView(false)
}

  return (
    <div className={styles.container} >
      <div className={styles.zeroContent}>
        <Row>
          <Col span={18}>
            <p className={styles.intro}>{tiles.explore.intro}</p>
          </Col>
          <Col span={6} >
            <div className={styles.image}>
              <img className={styles.graphic} src={graphic} />
            </div>
          </Col>
        </Row>
        <Row gutter={[0, 28]}>
          <Col span={12} offset={6}>
            <p className={styles.p}>What do you want to explore?</p>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <div className={styles.box}>
              <Card className={styles.largeCard} bordered={false}>
                <Row>
                  <Col span={24}>
                    <div className={styles.input}>
                      <Input
                        style={{ width: 700 }}
                        placeholder="Search for text"
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
                  <br />
                  <Col span={24}>
                    <div className={styles.viewAs}>
                      <p className={styles.viewAsLabel}>View As:</p>
                      <MLRadio.MLGroup
                      style={{ }}
                        buttonStyle="solid"
                        value={view}
                        name="radiogroup"
                        onChange={e => onViewChange(e.target.value)}
                        size="medium"
                      >
                      <MLTooltip
                      title={dropDownValue === "All Data" ? "View is not available for exploring all data." : ""}
                      placement="bottom"
                      ><MLRadio.MLButton aria-label="switch-view-table" value={'table'} className={styles.switchViewButton} disabled={dropDownValue === "All Data"}>
                          <i className={styles.switchViewIcon}><FontAwesomeIcon icon={faTable} /></i>Table
                      </MLRadio.MLButton>
                      </MLTooltip>
                      <MLTooltip
                      title={dropDownValue === "All Data" ? "View is not available for exploring all data." : ""}
                      placement="bottom"
                      ><MLRadio.MLButton aria-label="switch-view-snippet" value={'snippet'} className={styles.switchViewButton} disabled={dropDownValue === "All Data"}>
                          <i className={styles.switchViewIcon}><FontAwesomeIcon icon={faStream} /></i>Snippet
                      </MLRadio.MLButton>
                      </MLTooltip>
                      <MLTooltip
                      title={dropDownValue !== "All Data" ? "View is not available for exploring entities." : ""}
                      placement="bottom"
                      ><MLRadio.MLButton aria-label="switch-view-card" value={'card'} className={styles.switchViewButton} disabled={dropDownValue !== "All Data"}>
                          <i className={styles.switchViewIcon}><FontAwesomeIcon icon={faThLarge} /></i>Card
                      </MLRadio.MLButton>
                      </MLTooltip>
                      </MLRadio.MLGroup>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <br />
                  <Col span={24}>
                    <div className={styles.exploreButton}>
                      <MLButton type="primary" data-cy='explore' className={styles.button} onClick={onClickExplore} >Explore</MLButton>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
        {props.isSavedQueryUser && <Row gutter={[0, 28]}>
          <Col span={24}>
            <p className={styles.p}>- or -</p>
          </Col>
        </Row>}
        {props.isSavedQueryUser && <Row >
          <Col span={24}>
            <div className={styles.box}>
              <Card className={styles.smallCard} bordered={false}>
                <Row>
                  <Col span={24} >
                    <div id='query-selector' className={styles.query} >
                      <Select
                        style={{ width: 300 }}
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
}

export default ZeroStateExplorer;
