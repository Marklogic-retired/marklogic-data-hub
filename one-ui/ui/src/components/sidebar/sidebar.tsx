import React, { useState, useEffect, useContext } from 'react';
import { Collapse, Icon, DatePicker, Tooltip } from 'antd';
import { MlButton } from 'marklogic-ui-library';
import moment from 'moment';
import Facet from '../facet/facet';
import SelectedFacets from '../selected-facets/selected-facets';
import { SearchContext } from '../../util/search-context';
import { facetParser } from '../../util/data-conversion';
import hubPropertiesConfig from '../../config/hub-properties.config';
import tooltipsConfig from '../../config/explorer-tooltips.config';
import styles from './sidebar.module.scss';
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NumericFacet from '../numeric-facet/numeric-facet';
import DateFacet from '../date-facet/date-facet';
import DateTimeFacet from '../date-time-facet/date-time-facet';


const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const tooltips = tooltipsConfig.browseDocuments;

interface Props {
  facets: any;
  selectedEntities: string[];
  entityDefArray: any[];
};

const Sidebar: React.FC<Props> = (props) => {
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
  let integers = ['int', 'integer', 'short', 'long'];
  let decimals = ['decimal', 'double', 'float'];

  useEffect(() => {
    if (props.facets) {
      const parsedFacets = facetParser(props.facets);
      const filteredHubFacets = hubPropertiesConfig.map(hubFacet => {
        let hubFacetValues = parsedFacets.find(facet => facet.facetName === hubFacet.facetName);
        return hubFacetValues && { ...hubFacet, ...hubFacetValues }
      });
      setHubFacets(filteredHubFacets);
      if (props.selectedEntities.length) {
        const entityDef = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0]);
        let newEntityFacets = entityDef.rangeIndex.length && entityDef.rangeIndex.map(rangeIndex => {
          let entityFacetValues = parsedFacets.find(facet => facet.facetName === rangeIndex);
          return entityFacetValues ? { ...entityFacetValues } : false;
        });
        if (newEntityFacets) {
          for (let i in newEntityFacets) {
            if (newEntityFacets[i]['facetName'] === entityDef.pathIndex[i]['index']) {
              newEntityFacets[i].referenceType = entityDef.pathIndex[i].referenceType;
              newEntityFacets[i].entityTypeId = entityDef.pathIndex[i].entityTypeId;
              if (entityDef.pathIndex[i].referenceType === 'element') {
                newEntityFacets[i].propertyPath = entityDef.pathIndex[i].index;
              } else {
                newEntityFacets[i].propertyPath = entityDef.pathIndex[i].propertyPath;
              }
            }
          }
        }
        setEntityFacets(newEntityFacets ? newEntityFacets.filter(item => item !== false) : []);
      }
      if (Object.entries(searchOptions.searchFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for (let constraint in searchOptions.searchFacets) {
          if (constraint === 'createdOnRange') {
            selectedFacets.push({ constraint, facet: searchOptions.searchFacets[constraint]['rangeValues'] });
            toggleApply(false);
          } else {
            let datatype = searchOptions.searchFacets[constraint].dataType;
            if (datatype === 'xs:string' || datatype === 'string') {
              searchOptions.searchFacets[constraint]['stringValues'].map(facet => {
                selectedFacets.push({ constraint, facet });
              });
            } else if (integers.includes(datatype) || decimals.includes(datatype)) {
              let rangeValues = searchOptions.searchFacets[constraint].rangeValues
              selectedFacets.push({ constraint, rangeValues });
            } else if (datatype === 'xs:date' || datatype === 'date') {
              let rangeValues = searchOptions.searchFacets[constraint].rangeValues
              selectedFacets.push({ constraint, rangeValues });
            } else if (datatype === 'xs:dateTime' || datatype === 'dateTime') {
              let rangeValues = searchOptions.searchFacets[constraint].rangeValues;
              selectedFacets.push({ constraint, rangeValues });
            }
          }
          setSelectedFacets(selectedFacets);
        }
        if (!selectedFacets.some(item => item.constraint === 'createdOnRange')) {
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
    let updateFacets = { ...allSelectedFacets };
    if (dateVal.length > 1) {
      toggleApply(true);
      updateFacets = {
        ...updateFacets, createdOnRange:
        {
          dataType: 'date',
          rangeValues: { lowerBound: dateArray[0], upperBound: dateArray[1] }
        }
      }
      setDatePickerValue([moment(dateArray[0]), moment(dateArray[1])]);
    } else {
      toggleApply(false);
      delete updateFacets.createdOnRange;
      setDatePickerValue([null, null]);
    }
    setAllSelectedFacets(updateFacets);
  }

  const updateSelectedFacets = (constraint: string, vals: string[], datatype: string) => {
    let facets = { ...allSelectedFacets };
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
    let newAllSelectedfacets = { ...allSelectedFacets };
    let valueKey = 'stringValues';
    // TODO add support for non string facets

    if (dataType === 'xs:string') {
      valueKey = 'stringValues';
    }

    if (facetCategory === 'entity') {
      let newEntityFacets = [...entityFacets];
      let index = newEntityFacets.findIndex(facet => facet.facetName === constraint);

      if (index !== -1) {
        // add item to facetValues
        let additionalFacetVals = vals.map(item => {
          return { name: item, count: 0, value: item }
        });
        // facet value doesn't exist
        newAllSelectedfacets = {
          ...newAllSelectedfacets,
          [constraint]: {
            dataType,
            [valueKey]: vals
          }
        }
        for (let i = 0; i < additionalFacetVals.length; i++) {
          for (let j = 0; j < newEntityFacets[index]['facetValues'].length; j++) {
            if (additionalFacetVals[i].name === newEntityFacets[index]['facetValues'][j].name) {
              newEntityFacets[index]['facetValues'].splice(j, 1);
              break;
            }
          }
          newEntityFacets[index]['facetValues'].unshift(additionalFacetVals[i]);
        }
      }
      setEntityFacets(newEntityFacets);
    } else if (facetCategory === 'hub') {
      let newHubFacets = [...hubFacets];
      let index = newHubFacets.findIndex(facet => facet.facetName === constraint);

      if (index !== -1) {
        // add item to facetValues
        let additionalFacetVals = vals.map(item => {
          return { name: item, count: 0, value: item }
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
      setHubFacets(newHubFacets);
    }
    setAllSelectedFacets(newAllSelectedfacets);
  }

  const onNumberFacetChange = (datatype, facet, value) => {
    let updateFacets = { ...allSelectedFacets };
    if (value.length > 1) {
      updateFacets = { ...updateFacets, [facet]: { dataType: datatype, rangeValues: { lowerBound: value[0].toString(), upperBound: value[1].toString() } } }
    }
    setAllSelectedFacets(updateFacets);
  }

  const onDateFacetChange = (datatype, facet, value) => {
    let updateFacets = { ...allSelectedFacets };
    if (value.length > 1) {
      updateFacets = { ...updateFacets, [facet]: { dataType: datatype, rangeValues: { lowerBound: moment(value[0]).format('YYYY-MM-DD'), upperBound: moment(value[1]).format('YYYY-MM-DD') } } }
    }
    setAllSelectedFacets(updateFacets);
  }

  const onDateTimeFacetChange = (datatype, facet, value) => {
    let updateFacets = { ...allSelectedFacets };
    if (value.length > 1) {
      updateFacets = { ...updateFacets, [facet]: { dataType: datatype, rangeValues: { lowerBound: moment(value[0]).format('YYYY-MM-DDTHH:mm:ss'), upperBound: moment(value[1]).format('YYYY-MM-DDTHH:mm:ss') } } }
    }
    setAllSelectedFacets(updateFacets);
  }

  return (
    <div className={styles.sideBarContainer} id={'sideBarContainer'}>
      <SelectedFacets selectedFacets={selectedFacets} />
      <Collapse
        className={styles.sideBarFacets}
        defaultActiveKey={['entityProperties']}
        expandIcon={panelProps => <Icon type="up" rotate={panelProps.isActive ? 0 : 180} />}
        expandIconPosition="right"
        bordered={false}
      >
        {props.selectedEntities.length === 1 && (
          <Panel id="entity-properties" header={<div className={styles.title}>Entity Properties</div>} key="entityProperties" style={{ borderBottom: 'none' }}>
            {entityFacets.length ? entityFacets.map((facet, index) => {
              let datatype = '';
              let step;
              let entity = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0])
              let pathIndex = entity['pathIndex'].find(({ index }) => index === facet.facetName);
              if (pathIndex) {
                switch (facet.type) {
                  case 'xs:string': {
                    return Object.entries(facet).length !== 0 && facet.facetValues.length > 0 && (
                      <Facet
                        name={pathIndex.entityPath}
                        constraint={pathIndex.entityPath}
                        facetValues={facet.facetValues}
                        key={facet.facetName}
                        tooltip=""
                        facetType={facet.type}
                        facetCategory="entity"
                        referenceType ={facet.referenceType}
                        entityTypeId={facet.entityTypeId}
                        propertyPath={facet.propertyPath}
                        updateSelectedFacets={updateSelectedFacets}
                        applyAllFacets={applyAllFacets}
                        addFacetValues={addFacetValues}
                      />
                    )
                  }
                  case 'xs:date': {
                    datatype = 'date';
                    return Object.entries(facet).length !== 0 && (
                      <DateFacet
                        constraint={pathIndex.entityPath}
                        name={pathIndex.entityPath}
                        datatype={datatype}
                        key={facet.facetName}
                        onChange={onDateFacetChange}
                        applyAllFacets={applyAllFacets}
                      />
                    )
                  }
                  case 'xs:dateTime': {
                    datatype = 'dateTime';
                    return Object.entries(facet).length !== 0 && (
                      <DateTimeFacet
                        constraint={pathIndex.entityPath}
                        name={pathIndex.entityPath}
                        datatype={datatype}
                        key={facet.facetName}
                        onChange={onDateTimeFacetChange}
                        applyAllFacets={applyAllFacets}
                      />
                    )
                  }
                  case 'xs:int': {
                    datatype = 'int';
                    step = 1;
                    break;
                  }
                  case 'xs:integer': {
                    datatype = 'integer';
                    step = 1;
                    break;
                  }
                  case 'xs:short': {
                    datatype = 'short';
                    step = 1;
                    break;
                  }
                  case 'xs:long': {
                    datatype = 'long';
                    step = 1;
                    break;
                  }
                  case 'xs:decimal': {
                    datatype = 'decimal';
                    step = 0.1;
                    break;
                  }
                  case 'xs:double': {
                    datatype = 'double';
                    step = 0.1;
                    break;
                  }
                  case 'xs:float': {
                    datatype = 'float';
                    step = 0.1;
                    break;
                  }
                  //add date type cases
  
                  default:
                    break;
                }
  
                if (step && facet.facetValues.length) {
                  return (
                    <div key={index}>
                      <NumericFacet
                        constraint={pathIndex.entityPath}
                        name={pathIndex.entityPath}
                        step={step}
                        referenceType={facet.referenceType}
                        entityTypeId={facet.entityTypeId}
                        propertyPath={facet.propertyPath}
                        datatype={datatype}
                        key={facet.facetName}
                        onChange={onNumberFacetChange}
                        applyAllFacets={applyAllFacets}
                      />
                    </div>
                  )
                }                
              }
            }) :
              <div>No Facets</div>
            }
          </Panel>
        )}
        <Panel id="hub-properties" header={<div className={styles.title}>Hub Properties</div>} key="hubProperties" style={{ borderBottom: 'none' }}>
          <div className={styles.facetName} data-cy='created-on-facet'>Created On<Tooltip title={tooltips.createdOn} placement="topLeft">
            <FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" /></Tooltip></div>
          <RangePicker
            id="range-picker"
            className={styles.datePicker}
            onChange={onDateChange}
            value={datePickerValue}
          />
          {showApply && (
            <div className={styles.applyButtonContainer}>
              <MlButton
                type="primary"
                size="small"
                data-cy={"datepicker-apply-button"}
                onClick={() => applyAllFacets()}
              >Apply</MlButton>
            </div>
          )}
          {hubFacets.map(facet => {
            return facet && (
              <Facet
                name={facet.hasOwnProperty('displayName') ? facet.displayName : facet.facetName}
                constraint={facet.facetName}
                facetValues={facet.facetValues}
                key={facet.facetName}
                tooltip={facet.tooltip}
                facetType={facet.type}
                facetCategory="hub"
                updateSelectedFacets={updateSelectedFacets}
                applyAllFacets={applyAllFacets}
                addFacetValues={addFacetValues}
                referenceType={facet.referenceType}
                entityTypeId={facet.entityTypeId}
                propertyPath={facet.propertyPath}
              />
            )
          })}
        </Panel>
      </Collapse>
    </div>
  );
}

export default Sidebar;