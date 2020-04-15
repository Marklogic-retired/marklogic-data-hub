import React, {useContext, useEffect, useState} from 'react';
import { Icon, Tooltip} from 'antd';
import { MlButton } from 'marklogic-ui-library';
import { SearchContext } from '../../util/search-context';
import styles from './selected-facets.module.scss';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCheckSquare, faTable, faWindowClose} from '@fortawesome/free-solid-svg-icons'


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
    clearGreyDateFacet,
    clearGreyRangeFacet,
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
        setAllSearchFacets(greyedOptions.selectedFacets);
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
      style={ (Object.entries(searchOptions.selectedFacets).length === 0 && Object.entries(greyedOptions.selectedFacets).length === 0) ? {'visibility': 'hidden'} : {'visibility': 'visible'}}
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
        let facetName = item.displayName ? item.displayName : item.constraint;
        if (facetName === 'createdOnRange') {
          let dateValues:any = [];
          dateValues.push(item.facet.lowerBound, item.facet.upperBound);
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
                {facetName + ': ' + item.rangeValues.lowerBound + ' ~ ' + item.rangeValues.upperBound}
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
                {facetName + ': ' + item.rangeValues.lowerBound + ' - ' + item.rangeValues.upperBound}
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
              {facetName + ': ' + item.facet}
          </MlButton>
        )
      })}
        {props.greyFacets.map((item, index) => {
            let facetName = item.displayName ? item.displayName : item.constraint;
            if (item.constraint === 'createdOnRange') {
                let dateValues: any = [];
                dateValues.push(item.facet.lowerBound, item.facet.upperBound);
                return ((unCheckRest(item.constraint, item.facet)) &&
                    <MlButton
                        size="small"
                        className={styles.facetGreyButton}
                        key={index}
                        onClick={() => clearGreyDateFacet()}
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
                    return ((unCheckRest(item.constraint, item.facet)) &&
                        <MlButton
                            size="small"
                            className={styles.facetGreyButton}
                            key={index}
                            onClick={() => clearGreyRangeFacet(item.constraint)}
                        >
                            <Icon type='close'/>
                            {facetName + ': ' + item.rangeValues.lowerBound + ' ~ ' + item.rangeValues.upperBound}
                        </MlButton>
                    )
                } else {
                    return ((unCheckRest(item.constraint, item.facet)) &&
                        <MlButton
                            size="small"
                            className={styles.facetGreyButton}
                            key={index}
                            onClick={() => clearGreyRangeFacet(item.constraint)}
                            data-cy='clear-range-facet'
                            data-testid='clear-range-facet'
                        >
                            <Icon type='close'/>
                            {facetName + ': ' + item.rangeValues.lowerBound + ' - ' + item.rangeValues.upperBound}
                        </MlButton>
                    )
                }
            }
            return (
              (unCheckRest(item.constraint, item.facet)) &&
                <Tooltip
                  key={index + '-' + item.facet}
                  title={'Not yet applied'}
                >
                  <MlButton
                    size="small"
                    className={styles.facetGreyButton}
                    key={index}
                    onClick={() => clearGreyFacet(item.constraint, item.facet)}
                    data-cy={`clear-grey-${item.facet}`}
                    data-testid={`clear-grey-${item.facet}`}
                  >
                  <Icon type='close'/>
                  {facetName + ': ' + item.facet}
                </MlButton>
              </Tooltip>
            )
        })}
        {showApply &&
        <Tooltip title={'Apply all changes'}>
            <FontAwesomeIcon
                icon={faCheckSquare}
                onClick={() => applyFacet()}
                size="lg"
                className={styles.checkIcon}
                data-cy='facet-apply-button'
                data-testid='facet-apply-button'
            />
        </Tooltip>
        }
        {props.greyFacets.length > 0 &&
        <Tooltip title={'Discard all changes'}>
            <FontAwesomeIcon
                icon={faWindowClose}
                onClick={clearGreyFacets}
                data-cy='clear-all-grey-button'
                data-testid='clear-all-grey-button'
                className={styles.closeIcon}
                size="lg" />
        </Tooltip>
        }
    </div>
  );
}

export default SelectedFacets;
