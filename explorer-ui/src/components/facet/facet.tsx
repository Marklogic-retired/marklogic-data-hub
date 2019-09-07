import React, { useState } from 'react';
import { Checkbox, Icon } from 'antd';
import styles from './facet.module.scss';

const Facet = (props) => {

  const limit = 3;
  const [show, toggleShow] = useState(true);
  const [more, toggleMore] = useState(props.data.facetValues.length > limit);
  const [checked, setChecked] = useState<string[]>([]);

  const handleChecked = (e) => {
    let index = checked.indexOf(e.target.value)
    if (e.target.checked && index === -1) {
      setChecked([...checked, e.target.value]);
    } else if (index !== -1){
      let newChecked = [...checked];
      newChecked.splice(index, 1);
      setChecked(newChecked);
    }
  }

  const numToShow = (props.data.facetValues.length > limit && more) ? 
    limit : props.data.facetValues.length;

  const values = props.data.facetValues.slice(0, numToShow).map((f, i) =>
    <div key={i}>
      <div className={styles.checkContainer}>
        <Checkbox 
          value={f.value}
          onChange={(e) => handleChecked(e)}
          checked={checked.indexOf(f.value) > -1}
        >
          <div title={f.value} className={styles.value}>{f.value}</div>
        </Checkbox>
      </div>
      <div className={styles.count}>{f.count}</div>
    </div>
  );

  return (
    <div className={styles.facetContainer}>
      <div className={styles.header}>
        <div className={styles.name}>{props.name}</div>
        <div className={styles.summary}>
          <div className={styles.selected}>{checked.length} selected</div>
          <div 
            className={(checked.length > 0 ? styles.clearActive : styles.clearInactive)} 
            onClick={() => setChecked([])}
          >Clear</div>
          <div className={styles.toggle} onClick={() => toggleShow(!show)}>
            <Icon style={{fontSize: '12px'}} type={(show) ? 'up' : 'down'} />
          </div>
        </div>
      </div>
      <div style={{display: (show) ? 'block' : 'none'}}>
        {values}
        <div 
          className={styles.more}
          style={{display: (props.data.facetValues.length > limit) ? 'block' : 'none'}}
          onClick={() => toggleMore(!more)}
        >{(more) ? 'more >>' : '<< less'}</div>
      </div>
    </div>
  )
}

export default Facet;