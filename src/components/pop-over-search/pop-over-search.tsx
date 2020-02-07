import React, { useState } from 'react';
import {Popover, Input, Checkbox, Icon} from 'antd';
import styles from './pop-over-search.module.scss';
import axios from "axios";

interface Props {
  name: string;
  selectedEntity: string;
  facetValues: any[];
  checkFacetValues: (checkedValues: any[]) => void;
};


const PopOverSearch: React.FC<Props> = (props) => {

  const [options, setOptions] = useState<any[]>([]);
  const [checkedValues, setCheckedValues] = useState<any[]>([]);
  const [popOverVisibility, setPopOverVisibilty] = useState(false);

  const getFacetValues = async (param) => {
    if (param.target.value.length >= 2 && param.target.value.toLowerCase()) {
      try {
        const response = await axios({
          method: 'POST',
          url: `/datahub/v2/search/facet-values`,
          data: {
            "facetInfo": {
              "schemaName": props.selectedEntity,
              "entityName": props.selectedEntity,
              "facetName": props.name
            },
            "limit": 10,
            "dataType": "string",
            "queryParams": [
              param.target.value
            ]
          }
        });
        setOptions(response.data);
      } catch (error) {
        console.log(error)
      }
    }
    else{
      setOptions([]);
    }
  }

  const onSelectCheckboxes = (checkedValues) => {
    setCheckedValues(checkedValues);
  }

  const addFacetValues = () => {
    props.checkFacetValues(checkedValues);
    setPopOverVisibilty(false);
  }

  const searchPopover = () => {
    setPopOverVisibilty(true);
  }

  const handleChange = (visible) => {
    setPopOverVisibilty(visible);
  }


  const content = (
    <div className={styles.popover}>
      <Input placeholder="Search" allowClear={true} onChange={getFacetValues}/>
      <div className={styles.scrollOptions}>
        <Checkbox.Group options={options} onChange={onSelectCheckboxes}></Checkbox.Group>
      </div>
      <hr/>
      <div className={styles.checkIcon}>
        <Icon type="check-square-o" className={styles.popoverIcons} onClick={addFacetValues}/>
      </div>
    </div>
  )

  return (
    <Popover
      placement="leftTop"
      content={content}
      trigger="click"
      onVisibleChange={handleChange}
      visible={popOverVisibility}>
      <div className={styles.search}>Search</div>
    </Popover>
  )
}

export default PopOverSearch;


