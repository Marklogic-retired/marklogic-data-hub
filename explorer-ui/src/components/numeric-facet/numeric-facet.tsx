import React, { useState, useEffect, useContext } from 'react';
import { Slider, InputNumber, Tooltip } from 'antd';
import { MlButton } from 'marklogic-ui-library';
import { SearchContext } from '../../util/search-context';
import styles from './numeric-facet.module.scss';
import axios from "axios";

interface Props {
  name: any
  step: number
  constraint: string;
  datatype: any
  referenceType: string;
  entityTypeId: any;
  propertyPath: any;
  onChange: (datatype: any, facetName: any, value: any[]) => void;
  applyAllFacets: () => void;
};

const NumericFacet: React.FC<Props> = (props) => {
  const {
    searchOptions,
  } = useContext(SearchContext);

  const [range, setRange] = useState<number[]>([]);
  const [rangeLimit, setRangeLimit] = useState<number[]>([]);
  const [showApply, toggleApply] = useState(false);
  let numbers = ['int', 'integer', 'short', 'long', 'decimal', 'double', 'float'];

  const getFacetRange = async () => {
    const response = await axios({
      method: 'POST',
      url: `/datahub/v2/search/facet-values/range`,
      data: {
        "referenceType": props.referenceType,
        "entityTypeId": props.entityTypeId,
        "propertyPath": props.propertyPath
      }
    });

    if (response.data) {
      let range = [...[response.data.min, response.data.max].map(Number)]
      setRangeLimit(range)

      if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
        for (let facet in searchOptions.searchFacets) {
          if (facet === props.constraint) {
            let valueType = '';
            if (numbers.includes(searchOptions.searchFacets[facet].dataType)) {
              valueType = 'rangeValues';
            }
            if (searchOptions.searchFacets[facet][valueType]) {
              const rangeArray = Object.values(searchOptions.searchFacets[facet][valueType]).map(Number)
              if (rangeArray && rangeArray.length > 0) {
                setRange(rangeArray)
              }
            }
          }
        }
      } else {
        setRange(range)
      }
    }
  }

  const onChange = (e) => {
    setRange(e);
    toggleApply(true);
    props.onChange(props.datatype, props.name, e)
  }

  const onChangeMinInput = (e) => {
    if (e && typeof e === 'number') {
      let modifiedRange = [...range];
      modifiedRange[0] = e;
      setRange(modifiedRange);
      toggleApply(true);
      props.onChange(props.datatype, props.name, modifiedRange)
    }
  }

  const onChangeMaxInput = (e) => {
    if (e && typeof e === 'number') {
      let modifiedRange = [...range];
      modifiedRange[1] = e;
      setRange(modifiedRange);
      toggleApply(true);
      props.onChange(props.datatype, props.name, modifiedRange)
    }
  }

  useEffect(() => {
    getFacetRange();
  }, []);

  useEffect(() => {
    !Object.keys(searchOptions.searchFacets).includes(props.name) && setRange(rangeLimit)

    if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.searchFacets) {
        if (facet === props.constraint) {
          let valueType = '';
          if (numbers.includes(searchOptions.searchFacets[facet].dataType)) {
            valueType = 'rangeValues';
          }
          if (searchOptions.searchFacets[facet][valueType]) {
            const rangeArray = Object.values(searchOptions.searchFacets[facet][valueType]).map(Number)
            if (JSON.stringify(range) === JSON.stringify(rangeArray)) {
              toggleApply(false);
              if(rangeLimit[0] === rangeArray[0] && rangeLimit[1] === rangeArray[1]) {
                delete searchOptions.searchFacets[facet]
              }
            } else {
              setRange(rangeArray)
            }
          }
        }
      }
    } else {
      toggleApply(false);
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
    <div className={styles.facetName} >
      <p className={styles.name}>{<Tooltip title={props.name}>{formatTitle()}</Tooltip>}</p>
      <div className={styles.numericFacet} data-testid='numeric-slider'>
        <Slider className={styles.slider} range={true} value={[range[0], range[1]]} min={rangeLimit[0]} max={rangeLimit[1]} step={props.step} onChange={(e) => onChange(e)} />
        <InputNumber className={styles.inputNumber} value={range[0]} min={rangeLimit[0]} max={rangeLimit[1]} step={props.step} onChange={onChangeMinInput} />
        <InputNumber className={styles.inputNumber} value={range[1]} min={rangeLimit[0]} max={rangeLimit[1]} step={props.step} onChange={onChangeMaxInput} />
      </div>
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

export default NumericFacet;
