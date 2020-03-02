import React, { useState, useContext, useEffect } from 'react';
import { Checkbox, Icon, Tooltip } from 'antd';
import { MlButton } from 'marklogic-ui-library';
import { SearchContext } from '../../util/search-context';
import styles from './facet.module.scss';
import { numberConverter } from '../../util/number-conversion';
import { stringConverter } from '../../util/string-conversion';
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PopOverSearch from "../pop-over-search/pop-over-search";

interface Props {
  name: string;
  facetType: any;
  constraint: string;
  facetValues: any[];
  tooltip: string;
  facetCategory: string;
  referenceType: string;
  entityTypeId: any;
  propertyPath: any;
  updateSelectedFacets: (constraint: string, vals: string[], datatype: string) => void;
  applyAllFacets: () => void;
  addFacetValues: (constraint: string, vals: string[], datatype: string, facetCategory: string) => void;
};

const Facet: React.FC<Props> = (props) => {

  const SHOW_MINIMUM = 3;
  const {searchOptions} = useContext(SearchContext);
  const [showFacets, setShowFacets] = useState(SHOW_MINIMUM);
  const [show, toggleShow] = useState(true);
  const [more, toggleMore] = useState(false);
  const [showApply, toggleApply] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  let checkedFacets: any[] = [];

  useEffect(() => {
    if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.searchFacets) {
        if (facet === props.constraint) {
          let valueType = '';
          if (searchOptions.searchFacets[facet].dataType === 'xs:string') {
            valueType = 'stringValues';
          }
         
          // TODO add support for non string facets
          const checkedArray = searchOptions.searchFacets[facet][valueType];
          if (checkedArray && checkedArray.length) {
            // checking if arrays are equivalent
            if (JSON.stringify(checked) === JSON.stringify(checkedArray)) {
              toggleApply(false);
            } else {
              setChecked(checkedArray);
            }
          }
        }
      }
    } else {
      setChecked([]);
      toggleApply(false);
    }
  }, [searchOptions]);

  const checkFacetValues = (checkedValues) => {
    let updatedChecked = [...checked];
    for(let value of checkedValues){
      if(updatedChecked.indexOf(value) === -1)
        updatedChecked.push(value);
    }
    setChecked(updatedChecked);
    props.addFacetValues(props.constraint, updatedChecked, props.facetType, props.facetCategory);
    toggleApply(true);
  }

  const handleClick = (e) => {
    let index = checked.indexOf(e.target.value)
    // Selection
    if (e.target.checked && index === -1) {
      setChecked([...checked, e.target.value]);
      toggleApply(true);
      props.updateSelectedFacets(props.constraint, [...checked, e.target.value], props.facetType);
    }
    // Deselection
    else if (index !== -1) {
      let newChecked = [...checked];
      newChecked.splice(index, 1);
      if (newChecked.length === 0 && !(props.constraint in searchOptions.searchFacets)) {
        toggleApply(false);
      } else {
        toggleApply(true);
      }
      setChecked(newChecked);
      props.updateSelectedFacets(props.constraint, newChecked, props.facetType);
    }
  }

  const handleClear = () => {
    setChecked([]);
    if (props.constraint in searchOptions.searchFacets) {
      toggleApply(true);
    } else {
      toggleApply(false);
    }
    props.updateSelectedFacets(props.constraint, [], props.facetType);
  }


  const showMore = () => {
    let toggle = !more;
    let showNumber = SHOW_MINIMUM;
    if (toggle && props.facetValues.length > SHOW_MINIMUM) {
      showNumber = props.facetValues.length
    }
    toggleMore(!more);
    setShowFacets(showNumber);
  }

  if (props.facetValues.length === 0 && checked.length > 0 ) {
      checkedFacets = checked.map(item => {
      return {name: item, count: 0, value: item}
    });
  } else if (props.facetValues.length > 0) {
    checkedFacets = props.facetValues;
  }

  const renderValues = checkedFacets.slice(0, showFacets).map((facet, index) =>
    <div className={styles.checkContainer} key={index} data-cy={stringConverter(props.name) + "-facet-item"}>
      <Checkbox
        value={facet.value}
        onChange={(e) => handleClick(e)}
        checked={checked.includes(facet.value)}
        className={styles.value}
        data-cy={stringConverter(props.name) + "-facet-item-checkbox"}
      >
        <Tooltip title={facet.value}>{facet.value}</Tooltip>
      </Checkbox>
      <div className={styles.count}
          data-cy={stringConverter(props.name) + "-facet-item-count"}>{numberConverter(facet.count)}</div>
    </div>
    );

    const formatTitle = () => {
      let objects = props.name.split('.');
      if (objects.length > 2) {
        let first = objects[0];
        let last = objects.slice(-1);
        return first + '. ... .' + last;
      }
      return props.name;
    }
    
  return (
    <div className={styles.facetContainer} data-cy={stringConverter(props.name) + "-facet-block"}>
      <div className={styles.header}>
        <div className={styles.name} data-cy={stringConverter(props.name) + "-facet"}>{<Tooltip title={props.name}>{formatTitle()}</Tooltip>}<Tooltip
          title={props.tooltip} placement="topLeft">
          {props.tooltip ?
            <FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm"/> : ''}</Tooltip></div>
        <div className={styles.summary}>
          {checked.length > 0 ? <div className={styles.selected}
                                     data-cy={stringConverter(props.name) + "-selected-count"}>{checked.length} selected</div> : ''}
          <div
            className={(checked.length > 0 ? styles.clearActive : styles.clearInactive)}
            onClick={() => handleClear()}
            data-cy={stringConverter(props.name) + "-clear"}
          >Clear
          </div>
          <div className={styles.toggle} onClick={() => toggleShow(!show)}>
            <Icon style={{fontSize: '12px'}} type='down' rotate={show ? 180 : undefined}/>
          </div>
        </div>
      </div>
      <div style={{display: (show) ? 'block' : 'none'}}>
        {renderValues}
        <div
          className={styles.more}
          style={{display: (props.facetValues.length > SHOW_MINIMUM) ? 'block' : 'none'}}
          onClick={() => showMore()}
          data-cy="show-more"
        >{(more) ? '<< less' : 'more >>'}</div>
        {(props.facetType === 'xs:string' || 'collection') &&
        <div className={styles.searchValues}>
          <PopOverSearch
              referenceType={props.referenceType}
              entityTypeId={props.entityTypeId}
              propertyPath={props.propertyPath}
              checkFacetValues={checkFacetValues}
          />
        </div>}
      </div>
      {showApply && (
        <div className={styles.applyButtonContainer}>
          <MlButton
            type="primary" 
            size="small" 
            data-cy={stringConverter(props.name) +"-facet-apply-button"}
            onClick={()=> props.applyAllFacets()}
          >Apply</MlButton>
        </div>
      )}
    </div>
  )
}

export default Facet;