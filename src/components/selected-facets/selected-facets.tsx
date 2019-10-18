import React, { useContext } from 'react';
import { Icon, Button } from 'antd';
import { SearchContext } from '../../util/search-context';
import styles from './selected-facets.module.scss';

interface Props {
  selectedFacets: any[];
};

const SelectedFacets: React.FC<Props> = (props) => {
  const { 
    clearAllFacets,
    clearFacet,
    searchOptions,
    clearDateFacet
   } = useContext(SearchContext);

  return (
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
        { props.selectedFacets.map((item, index) => {
          if (item.constraint === 'createdOnRange') {
            return (
              <Button 
                size="small"
                className={styles.dateFacet} 
                key={index}
                onClick={()=> clearDateFacet()}
              >
                <Icon type='close'/>
                {item.facet.join(' ~ ')}
              </Button>
            )
          }
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
  );
}

export default SelectedFacets;