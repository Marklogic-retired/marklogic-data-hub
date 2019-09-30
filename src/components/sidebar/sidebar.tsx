import React, { useState, useEffect } from 'react';
import Facets from '../facets/facets';
import { facetParser } from '../../util/data-conversion';
import hubPropertiesConfig from '../../config/hub-properties.config';
import styles from './sidebar.module.scss';

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
    <div className={styles.sidebarContainer}>
      {props.selectedEntities.length === 0 ? <></> :
        <Facets 
          title="Entity Properties"
          facets={entityFacets}
        />
      }
      <Facets 
        title="Hub Properties"
        facets={hubFacets}
      />
    </div>
  );
}

export default Sidebar;