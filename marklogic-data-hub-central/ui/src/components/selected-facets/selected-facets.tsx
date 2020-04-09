import React, {useContext, useEffect, useState} from 'react';
import { Icon, Tooltip} from 'antd';
import { MlButton } from 'marklogic-ui-library';
import { SearchContext } from '../../util/search-context';
import styles from './selected-facets.module.scss';
import moment from 'moment';


interface Props {
  selectedFacets: any[];
  greyFacets: any[];
};

const SelectedFacets: React.FC<Props> = (props) => {
  const {
    clearAllFacets,
    clearFacet,
    searchOptions,
    clearDateFacet,
    clearRangeFacet,
    clearAllGreyFacets,
    clearGreyFacet,
    greyedOptions,
    setAllSearchFacets,
   } = useContext(SearchContext);

  const [showApply, toggleApply] = useState(false);
  const [applyClicked, toggleApplyClicked] = useState(false);


    useEffect(() => {
        if ((props.greyFacets.length > 0 || props.selectedFacets.length > 0) && (!applyClicked)) {
            toggleApply(true);
        } else {
            toggleApply(false);
        }
        toggleApplyClicked(false);
    }, [props.greyFacets]);


    const applyFacet = () => {
        setAllSearchFacets(greyedOptions.searchFacets);
        clearAllGreyFacets();
        toggleApplyClicked(true);
        toggleApply(false);
    }

    const clearGreyFacets = () => {
        clearAllGreyFacets();
        toggleApplyClicked(true);
        toggleApply(false);
    }


  const unCheckRest = (constraint, facet) => {
    if (props.selectedFacets.length == 0)
        return true;
    for (let item of props.selectedFacets) {
        if (item.constraint === constraint && item.facet === facet)
            return false;
    }
    return true;
  }

  return (
    <div
      id='selected-facets'
      data-testid='selected-facet-block'
      data-cy='selected-facet-block'
      className={styles.clearContainer}
      style={ (Object.entries(searchOptions.searchFacets).length === 0 && Object.entries(greyedOptions.searchFacets).length === 0) ? {'visibility': 'hidden'} : {'visibility': 'visible'}}
    >
      { (props.selectedFacets.length > 0 ) &&
        <MlButton
          size="small"
          className={styles.clearAllBtn}
          onClick={()=> clearAllFacets()}
          data-cy='clear-all-button'
          data-testid='clear-all-button'
        >
          <Icon type='close'/>
          Clear All
        </MlButton>
      }
      { props.selectedFacets.map((item, index) => {
        if (item.constraint === 'createdOnRange') {
          let dateValues:any = [];
          dateValues.push(item.facet.lowerBound,item.facet.upperBound);
          return (
            <MlButton
              size="small"
              className={styles.dateFacet}
              key={index}
              onClick={()=> clearDateFacet()}
              data-cy='clear-date-facet'
              data-testid='clear-date-facet'
            >
              <Icon type='close'/>
              { dateValues.join(' ~ ') }
            </MlButton>
          )
        } else if (item.rangeValues) {
          if (moment(item.rangeValues.lowerBound).isValid() && moment(item.rangeValues.upperBound).isValid()) {
            let dateValues:any = [];
            dateValues.push(item.rangeValues.lowerBound,item.rangeValues.upperBound);
            return (
              <MlButton
                size="small"
                className={styles.dateFacet}
                key={index}
                onClick={()=> clearRangeFacet(item.constraint)}
              >
                <Icon type='close'/>
                {item.constraint + ': ' + item.rangeValues.lowerBound + ' ~ ' + item.rangeValues.upperBound}
              </MlButton>
            )
          } else {
            return (
              <MlButton
                size="small"
                className={styles.facetButton}
                key={index}
                onClick={()=> clearRangeFacet(item.constraint)}
                data-cy='clear-range-facet'
                data-testid='clear-range-facet'
              >
                <Icon type='close'/>
                {item.constraint + ': ' + item.rangeValues.lowerBound + ' - ' + item.rangeValues.upperBound}
              </MlButton>
            )
          }
        }
        return (
          <MlButton
            size="small"
            className={styles.facetButton}
            key={index}
            onClick={()=> clearFacet(item.constraint, item.facet)}
            data-cy={`clear-${item.facet}`}
            data-testid={`clear-${item.facet}`}
          >
            <Icon type='close'/>
              {item.constraint + ': ' + item.facet}
          </MlButton>
        )
      })}
        {props.greyFacets.map((item, index) => {
            if (item.constraint === 'createdOnRange') {
                let dateValues: any = [];
                dateValues.push(item.facet.lowerBound, item.facet.upperBound);
                return (
                    <MlButton
                        size="small"
                        className={styles.facetGreyButton}
                        key={index}
                        //onClick={() => clearDateFacet()}
                        data-cy='clear-date-facet'
                        data-testid='clear-date-facet'
                    >
                        <Icon type='close'/>
                        {dateValues.join(' ~ ')}
                    </MlButton>
                )
            } else if (item.rangeValues) {
                if (moment(item.rangeValues.lowerBound).isValid() && moment(item.rangeValues.upperBound).isValid()) {
                    let dateValues: any = [];
                    dateValues.push(item.rangeValues.lowerBound, item.rangeValues.upperBound);
                    return (
                        <MlButton
                            size="small"
                            className={styles.facetGreyButton}
                            key={index}
                            //onClick={() => clearRangeFacet(item.constraint)}
                        >
                            <Icon type='close'/>
                            {item.constraint + ': ' + item.rangeValues.lowerBound + ' ~ ' + item.rangeValues.upperBound}
                        </MlButton>
                    )
                } else {
                    return (
                        <MlButton
                            size="small"
                            className={styles.facetGreyButton}
                            key={index}
                            //onClick={() => clearRangeFacet(item.constraint)}
                            data-cy='clear-range-facet'
                            data-testid='clear-range-facet'
                        >
                            <Icon type='close'/>
                            {item.constraint + ': ' + item.rangeValues.lowerBound + ' - ' + item.rangeValues.upperBound}
                        </MlButton>
                    )
                }
            }
            return (
                (unCheckRest(item.constraint, item.facet)) && <Tooltip title={'Not yet applied'}><MlButton
                    size="small"
                    className={styles.facetGreyButton}
                    key={index}
                    //onClick={() => clearGreyFacet(item.constraint, item.facet)}
                    data-cy={`clear-grey-${item.facet}`}
                    data-testid={`clear-grey-${item.facet}`}
                >
                    <Icon type='close'/>
                    {item.constraint + ': ' + item.facet}
                </MlButton></Tooltip>
            )
        })}
        {props.greyFacets.length > 0 &&
        <Tooltip title={'Discard all changes'}><MlButton
            size="small"
            className={styles.clearAllBtn}
            onClick={clearGreyFacets}
            data-cy='clear-all-grey-button'
            data-testid='clear-all-grey-button'
        >
            <Icon type='close'/>
        </MlButton></Tooltip>
        }
        {showApply &&
        <Tooltip title={'Apply all changes'}><MlButton
            size="small"
            onClick={() => applyFacet()}
            data-cy='facet-apply-button'
        >
            <Icon type='check'/>
        </MlButton></Tooltip>
        }
    </div>
  );
}

export default SelectedFacets;
