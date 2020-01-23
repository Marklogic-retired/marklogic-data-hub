import React, { useState } from 'react';
import { Popover, Input, Checkbox, Icon} from 'antd';
import styles from './pop-over-search.module.scss';
import axios from "axios";

interface Props {
  name: string;
  selectedEntity: string[];
};


const PopOverSearch: React.FC<Props> = (props) => {

  const [options, setOptions] = useState<any[]>([]);
  const [checkedValues, setCheckedValues] = useState<any[]>([]);

  const getFacetValues = async (param) => {
    const response = await axios({
      method: 'POST',
      url: `/datahub/v2/search/facet-values`,
      data: {
        "facetInfo": {
          "schemaName": props.selectedEntity[0],
          "entityName": props.selectedEntity[0],
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
  }

  const onSelectCheckboxes = (checkedValues) => {
    setCheckedValues(checkedValues);
  }

  const content = (
      <div className={styles.popover}>
        <Input placeholder="Search" allowClear={true} onChange={getFacetValues}/>
        <div className={styles.scrollOptions}>
          <Checkbox.Group options={options} onChange={onSelectCheckboxes}></Checkbox.Group>
        </div>
        <hr/>
        <div className={styles.checkIcons}>
          <Icon type="check-square-o" className={styles.addIcons}/>
          <Icon type="close-square-o" className={styles.addIcons}/>
        </div>
      </div>
  )

  return (
      <Popover placement="leftTop" content={content} trigger="click">
        <div className={styles.search}>Search</div>
      </Popover>
  )

}

export default PopOverSearch;


