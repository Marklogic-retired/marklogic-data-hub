import React, { useState, useEffect, useContext } from 'react';
import { DatePicker } from 'antd';
import { MlButton } from 'marklogic-ui-library';
import { SearchContext } from '../../util/search-context';
import styles from './date-facet.module.scss';
import moment from 'moment';


const { RangePicker } = DatePicker;

interface Props {
    facet: any
    constraint: string;
    datatype: any
    onChange: (datatype: any, facetName: any, value: any[]) => void;
    applyAllFacets: () => void;
  };

const DateFacet: React.FC<Props> = (props) => { 
    const {
        searchOptions,
      } = useContext(SearchContext);

      const [showApply, toggleApply] = useState(false);
      const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);

      const onChange = (e) => {
        toggleApply(true);
        props.onChange(props.datatype, props.facet.facetName, e);
        setDatePickerValue([moment(moment(e[0]).format('YYYY-MM-DD')), moment(moment(e[1]).format('YYYY-MM-DD'))])
      }
      
      useEffect(() => {
        if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
            for (let facet in searchOptions.searchFacets) {
              if (facet === props.constraint) {
                  setDatePickerValue([moment(searchOptions.searchFacets[facet].rangeValues.lowerBound), moment(searchOptions.searchFacets[facet].rangeValues.upperBound)])
                  toggleApply(false);
              } else {
  
              }
            }
          } 

      }, []);

      useEffect(() => {    
        if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
          for (let facet in searchOptions.searchFacets) {
            if (facet === props.constraint) {
                setDatePickerValue([moment(searchOptions.searchFacets[facet].rangeValues.lowerBound), moment(searchOptions.searchFacets[facet].rangeValues.upperBound)])
                toggleApply(false);
            } else {

            }
          }
        } 
        else {
            setDatePickerValue([null, null]);
        //   toggleApply(true);
        }
      }, [searchOptions]);

      return (
        <div className={styles.name} >
            {console.log('datePickerValue',datePickerValue)}
            <p>{props.facet.facetName}</p>
             <RangePicker
             // id="range-picker"
              className={styles.datePicker}
             onChange={onChange} 
             value={datePickerValue}
      />
      {showApply && (
        <div className={styles.applyButtonContainer}>
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


export default DateFacet;