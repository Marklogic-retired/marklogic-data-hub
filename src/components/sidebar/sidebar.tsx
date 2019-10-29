import React, { useState, useEffect, useContext } from 'react';
import { Collapse, Icon, Button, DatePicker } from 'antd';
import moment from 'moment';
import Facet from '../facet/facet';
import SelectedFacets from '../selected-facets/selected-facets';
import { SearchContext } from '../../util/search-context';
import { facetParser } from '../../util/data-conversion';
import hubPropertiesConfig from '../../config/hub-properties.config';
import styles from './sidebar.module.scss';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

interface Props {
  facets: any;
  selectedEntities: string[];
  entityDefArray: any[];
};

const Sidebar:React.FC<Props> = (props) => {
  const { 
    searchOptions,
    setDateFacet,
    clearDateFacet
   } = useContext(SearchContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);

  useEffect(() => {
    if (props.facets) {
      const parsedFacets = facetParser(props.facets);
      const filteredHubFacets = hubPropertiesConfig.map( hubFacet => {
        let hubFacetValues = parsedFacets.find(facet => facet.facetName === hubFacet.facetName);
        return hubFacetValues && {...hubFacet, ...hubFacetValues}
      });
      setHubFacets(filteredHubFacets);

      if (props.selectedEntities.length) {
        const entityDef = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0]);
        const filteredEntityFacets = entityDef.rangeIndex.length && entityDef.rangeIndex.map( rangeIndex => {
          let entityFacetValues = parsedFacets.find(facet => facet.facetName === rangeIndex);
          return {...entityFacetValues}
        });
        setEntityFacets(filteredEntityFacets);
      }
      if (Object.entries(searchOptions.searchFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for( let constraint in searchOptions.searchFacets) {
          if (constraint === 'createdOnRange') {
            selectedFacets.push({ constraint, facet: searchOptions.searchFacets[constraint] })
          } else {
            searchOptions.searchFacets[constraint].map(facet => {
              selectedFacets.push({ constraint, facet });
            });
          }
          setSelectedFacets(selectedFacets);
        }
      } else {
        setSelectedFacets([]);
        setDatePickerValue([null, null]);
      }
    }
  }, [props.selectedEntities, props.facets]);

  const onDateChange = (dateVal, dateArray) => {
    if (dateVal.length > 1) {
      setDateFacet(dateArray);
      setDatePickerValue([moment(dateArray[0]), moment(dateArray[1])]);
    } else {
      clearDateFacet();
      setDatePickerValue([null, null]);
    }
  }

  return (
    <>
      <SelectedFacets selectedFacets={selectedFacets}/>
      <Collapse 
        className={styles.sidebarContainer}
        defaultActiveKey={['entityProperties', 'hubProperties']} 
        expandIcon={panelProps => <Icon type="up" rotate={panelProps.isActive ? 0 : 180} />}
        expandIconPosition="right"
        bordered={false}
      >
        { props.selectedEntities.length === 1 && (
          <Panel id="entity-properties" header={<div className={styles.title}>Entity Properties</div>} key="entityProperties" style={{borderBottom: 'none'}}>
            { entityFacets.length ? entityFacets.map(facet => {
              return Object.entries(facet).length !== 0 && (
                <Facet
                  name={facet.hasOwnProperty('displayName') ? facet.displayName : facet.facetName}
                  constraint={facet.facetName}
                  facetValues={facet.facetValues}
                  key={facet.facetName}
                />
              )
            }) :
            <div>No Facets</div>
            }
          </Panel>
        )}
        <Panel id="hub-properties" header={<div className={styles.title}>Hub Properties</div>} key="hubProperties" style={{borderBottom: 'none'}}>
          <div className={styles.facetName}>Created On</div>
          <RangePicker 
            className={styles.datePicker} 
            onChange={onDateChange} 
            value={datePickerValue}
          />
          { hubFacets.map(facet => {
            return facet && (
              <Facet
                name={facet.hasOwnProperty('displayName') ? facet.displayName : facet.facetName}
                constraint={facet.facetName}
                facetValues={facet.facetValues}
                key={facet.facetName}
              />
            )
              })}
        </Panel>
    </Collapse>
  </>
  );
}

export default Sidebar;