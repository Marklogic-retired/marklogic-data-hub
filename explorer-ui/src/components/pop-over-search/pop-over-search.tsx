import React, { useState } from 'react';
import {Popover, Input, Checkbox, Icon} from 'antd';
import styles from './pop-over-search.module.scss';
import axios from "axios";

interface Props {
  referenceType: string;
  entityTypeId: any;
  propertyPath: any;
  checkFacetValues: (checkedValues: any[]) => void;
};


const PopOverSearch: React.FC<Props> = (props) => {

  const [options, setOptions] = useState<any[]>([]);
  const [checkedValues, setCheckedValues] = useState<any[]>([]);
  const [popOverVisibility, setPopOverVisibilty] = useState(false);

  const getFacetValues = async (e) => {
    if (e.target.value.length >= 2 && e.target.value.toLowerCase()) {
      try {
        const response = await axios({
          method: 'POST',
          url: `/datahub/v2/search/facet-values`,
          data: {
            "facetInfo": {
              "referenceType": props.referenceType,
              "entityTypeId": props.entityTypeId,
              "propertyPath": props.propertyPath
            },
            "limit": 10,
            "dataType": "string",
            "pattern": e.target.value
          }
        });
        setOptions(response.data);
      } catch (error) {
        console.log(error)
      }
    } else {
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
      <Input placeholder="Search" allowClear={true} onChange={getFacetValues} data-testid='input-field'/>
      <div className={styles.scrollOptions}>
        <Checkbox.Group options={options} onChange={onSelectCheckboxes}></Checkbox.Group>
      </div>
      <hr/>
      <div className={styles.checkIcon} data-testid='check-icon'>
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
      <div className={styles.search} data-testid='search-input'>Search</div>
    </Popover>
  )
}

export default PopOverSearch;


