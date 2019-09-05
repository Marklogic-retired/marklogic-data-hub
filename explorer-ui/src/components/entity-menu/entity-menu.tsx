import React from 'react';
import { Select } from 'antd';
import styles from './entity-menu.module.scss';

const { Option } = Select;

function handleChange(value) {
  console.log(`selected ${value}`);
}

const EntityMenu = (props) => {

  const entities = ['All', 'Product', 'Order'];

  const options = entities.map((e, i) =>
    <Option value={e} key={i}>{e}</Option>
  );

  return (
    <div className={styles.entityMenuContainer}>
      <div className={styles.header}>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.menu}>
          <Select defaultValue="All" style={{ width: 242 }} onChange={handleChange}>
            {options}
          </Select>
        </div>
      </div>
    </div>
  )

}

export default EntityMenu;