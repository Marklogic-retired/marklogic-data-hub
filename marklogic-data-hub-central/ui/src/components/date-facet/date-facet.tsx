import React, { useState, useEffect, useContext } from 'react';
import { DatePicker } from 'antd';
import { SearchContext } from '../../util/search-context';
import styles from './date-facet.module.scss';
import moment from 'moment';

const { RangePicker } = DatePicker;

interface Props {
    name: any
    constraint: string;
    datatype: any
    key: any
    propertyPath: string
    onChange: (datatype: any, facetName: any, value: any[], isNested: boolean) => void;
};

const DateFacet: React.FC<Props> = (props) => {
    const {
        searchOptions,
    } = useContext(SearchContext);

    const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);

    const onChange = (e) => {
        let isNested = props.constraint === props.propertyPath ? false : true;
        props.onChange(props.datatype, props.name, e, isNested);
        (e[0] && e[1]) && setDatePickerValue([moment(e[0].format('YYYY-MM-DD')), moment(e[1].format('YYYY-MM-DD'))])
    }

    useEffect(() => {
        if (Object.entries(searchOptions.selectedFacets).length !== 0 && searchOptions.selectedFacets.hasOwnProperty(props.constraint)) {
            for (let facet in searchOptions.selectedFacets) {
                if (facet === props.constraint) {
                    setDatePickerValue([moment(searchOptions.selectedFacets[facet].rangeValues.lowerBound), moment(searchOptions.selectedFacets[facet].rangeValues.upperBound)])
                }
            }
        }
        else {
            setDatePickerValue([null, null]);
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
        <div className={styles.name} data-testid="facet-date-picker">
            <p className={styles.name} >{formatTitle()}</p>
            <RangePicker
                // className={styles.datePicker}
                onChange={onChange}
                value={datePickerValue}
                key={props.name}
            />
        </div>
    )
}

export default DateFacet;
