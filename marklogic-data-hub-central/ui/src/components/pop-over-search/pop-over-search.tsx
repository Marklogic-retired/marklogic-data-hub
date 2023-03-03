import React, {useState, useContext, useEffect} from "react";
import styles from "./pop-over-search.module.scss";
import axios from "axios";
import {UserContext} from "@util/user-context";
import {SearchContext} from "@util/search-context";
import {CheckSquare} from "react-bootstrap-icons";
import {HCInput, HCCheckbox} from "@components/common";
import Popover from "react-bootstrap/Popover";
import {OverlayTrigger} from "react-bootstrap";
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
  const [popOverVisibility, setPopOverVisibility] = useState(false);

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

  const serviceNameKeyDownHandler = (event, component) => {
    //Make seleection when user presses space or enter key
    if ((event.keyCode === 13) || (event.keyCode === 32)) {
      if (component === "seeAllLink") setPopOverVisibility(!popOverVisibility);
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
    setPopOverVisibility(false);
  };


  const handleChange = (visible) => {
    setPopOverVisibility(visible);
  };

  useEffect(() => {
    setCheckedValues(props.popOvercheckedValues);
  }, [props.popOvercheckedValues]);



  const renderCheckBoxGroup = options.map((value, index) =>
    <div  key={index} >
      <HCCheckbox
        id={`${value}-popover-checkbox`}
        value={value}
        handleClick={(e) => onSelectCheckboxes(e)}
        checked={checkedValues.includes(value)}
        data-testid={`${value}-popover-checkbox`}
        ariaLabel={`${value}-popover-checkbox`}
      >{value}
      </HCCheckbox>
    </div>
  );


  const content = (
    <Popover id={`popover-over-search`} className={styles.popoverSearch}>
      <Popover.Body>
        <div className={styles.popover}>
          <HCInput placeholder="Search" allowClear={true} onChange={searchOptions.tileId === "explore" ? getFacetValues : getMonitorFacetValues} ariaLabel={(props.facetName) + "-popover-input-field"} data-testid={(props.facetName) + "-popover-input-field"}/>
          <div className={styles.scrollOptions}>
            {renderCheckBoxGroup}
          </div>
          <hr/>
          <div className={styles.checkIcon} data-testid="check-icon">
            <CheckSquare aria-label="icon: check-square-o" className={styles.popoverIcons} onClick={addFacetValues}/>
          </div>
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      placement="right-end"
      overlay={content}
      trigger="click"
      onToggle={handleChange}
      rootClose
      show={popOverVisibility}>
      <div className={styles.search} tabIndex={0} onKeyDown={(e) => serviceNameKeyDownHandler(e, "seeAllLink")} data-testid={(props.facetName) + "-search-input"} aria-label={(props.facetName) + "-popover-search-label"}>See all</div>
    </OverlayTrigger>
  );
};

export default PopOverSearch;