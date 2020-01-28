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
      console.log('parsed Facets', parsedFacets)
      const filteredHubFacets = hubPropertiesConfig.map( hubFacet => {
        let hubFacetValues = parsedFacets.find(facet => facet.facetName === hubFacet.facetName);
        return hubFacetValues && {...hubFacet, ...hubFacetValues}
      });
      console.log('filtered hub Facets', filteredHubFacets)
      setHubFacets(filteredHubFacets);
      if (props.selectedEntities.length && Object.entries(searchOptions.searchFacets).length === 0) {
        const entityDef = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0]);
        const filteredEntityFacets = entityDef.rangeIndex.length && entityDef.rangeIndex.map( rangeIndex => {
          let entityFacetValues = parsedFacets.find(facet => facet.facetName === rangeIndex);
          return entityFacetValues ? {...entityFacetValues} : false;
        });
        console.log('filtered entity Facets', filteredEntityFacets)
        setEntityFacets(filteredEntityFacets ? filteredEntityFacets.filter( item => item !== false) : []);
      } else if (props.selectedEntities.length && !entityFacets.length) {
        const entityDef = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0]);
        const filteredEntityFacets = entityDef.rangeIndex.length && entityDef.rangeIndex.map( rangeIndex => {
          let entityFacetValues = parsedFacets.find(facet => facet.facetName === rangeIndex);
          return {...entityFacetValues}
        });

        setEntityFacets(filteredEntityFacets);
      } else {
        // update counts for the entity facets by setting all facet counts to 0 initially
        let updatedEntityFacetCounts: any[] = entityFacets.map( facet => {
          facet.facetValues.forEach( facetValue => {
            facetValue.count = 0;
          });
          return facet;
        });
        entityFacets.forEach( entityFacet => {
          let updatedFacet = parsedFacets.find(facet => facet.facetName === entityFacet.facetName);
          if (updatedFacet.facetValues.length) {
            updatedFacet.facetValues.forEach( facetValue => {
              let currentFacet = entityFacet.facetValues.find( entFacet => entFacet.name === facetValue.name);
              if (currentFacet) {
                // update facet counts
                currentFacet.count = facetValue.count;
                let index = updatedEntityFacetCounts.findIndex(facet => {
                  return facet.facetName === entityFacet.facetName
                });
                // find facetValue index and update it to current facet
                let facet = updatedEntityFacetCounts[index];
                let updateIndex = facet.facetValues.findIndex( facVal => facVal.name === currentFacet.name);
                facet.facetValues[updateIndex] = currentFacet;
                // sort count after updating the count
                facet.facetValues.sort((a, b) => (a.count < b.count) ? 1 : -1)
              }
            });
          }
        });
        setEntityFacets(updatedEntityFacetCounts);
      }

      if (Object.entries(searchOptions.searchFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for( let constraint in searchOptions.searchFacets) {
          if (constraint === 'createdOnRange') {
            selectedFacets.push({ constraint, facet: searchOptions.searchFacets[constraint] })
          } else {
            let datatype = searchOptions.searchFacets[constraint].dataType;
            if (datatype === 'string') {
              searchOptions.searchFacets[constraint]['stringValues'].map(facet => {
                selectedFacets.push({ constraint, facet });
              });
            } else if (datatype === 'decimal') {
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
        type = 'string';
        valueKey = 'stringValues';
        break;
      }
      case 'xs:integer': {
        type = 'integer';
        valueKey = 'rangeValues';
        // create data model for int
        break;
      }
      case 'xs:decimal': {
        type = 'decimal';
        valueKey = 'rangeValues';
        // create data model
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

  const addFacetValues = (constraint: string, vals: string[], datatype: string, facetCategory: string) => {
    let facets = {...allSelectedFacets};

    console.log('update constraint', constraint);
    console.log('update vals', vals);
    console.log('updated facets', facets);
    console.log('datatype', datatype);
    console.log('facetCategory', facetCategory);
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