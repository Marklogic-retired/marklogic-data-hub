import React, {useState, useContext, useEffect} from "react";
import {Popover, Input, Icon, Checkbox} from "antd";
import styles from "./pop-over-search.module.scss";
import axios from "axios";
import {UserContext} from "../../util/user-context";
import {SearchContext} from "../../util/search-context";

interface Props {
  referenceType: string;
  entityTypeId: any;
  propertyPath: any;
  checkFacetValues: (checkedValues: any[]) => void;
  popOvercheckedValues: any[];
  facetValues: any[];
  facetName: string;
}


const PopOverSearch: React.FC<Props> = (props) => {
  const {searchOptions} = useContext(SearchContext);
  const {handleError} = useContext(UserContext);
  const [options, setOptions] = useState<any[]>([]);
  const [checkedValues, setCheckedValues] = useState<any[]>([]);
  const [popOverVisibility, setPopOverVisibilty] = useState(false);

  const getFacetValues = async (e) => {
    if (e.target.value.length >= 2 && e.target.value.toLowerCase()) {
      try {
        let data = {
          "referenceType": props.referenceType,
          "entityTypeId": props.entityTypeId,
          "propertyPath": props.propertyPath,
          "limit": 10,
          "dataType": "string",
          "pattern": e.target.value
        };
        const response = await axios.post(`/api/entitySearch/facet-values?database=${searchOptions.database}`, data);
        setOptions(response.data);
      } catch (error) {
        console.error(error);
        handleError(error);
      }
    } else {
      setOptions([]);
    }
  };

  const getMonitorFacetValues = async (e) => {
    if (e.target.value.length >= 2 && e.target.value.toLowerCase()) {
      try {
        let data = {
          "facetName": props.facetName,
          "searchTerm": e.target.value
        };
        const response = await axios.post(`/api/jobs/stepResponses/facetValues`, data);
        setOptions(response.data);
      } catch (error) {
        console.error(error);
        handleError(error);
      }
    } else {
      setOptions([]);
    }
  };

  const onSelectCheckboxes = (e) => {
    let index = checkedValues.indexOf(e.target.value);
    if (index === -1) {
      setCheckedValues([...checkedValues, e.target.value]);
    } else {
      let newChecked = checkedValues.filter(function(el) {
        return (el !== e.target.value);
      });
      setCheckedValues(newChecked);
    }
  };

  const addFacetValues = () => {
    props.checkFacetValues(checkedValues);
    setPopOverVisibilty(false);
  };


  const handleChange = (visible) => {
    setPopOverVisibilty(visible);
  };

  useEffect(() => {
    setCheckedValues(props.popOvercheckedValues);
  }, [props.popOvercheckedValues]);



  const renderCheckBoxGroup = options.map((value, index) =>
    <div  key={index} >
      <Checkbox
        value={value}
        onClick={(e) => onSelectCheckboxes(e)}
        checked={checkedValues.includes(value)}
        data-testid={`${value}-popover-checkbox`}
      >{value}
      </Checkbox>
    </div>
  );


  const content = (
    <div className={styles.popover}>
      <Input placeholder="Search" allowClear={true} onChange={searchOptions.tileId === "explore" ? getFacetValues : getMonitorFacetValues} data-testid={(props.facetName)+"-popover-input-field"}/>
      <div className={styles.scrollOptions}>
        {renderCheckBoxGroup}
      </div>
      <hr/>
      <div className={styles.checkIcon} data-testid="check-icon">
        <Icon type="check-square-o" className={styles.popoverIcons} onClick={addFacetValues}/>
      </div>
    </div>
  );

  return (
    <Popover
      placement="leftTop"
      content={content}
      trigger="click"
      onVisibleChange={handleChange}
      visible={popOverVisibility}>
      <div className={styles.search} data-testid={(props.facetName)+"-search-input"} aria-label={"popover-search-label"}>See all</div>
    </Popover>
  );
};

export default PopOverSearch;


