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
    <div id='selected-facets' data-cy='selected-facet-block'
      className={styles.clearContainer}
      style={ Object.entries(searchOptions.searchFacets).length === 0 ? {'visibility': 'hidden'} : {'visibility': 'visible'}}
    >
      <Button 
        size="small"
        className={styles.clearAllBtn}
        onClick={()=> clearAllFacets()}
        data-cy='clear-all-button'
      >
        <Icon type='close'/>
        Clear All
      </Button>
      {console.log(props.selectedFacets)}
        { props.selectedFacets.map((item, index) => {
          if (item.constraint === 'createdOnRange') {
            return (
              <Button 
                size="small"
                className={styles.dateFacet} 
                key={index}
                onClick={()=> clearDateFacet()}
                data-cy='clear-date-facet'
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
              data-cy={`clear-${item.facet}`}
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