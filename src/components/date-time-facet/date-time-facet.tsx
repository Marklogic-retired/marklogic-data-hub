import React, { useState, useEffect, useContext } from 'react';
import { DatePicker } from 'antd';
import { MlButton } from 'marklogic-ui-library';
import { SearchContext } from '../../util/search-context';
import moment from 'moment';
import styles from './date-time-facet.module.scss';

const { RangePicker } = DatePicker;

interface Props {
  name: any
  constraint: string;
  datatype: any
  key: any
  onChange: (datatype: any, facetName: any, value: any[]) => void;
  applyAllFacets: () => void;
};

const DateTimeFacet: React.FC<Props> = (props) => {
  const {
    searchOptions,
  } = useContext(SearchContext);

  const [showApply, toggleApply] = useState(false);
  const [dateTimePickerValue, setDateTimePickerValue] = useState<any[]>([null, null]);

  const onChange = (e) => {
    toggleApply(true);
    props.onChange(props.datatype, props.name, e);
    (e[0] && e[1]) && setDateTimePickerValue([moment(e[0].format('YYYY-MM-DDTHH:mm:ss')), moment(e[1].format('YYYY-MM-DDTHH:mm:ss'))])
  }

  useEffect(() => {
    if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.searchFacets) {
        if (facet === props.constraint) {
          setDateTimePickerValue([moment(searchOptions.searchFacets[facet].rangeValues.lowerBound), moment(searchOptions.searchFacets[facet].rangeValues.upperBound)])
          toggleApply(false);
        }
      }
    }
    else {
      setDateTimePickerValue([null, null]);
    }
  }, [searchOptions]);

  const formatTitle = () => {
    let objects = props.name.split('.');
    if (objects.length > 2) {
      let first = objects[0];
      let last = objects.slice(-1);
      return first + '. ... .' + last;
    }
    return props.name;
  }

  return (
    <div className={styles.name} >
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
      <br/>
      {showApply && (
        <div className={styles.applyButton}>
          <MlButton
            type="primary"
            size="small"
            onClick={() => props.applyAllFacets()}
          >Apply</MlButton>
        </div>
      )}
    </div>
  )
}

export default DateTimeFacet;