import React, { useState, useEffect } from 'react';
import { Collapse, Icon } from 'antd';
import Facet from '../facet/facet';
import { facetParser } from '../../util/data-conversion';
import hubPropertiesConfig from '../../config/hub-properties.config';
import styles from './sidebar.module.scss';

const { Panel } = Collapse;

const Sidebar = (props) => {
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);

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
    }
  }, [props.selectedEntities, props.facets]);

  return (
    <Collapse 
      className={styles.sidebarContainer}
      defaultActiveKey={['entityProperties', 'hubProperties']} 
      expandIcon={panelProps => <Icon type="up" rotate={panelProps.isActive ? 180 : undefined} />}
      expandIconPosition="right"
      bordered={false}
    >
      { props.selectedEntities.length !== 0 && (
        <Panel id="entity-properties" header={<div className={styles.title}>Entity Properties</div>} key="entityProperties" style={{borderBottom: 'none'}}>
          { entityFacets.map(facet => {
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
  );
}

export default Sidebar;