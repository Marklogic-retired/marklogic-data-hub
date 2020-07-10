import React, { useState, useEffect, useContext, CSSProperties } from 'react';
import {Collapse, Icon, DatePicker, Tooltip, Select} from 'antd';
import moment from 'moment';
import Facet from '../facet/facet';
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
import { MLTooltip } from '@marklogic/design-system';



const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { Option } = Select;
const tooltips = tooltipsConfig.browseDocuments;

interface Props {
  facets: any;
  selectedEntities: string[];
  entityDefArray: any[];
  facetRender: (facets: any) => void;
  checkFacetRender: (facets:any) =>void;
};

const Sidebar: React.FC<Props> = (props) => {
  const {
    searchOptions,
    setAllSearchFacets,
    greyedOptions,
    setAllGreyedOptions
  } = useContext(SearchContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(searchOptions.selectedFacets);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);
  const [dateRangeValue, setDateRangeValue] = useState<string>();
  let integers = ['int', 'integer', 'short', 'long'];
  let decimals = ['decimal', 'double', 'float'];
  const dateRangeOptions = ['Today', 'This Week', 'This Month', 'Custom'];

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
      if (Object.entries(searchOptions.selectedFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for (let constraint in searchOptions.selectedFacets) {
          let displayName = '';
          let entity = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0])
          let pathIndex = entity && entity['pathIndex'].find(({ index }) => index === constraint);
          if (pathIndex && pathIndex.entityPath !== constraint) {
            displayName = pathIndex.entityPath;
          }

          if (constraint === 'createdOnRange') {
            if(searchOptions.selectedFacets && searchOptions.selectedFacets[constraint]) {
              setDateRangeValue(searchOptions.selectedFacets[constraint]['stringValues'][0]);
            }
            selectedFacets.push({ constraint, facet: searchOptions.selectedFacets[constraint], displayName });
          } else {
            setDateRangeValue("select time");
            let datatype = searchOptions.selectedFacets[constraint].dataType;
            if (datatype === 'xs:string' || datatype === 'string') {
              searchOptions.selectedFacets[constraint]['stringValues'].map(facet => {
                selectedFacets.push({ constraint, facet, displayName });
              });
            } else if (integers.includes(datatype) || decimals.includes(datatype)) {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues
              selectedFacets.push({ constraint, rangeValues, displayName });
            } else if (datatype === 'xs:date' || datatype === 'date') {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues
              selectedFacets.push({ constraint, rangeValues, displayName });
            } else if (datatype === 'xs:dateTime' || datatype === 'dateTime') {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({ constraint, rangeValues, displayName });
            }
          }
          props.facetRender(selectedFacets);
        }
        if (!selectedFacets.some(item => item.constraint === 'createdOnRange')) {
          setDatePickerValue([null, null]);
        }
      } else {
        setDateRangeValue("select time");
        props.facetRender([]);
        setAllSelectedFacets({});
        setDatePickerValue([null, null]);
      }
    }
  }, [props.selectedEntities, props.facets]);


  useEffect(() => {
      if (Object.entries(greyedOptions.selectedFacets).length !== 0) {
          let checkedFacets: any[] = [];
          for (let constraint in greyedOptions.selectedFacets) {
              let displayName = '';
              let entity = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0])
              let pathIndex = entity && entity['pathIndex'].find(({ index }) => index === constraint);
              if (pathIndex && pathIndex.entityPath !== constraint) {
                displayName = pathIndex.entityPath;
              }
              if (constraint === 'createdOnRange') {
                  checkedFacets.push({constraint, facet: greyedOptions.selectedFacets[constraint], displayName });
              } else {
                  let datatype = greyedOptions.selectedFacets[constraint].dataType;
                  if (datatype === 'xs:string' || datatype === 'string') {
                      greyedOptions.selectedFacets[constraint]['stringValues'].map(facet => {
                          checkedFacets.push({constraint, facet, displayName });
                      });
                  } else if (integers.includes(datatype) || decimals.includes(datatype)) {
                      let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues
                      checkedFacets.push({constraint, rangeValues, displayName });
                  } else if (datatype === 'xs:date' || datatype === 'date') {
                      let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues
                      checkedFacets.push({constraint, rangeValues, displayName});
                  } else if (datatype === 'xs:dateTime' || datatype === 'dateTime') {
                      let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
                      checkedFacets.push({constraint, rangeValues, displayName});
                  }
              }
              props.checkFacetRender(checkedFacets);
          }
          if (!checkedFacets.some(item => item.constraint === 'createdOnRange')) {
              setDatePickerValue([null, null]);
          }
      } else {
          if (Object.entries(searchOptions.selectedFacets).length === 0) {
              setAllSearchFacets({});
              setAllSelectedFacets({});
          } else{
              setAllSelectedFacets(searchOptions.selectedFacets);
          }
          props.checkFacetRender([]);
      }
  }, [greyedOptions]);

  const updateSelectedFacets = (constraint: string, vals: string[], datatype: string, isNested: boolean) => {
    let facets = { ...allSelectedFacets };
    let type = '';
    let valueKey = '';
    let facetName = constraint;

    if (isNested) {
      let splitFacet = constraint.split('.');
      facetName = splitFacet.pop()!;
    }

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
        [facetName]: {
          dataType: type,
          [valueKey]: vals
        }
      };
    } else {
      delete facets[facetName];
    }
    setAllSelectedFacets(facets);
    setAllGreyedOptions(facets);
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
    setAllGreyedOptions(newAllSelectedfacets);
  }

  const handleOptionSelect = (option: any) => {
    setDateRangeValue(option);
    if(option === 'Custom') {
      setDatePickerValue([null, null]);
    }
    let updateFacets = { ...allSelectedFacets };
    updateFacets = {
      ...updateFacets, createdOnRange:
          {
            dataType: 'date',
            stringValues: [option, (-1 * new Date().getTimezoneOffset())],
            rangeValues: { lowerBound: "", upperBound: "" }
          }
    };
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  };

  const timeWindow = (selectedDateRangeValue) => {
    let date = "";
    if(selectedDateRangeValue === 'This Week') {
      const startOfWeek = moment().startOf('week').format("MMM DD");
      const endOfWeek = moment().format("MMM DD");
      date = "(" + startOfWeek + " - " + endOfWeek + ")";
    }

    if(selectedDateRangeValue === 'This Month') {
      const startOfMonth = moment().startOf('month').format("MMM DD");
      const endOfMonth   = moment().format("MMM DD");
      date = "(" + startOfMonth + " - " + endOfMonth + ")";
    }

    return date;
  };

  const onDateChange = (dateVal, dateArray) => {
    let updateFacets = { ...allSelectedFacets };
    if (dateVal.length > 1) {
        updateFacets = {
            ...updateFacets, createdOnRange:
                {
                    dataType: 'date',
                    stringValues: ["Custom", (-1 * new Date().getTimezoneOffset())],
                    rangeValues: { lowerBound: moment(dateArray[0]).format(), upperBound: moment(dateArray[1]).format() }
                }
        }

        setDatePickerValue([moment(dateArray[0]), moment(dateArray[1])]);
    } else {
        delete updateFacets.createdOnRange;
        setDatePickerValue([null, null]);
    }
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  }

  const onNumberFacetChange = (datatype, facet, value, isNested) => {
    let updateFacets = { ...allSelectedFacets };
    let facetName = setFacetName(facet, isNested);
    if (value.length > 1) {
      updateFacets = { ...updateFacets, [facetName]: { dataType: datatype, rangeValues: { lowerBound: value[0].toString(), upperBound: value[1].toString() } } }
    }
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  }

  const onDateFacetChange = (datatype, facet, value, isNested) => {
    let updateFacets = { ...allSelectedFacets };
    let facetName = setFacetName(facet, isNested);
    if (value.length > 1) {
      updateFacets = { ...updateFacets, [facetName]: { dataType: datatype, rangeValues: { lowerBound: moment(value[0]).format('YYYY-MM-DD'), upperBound: moment(value[1]).format('YYYY-MM-DD') } } }
    }
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  }

  const onDateTimeFacetChange = (datatype, facet, value, isNested) => {
    let updateFacets = { ...allSelectedFacets };
    let facetName = setFacetName(facet, isNested);
    if (value.length > 1) {
      updateFacets = { ...updateFacets, [facetName]: { dataType: datatype, rangeValues: { lowerBound: moment(value[0]).format('YYYY-MM-DDTHH:mm:ss'), upperBound: moment(value[1]).format('YYYY-MM-DDTHH:mm:ss') } } }
    }
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  }

  const setFacetName = (facet: string, isNested: boolean) => {
    let name = facet;
    if (isNested) {
      let splitFacet = facet.split('.');
      name = splitFacet.pop() || '';
    }
    return name;
  }

  const facetPanelStyle: CSSProperties = {
    borderBottom: 'none',
    backgroundColor: '#F1F2F5'
  }

  return (
    <div className={styles.sideBarContainer} id={'sideBarContainer'}>
      <Collapse
        className={styles.sideBarFacets}
        defaultActiveKey={['entityProperties']}
        expandIcon={panelProps => <Icon type="up" rotate={panelProps.isActive ? 0 : 180} />}
        expandIconPosition="right"
        bordered={false}
      >
        {props.selectedEntities.length === 1 && (
          <Panel id="entity-properties" header={<div className={styles.title}>Entity Properties</div>} key="entityProperties" style={facetPanelStyle}>
            {entityFacets.length ? entityFacets.map((facet, index) => {
              let datatype = '';
              let step;
              let entity = props.entityDefArray.find(entity => entity.name === props.selectedEntities[0])
              let pathIndex = entity && entity['pathIndex'].find(({ index }) => index === facet.facetName);
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
                        propertyPath={facet.propertyPath}
                        onChange={onDateFacetChange}
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
                        propertyPath={facet.propertyPath}
                        onChange={onDateTimeFacetChange}
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
        <Panel id="hub-properties" header={<div className={styles.title}>Hub Properties</div>} key="hubProperties" style={facetPanelStyle}>
          <div className={styles.facetName} data-cy='created-on-facet'>Created On<MLTooltip title={tooltips.createdOn} placement="topLeft">
            <FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" /></MLTooltip></div>
          <div>
            <Select
                style={{ width: 150 }}
                placeholder="Select time"
                id="date-select"
                value={dateRangeValue}
                onChange={value => handleOptionSelect(value)}
            >{
              dateRangeOptions.map((timeBucket, index) => {
                return <Option key={index} value={timeBucket}>
                  {timeBucket}
                </Option>
              })
            }</Select>
          </div>
          <div className={styles.dateTimeWindow} >
            {timeWindow(dateRangeValue)}
          </div>
          {dateRangeValue === 'Custom' && <RangePicker
            id="range-picker"
            className={styles.datePicker}
            onChange={onDateChange}
            value={datePickerValue}
          />}
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
