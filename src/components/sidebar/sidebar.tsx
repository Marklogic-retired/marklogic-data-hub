import React, { useState, useEffect, useContext } from 'react';
import { Collapse, Icon, Button, DatePicker, Tooltip } from 'antd';
import moment from 'moment';
import Facet from '../facet/facet';
import SelectedFacets from '../selected-facets/selected-facets';
import { SearchContext } from '../../util/search-context';
import { facetParser } from '../../util/data-conversion';
import hubPropertiesConfig from '../../config/hub-properties.config';
import tooltipsConfig from '../../config/tooltips.config';
import styles from './sidebar.module.scss';
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const tooltips = tooltipsConfig.browseDocuments;

interface Props {
  facets: any;
  selectedEntities: string[];
  entityDefArray: any[];
};

const Sidebar:React.FC<Props> = (props) => {
  const { 
    searchOptions,
    setAllSearchFacets
   } = useContext(SearchContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [selectedFacets, setSelectedFacets] = useState<any[]>([]);
  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(searchOptions.searchFacets);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);
  const [showApply, toggleApply] = useState(false);

  useEffect(() => {
    if (props.facets) {
      const parsedFacets = facetParser(props.facets);
      const filteredHubFacets = hubPropertiesConfig.map( hubFacet => {
        let hubFacetValues = parsedFacets.find(facet => facet.facetName === hubFacet.facetName);
        return hubFacetValues && {...hubFacet, ...hubFacetValues}
      });
      setHubFacets(filteredHubFacets);
      if (props.selectedEntities.length) {
        const entityDef = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0]);
        const filteredEntityFacets = entityDef.rangeIndex.length && entityDef.rangeIndex.map( rangeIndex => {
          let entityFacetValues = parsedFacets.find(facet => facet.facetName === rangeIndex);
          return entityFacetValues ? {...entityFacetValues} : false;
        });
        setEntityFacets(filteredEntityFacets ? filteredEntityFacets.filter( item => item !== false) : []);
      } 
      if (Object.entries(searchOptions.searchFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for( let constraint in searchOptions.searchFacets) {
          // TODO fix the date picker
          if (constraint === 'createdOnRange') {
            selectedFacets.push({ constraint, facet: searchOptions.searchFacets[constraint]['rangeValues'] })
          } else {
            let datatype = searchOptions.searchFacets[constraint].dataType;
            if (datatype === 'xs:string') {
              searchOptions.searchFacets[constraint]['stringValues'].map(facet => {
                selectedFacets.push({ constraint, facet });
              });
            } else if (datatype === 'xs:decimal') {
              // TODO add support for other data types
            }

          }
          setSelectedFacets(selectedFacets);
        }
        if (!selectedFacets.some( item => item.constraint === 'createdOnRange')) {
          setDatePickerValue([null, null]);
          toggleApply(false)
        }
      } else {
        setSelectedFacets([]);
        setAllSelectedFacets({});
        setDatePickerValue([null, null]);
        toggleApply(false);
      }
    }
  }, [props.selectedEntities, props.facets]);

  const onDateChange = (dateVal, dateArray) => {
    let updateFacets = {...allSelectedFacets};
    if (dateVal.length > 1) {
      toggleApply(true);
      updateFacets = { ...updateFacets, createdOnRange: dateArray } 
      setDatePickerValue([moment(dateArray[0]), moment(dateArray[1])]);
    } else {
      toggleApply(false);
      delete updateFacets.createdOnRange
      setDatePickerValue([null, null]);
    }
    setAllSelectedFacets(updateFacets);
  }


  const updateSelectedFacets = (constraint: string, vals: string[], datatype: string) => {
    let facets = {...allSelectedFacets};
    let type = '';
    let valueKey = '';
    // TODO add support for all data types
    switch (datatype) {
      case 'xs:string': 
      case 'collection': {
        type = 'xs:string';
        valueKey = 'stringValues';
        break;
      }
      case 'xs:integer': {
        type = 'xs:integer';
        valueKey = 'rangeValues';
        break;
      }
      case 'xs:decimal': {
        type = 'xs:decimal';
        valueKey = 'rangeValues';
        break;
      }
      default: 
      break;
    }

    if (vals.length > 0) {
      facets = {
        ...facets, 
        [constraint]: {
          dataType: type,
          [valueKey]: vals
        } 
      };
    } else {
      delete facets[constraint];
    }
    setAllSelectedFacets(facets);
  }

  const applyAllFacets = () => {
    setAllSearchFacets(allSelectedFacets);
  }

  const addFacetValues = (constraint: string, vals: string[], dataType: string, facetCategory: string) => {
    let newAllSelectedfacets = {...allSelectedFacets};
    let valueKey = 'stringValues';
    // TODO add support for non string facets
    if (dataType === 'string') {
      console.log('data type', dataType);
      valueKey = 'stringValues';
    }

    if (facetCategory === 'entity') {
      let newEntityFacets = [...entityFacets];
      let index = newEntityFacets.findIndex(facet => facet.facetName === constraint);

      if (index !== -1) {
        // add item to facetValues
        let additionalFacetVals = vals.map(item => {
          return {name: item, count: 0, value: item}
        });

        if (!newAllSelectedfacets.hasOwnProperty(constraint)) {
          // facet value doesn't exist
          newAllSelectedfacets = {
            ...newAllSelectedfacets,
            [constraint]: {
              dataType,
              [valueKey]: vals
            }
          }
          // TODO duplicate facet is added if additional facet vals contains
          // existing value
          newEntityFacets[index]['facetValues'].unshift(...additionalFacetVals);
        } else {
          // add facet vals to selected facet
          newAllSelectedfacets[constraint][valueKey].push(...vals)
        }
        
      }
      setEntityFacets(newEntityFacets);
    } else if (facetCategory === 'hub') {
      let newHubFacets = [...hubFacets];
      let index = newHubFacets.findIndex(facet => facet.facetName === constraint);

      if (index !== -1) {
        // add item to facetValues
        let additionalFacetVals = vals.map(item => {
          return {name: item, count: 0, value: item}
        });
        if (Object.entries(newAllSelectedfacets).length === 0) {
          newAllSelectedfacets = {
            ...newAllSelectedfacets,
            [constraint]: {
              dataType,
              [valueKey]: vals
            }
          }
          // selected facet constraint exists
          if (!newAllSelectedfacets.hasOwnProperty(constraint)) {
            // facet value doesn't exist
            newHubFacets[index]['facetValues'].unshift(...additionalFacetVals)
          }
        }
      }
      setEntityFacets(newHubFacets);
    }
    setAllSelectedFacets(newAllSelectedfacets);
  }

  return (
    <div className={styles.sideBarContainer} id={'sideBarContainer'}>
      <SelectedFacets selectedFacets={selectedFacets}/>
      <Collapse 
        className={styles.sideBarFacets}
        defaultActiveKey={['entityProperties']}
        expandIcon={panelProps => <Icon type="up" rotate={panelProps.isActive ? 0 : 180} />}
        expandIconPosition="right"
        bordered={false}
      >
        { props.selectedEntities.length === 1 && (
          <Panel id="entity-properties" header={<div className={styles.title}>Entity Properties</div>} key="entityProperties" style={{borderBottom: 'none'}}>
            { entityFacets.length ? entityFacets.map(facet => {
              return Object.entries(facet).length !== 0 && (
                <Facet
                  name={facet.hasOwnProperty('displayName') ? facet.displayName : facet.facetName}
                  constraint={facet.facetName}
                  facetValues={facet.facetValues}
                  key={facet.facetName}
                  tooltip=""
                  facetType={facet.type}
                  facetCategory="entity"
                  selectedEntity={props.selectedEntities}
                  updateSelectedFacets={updateSelectedFacets}
                  applyAllFacets={applyAllFacets}
                  addFacetValues={addFacetValues}
                />
              )
            }) :
            <div>No Facets</div>
            }
          </Panel>
        )}
        <Panel id="hub-properties" header={<div className={styles.title}>Hub Properties</div>} key="hubProperties" style={{borderBottom: 'none'}}>
            <div className={styles.facetName} data-cy='created-on-facet'>Created On<Tooltip title={tooltips.createdOn} placement="topLeft">
              <FontAwesomeIcon className={styles.infoIcon}  icon={faInfoCircle} size="sm" /></Tooltip></div>
          <RangePicker 
            id="range-picker"
            className={styles.datePicker} 
            onChange={onDateChange} 
            value={datePickerValue}
          />
          { showApply && (
            <div className={styles.applyButtonContainer}>
              <Button 
                type="primary" 
                size="small" 
                data-cy={"datepicker-apply-button"}
                onClick={()=> applyAllFacets()}
              >Apply</Button>
            </div>
          )}
          { hubFacets.map(facet => {
            return facet && (
              <Facet
                name={facet.hasOwnProperty('displayName') ? facet.displayName : facet.facetName }
                constraint={facet.facetName}
                facetValues={facet.facetValues}
                key={facet.facetName}
                tooltip={facet.tooltip}
                facetType={facet.type}
                facetCategory="hub"
                selectedEntity={props.selectedEntities}
                updateSelectedFacets={updateSelectedFacets}
                applyAllFacets={applyAllFacets}
                addFacetValues={addFacetValues}
             />
            )
              })}
        </Panel>
    </Collapse>
  </div>
  );
}

export default Sidebar;