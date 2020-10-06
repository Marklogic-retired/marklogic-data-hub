import React, { useState, useEffect, useContext } from 'react';
import { DatePicker } from 'antd';
import { SearchContext } from '../../util/search-context';
import moment from 'moment';
import styles from './date-time-facet.module.scss';

const { RangePicker } = DatePicker;

interface Props {
  name: any
  constraint: string;
  datatype: any
  key: any
  propertyPath: string
  onChange: (datatype: any, facetName: any, value: any[], isNested: boolean) => void;
}

const DateTimeFacet: React.FC<Props> = (props) => {
  const {
    searchOptions,
    greyedOptions,
  } = useContext(SearchContext);
  const [dateTimePickerValue, setDateTimePickerValue] = useState<any[]>([null, null]);

  const onChange = (e) => {
    let isNested = props.constraint === props.propertyPath ? false : true;
    if (e.length) {
      props.onChange(props.datatype, props.constraint, e, isNested);
      (e[0] && e[1]) && setDateTimePickerValue([moment(e[0].format('YYYY-MM-DDTHH:mm:ss')), moment(e[1].format('YYYY-MM-DDTHH:mm:ss'))]);
    } else {
      props.onChange(props.datatype, props.constraint, e, isNested);
    }
  };

  useEffect(() => {
    if (Object.entries(searchOptions.selectedFacets).length !== 0 && searchOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.selectedFacets) {
        if (facet === props.constraint) {
          setDateTimePickerValue([moment(searchOptions.selectedFacets[facet].rangeValues.lowerBound), moment(searchOptions.selectedFacets[facet].rangeValues.upperBound)]);
        }
      }
    } else if (Object.entries(greyedOptions.selectedFacets).length !== 0 && greyedOptions.selectedFacets.hasOwnProperty(props.constraint)) {
      for (let facet in greyedOptions.selectedFacets) {
        if (facet === props.constraint) {
          setDateTimePickerValue([moment(greyedOptions.selectedFacets[facet].rangeValues.lowerBound), moment(greyedOptions.selectedFacets[facet].rangeValues.upperBound)]);
        }
      }
    }
    else {
      setDateTimePickerValue([null, null]);
    }
  }, [searchOptions, greyedOptions]);

  const formatTitle = () => {
    let objects = props.name.split('.');
    if (objects.length > 2) {
      let first = objects[0];
      let last = objects.slice(-1);
      return first + '. ... .' + last;
    }
    return props.name;
  };

  return (
    <div className={styles.name} data-testid="facet-date-time-picker">
      <p className={styles.facetName}>{formatTitle()}</p>
      <RangePicker
        showTime={{ format: 'HH:mm:ss' }}
        format="YYYY-MM-DD HH:mm:ss"
        placeholder={['Start Date Time', 'End Date Time']}
        onChange={onChange}
        //onOk={onOk}
        value={dateTimePickerValue}
        key={props.name}
      />
    </div>
  );
};

export default DateTimeFacet;
