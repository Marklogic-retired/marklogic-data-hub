import React, { useState, useContext, useEffect } from 'react';
import { Checkbox, Icon, Tooltip} from 'antd';
import { SearchContext } from '../../util/search-context';
import styles from './facet.module.scss';
import { numberConverter } from '../../util/number-conversion';
import { stringConverter } from '../../util/string-conversion';

interface Props {
  name: string;
  constraint: string;
  facetValues: any[];
  tooltip: string;
};

const Facet: React.FC<Props> = (props) => {
  const SHOW_MINIMUM = 3;
  const { setSearchFacets, searchOptions } = useContext(SearchContext);
  const [showFacets, setShowFacets] = useState(SHOW_MINIMUM);
  const [show, toggleShow] = useState(true);
  const [more, toggleMore] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.searchFacets ) {
        if (facet === props.constraint) {
          setChecked([...searchOptions.searchFacets[facet]]);
        }
      }
    } else {
      setChecked([]);
    }
  }, [searchOptions]);

  const handleClick = (e) => {
    let index = checked.indexOf(e.target.value)
    // Selection
    if (e.target.checked && index === -1) {
      setChecked([...checked, e.target.value]);
      setSearchFacets(props.constraint, [...checked, e.target.value]);
    } 
    // Deselection
    else if (index !== -1){
      let newChecked = [...checked];
      newChecked.splice(index, 1);
      setChecked(newChecked);
      setSearchFacets(props.constraint, newChecked);
    }
  }

  const handleClear = () => {
    setChecked([]);
    setSearchFacets(props.constraint, []);
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
      <div className={styles.count} data-cy={stringConverter(props.name) + "-facet-item-count"}>{numberConverter(facet.count)}</div>
    </div>
  );

  return (
    <div className={styles.facetContainer} data-cy="facet-block">
      <div className={styles.header}>
        <Tooltip title={props.tooltip} placement="topLeft">
          <div className={styles.name} data-cy={stringConverter(props.name) + "-facet"}>{props.name}</div>
        </Tooltip>
        <div className={styles.summary}>
          <div className={styles.selected} data-cy={stringConverter(props.name) + "-selected-count"}>{checked.length} selected</div>
          <div 
            className={(checked.length > 0 ? styles.clearActive : styles.clearInactive)} 
            onClick={() => handleClear()}
            data-cy={stringConverter(props.name) + "-clear"}
          >Clear</div>
          <div className={styles.toggle} onClick={() => toggleShow(!show)}>
            <Icon style={{fontSize: '12px'}} type='down' rotate={ show ? 180 : undefined } />
          </div>
        </div>
      </div>
      <div style={{display: (show) ? 'block' : 'none'}} >
        {values !== 0 && values}
        <div 
          className={styles.more}
          style={{display: (props.facetValues.length > SHOW_MINIMUM) ? 'block' : 'none'}}
          onClick={() => showMore()}
          data-cy="show-more"
        >{(more) ? '<< less' : 'more >>'}</div>
      </div>
    </div>
  )
}

export default Facet;