import React, { useState, useContext, useEffect} from 'react';
import { Button, Checkbox, Icon, Tooltip } from 'antd';
import {SearchContext} from '../../util/search-context';
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
  selectedEntity: string[];
  facetCategory: string;
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

  useEffect(() => {
    if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.searchFacets) {
        if (facet === props.constraint) {
          // checking if arrays are equivalent
          if (JSON.stringify(checked) === JSON.stringify([...searchOptions.searchFacets[facet]])) {
            toggleApply(false);
          } else {
            setChecked([...searchOptions.searchFacets[facet]]);
          }
        }
      }
    } else {
      setChecked([]);
      toggleApply(false);
    }
  }, [searchOptions]);

  const checkFacetValues = (checkedValues) => {
    for (let cVal of checkedValues) {
      if (checked.indexOf(cVal) === -1)
        checked.push(cVal);
    }
    setChecked([...checked]);
    toggleApply(true);
    //props.addFacetValues(props.constraint, [...checked], props.facetType, props.facetCategory);
    props.updateSelectedFacets(props.constraint, [...checked], props.facetType);
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

  const values = props.facetValues.length && props.facetValues.slice(0, showFacets).map((facet, index) =>
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

  return (
    <div className={styles.facetContainer} data-cy={stringConverter(props.name) + "-facet-block"}>
      <div className={styles.header}>
        <div className={styles.name} data-cy={stringConverter(props.name) + "-facet"}>{props.name}<Tooltip
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
        {values !== 0 && values}
        <div
          className={styles.more}
          style={{display: (props.facetValues.length > SHOW_MINIMUM) ? 'block' : 'none'}}
          onClick={() => showMore()}
          data-cy="show-more"
        >{(more) ? '<< less' : 'more >>'}</div>
        {props.facetType === 'xs:string' &&
        <div className={styles.searchValues}>
          <PopOverSearch
              name={props.name}
              selectedEntity={props.selectedEntity[0]}
              facetValues={props.facetValues}
              checkFacetValues={checkFacetValues}
          />
        </div>}
      </div>
      {showApply && (
        <div className={styles.applyButtonContainer}>
          <Button
            type="primary"
            size="small"
            data-cy={stringConverter(props.name) + "-facet-apply-button"}
            onClick={() => props.applyAllFacets()}
          >Apply</Button>
        </div>
      )}
    </div>
  )
}

export default Facet;