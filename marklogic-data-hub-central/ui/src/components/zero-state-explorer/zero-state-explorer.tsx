import React, { useState, useContext } from 'react';
import { Row, Col, Card, Select, Input, Button } from 'antd';
import styles from './zero-state-explorer.module.scss';
import { SearchContext } from '../../util/search-context';
import Query from '../queries/queries'
import graphic from './explore_visual_big.png';
import { QueryOptions } from '../../types/query-types';
import { MLButton } from '@marklogic/design-system';



const ZeroStateExplorer = (props) => {

  const [dropDownValue, setDropdownValue] = useState<string>('All Entities');
  const { Option } = Select;
  const dropdownOptions = ['All Entities', ...props.entities];

  const {
    searchOptions,
    setQuery,
    applySaveQuery,
    setZeroState,
    setNextEntity
  } = useContext(SearchContext);

  const onClickExplore = () => {
    setZeroState(false)
  }

  const handleOptionSelect = (option: any) => {
    setDropdownValue(option)
    setNextEntity(option)
  }

  const onChange = (e) => {
    setQuery(e.target.value);
  }

  const entityMenu = (
    <Select
      defaultValue='All Entities'
      style={{ width: 150 }}
      id="entity-select"
      data-testid="entity-select"
      value={dropDownValue}
      onChange={value => handleOptionSelect(value)}
    >
      {
        dropdownOptions.map((entity, index) => {
          return <Option key={index} value={entity}>
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
        }
        applySaveQuery(options);
      }
    })
  };

  return (
    <div className={styles.container} >
      <div className={styles.zeroContent}>
        <Row>
          <Col span={18}>
            <p className={styles.italicized}>Search through loaded data and curated data</p>
          </Col>
          <Col span={6} >
            <div className={styles.image}>
              <img className={styles.graphic} src={graphic} />
            </div>
          </Col>
        </Row>
        <Row gutter={[0, 28]}>
          <Col span={12} offset={6}>
            <p className={styles.p}>What do you want to Explore?</p>
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
                        style={{ width: 500 }}
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
                  <Col span={12} offset={6}>
                    <div className={styles.viewAs}>
                      <p className={styles.viewAsLabel}>View As:</p>
                      {props.tableView ?
                        <MLButton type="primary" className={styles.button} onClick={() => props.toggleTableView(true)}>Table</MLButton>
                        :
                        <MLButton className={styles.button} onClick={() => props.toggleTableView(true)}>Table</MLButton>
                      }
                      {props.tableView ?
                        <MLButton className={styles.button} onClick={() => props.toggleTableView(false)}>Snippet</MLButton>
                        :
                        <MLButton type="primary" className={styles.button} onClick={() => props.toggleTableView(false)}>Snippet</MLButton>
                      }
                    </div>
                  </Col>
                </Row>
                <Row>
                  <br />
                  <Col span={12} offset={6}>
                    <div className={styles.viewAs}>
                      <MLButton type="primary" data-cy='explore' className={styles.button} onClick={onClickExplore} >Explore</MLButton>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
        <Row gutter={[0, 28]}>
          <Col span={24}>
            <p className={styles.p}>- OR -</p>
          </Col>
        </Row>
        <Row >
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
                        {props.queries.map((key) => key.savedQuery.name).map((query, index) =>
                          <Option value={query} key={index + 1} data-cy={`query-option-${query}`}>{query}</Option>
                        )}
                      </Select>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
      <div className={styles.footer}>
      </div>
    </div>
  );
}

export default ZeroStateExplorer;
