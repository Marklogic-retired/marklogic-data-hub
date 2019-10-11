import React, { useState, useEffect, useContext } from 'react';
import { Collapse, Icon, Button, Tag } from 'antd';
import { SearchContext } from '../../util/search-context';
import Facet from '../facet/facet';
import { facetParser } from '../../util/data-conversion';
import hubPropertiesConfig from '../../config/hub-properties.config';
import styles from './sidebar.module.scss';

const { Panel } = Collapse;

const Sidebar = (props) => {
  const { clearAllFacets, clearFacet, searchOptions } = useContext(SearchContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);

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
        const filteredEntityFacets = entityDef.elementRangeIndex.length && entityDef.elementRangeIndex.map( elementRangeIndex => {
          let entityFacetValues = parsedFacets.find(facet => facet.facetName === elementRangeIndex);
          return {...entityFacetValues}
        });
        setEntityFacets(filteredEntityFacets);
      }
      if (Object.entries(searchOptions.searchFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for( let constraint in searchOptions.searchFacets) {
          searchOptions.searchFacets[constraint].map(facet => {
            selectedFacets.push({ constraint, facet });
          });
          setSelectedFacets(selectedFacets);
        }
      } else {
        setSelectedFacets([]);
      }
    }
  }, [props.selectedEntities, props.facets]);

  return (
    <>
      <div
        className={styles.clearContainer}
        style={ Object.entries(searchOptions.searchFacets).length === 0 ? {'visibility': 'hidden'} : {'visibility': 'visible'}}
      >
        <Button 
          size="small"
          className={styles.clearAllBtn}
          onClick={()=> clearAllFacets()}
        >
          <Icon type='close'/>
          Clear All
        </Button>
          { selectedFacets.map((item, index) => {
            return (
              <Button 
                size="small"
                className={styles.facetButton} 
                key={index}
                onClick={()=> clearFacet(item.constraint, item.facet)}
              >
                <Icon type='close'/>
                {item.facet}
              </Button>
            )
          })}
      </div>
      <Collapse 
        className={styles.sidebarContainer}
        defaultActiveKey={['entityProperties', 'hubProperties']} 
        expandIcon={panelProps => <Icon type="up" rotate={panelProps.isActive ? 180 : undefined} />}
        expandIconPosition="right"
        bordered={false}
      >
        { props.selectedEntities.length !== 0 && (
          <Panel id="entity-properties" header={<div className={styles.title}>Entity Properties</div>} key="entityProperties" style={{borderBottom: 'none'}}>
            { entityFacets.length ? entityFacets.map(facet => {
              return facet && (
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