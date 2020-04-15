import React, { useState, useEffect, useContext } from 'react';
import { Slider, InputNumber, Tooltip } from 'antd';
import { SearchContext } from '../../util/search-context';
import { UserContext } from '../../util/user-context';
import styles from './numeric-facet.module.scss';
import { rangeFacet } from '../../api/facets'

interface Props {
  name: any;
  step: number;
  constraint: string;
  datatype: any;
  referenceType: string;
  entityTypeId: any;
  propertyPath: any;
  onChange: (datatype: any, facetName: any, value: any[], isNested: boolean) => void;
};

const NumericFacet: React.FC<Props> = (props) => {
  const {
    searchOptions,
  } = useContext(SearchContext);
  const { handleError, resetSessionTime } = useContext(UserContext);

  const [range, setRange] = useState<number[]>([]);
  const [rangeLimit, setRangeLimit] = useState<number[]>([]);
  let numbers = ['int', 'integer', 'short', 'long', 'decimal', 'double', 'float'];

  const getFacetRange = async () => {
    try {
      const response = await rangeFacet(props)
      if (response['data']) {
        let range = [...[response.data.min, response.data.max].map(Number)]
        setRangeLimit(range)
        setRange(range);

        if (Object.entries(searchOptions.selectedFacets).length !== 0) {
          let facetName: string = '';
          if (searchOptions.selectedFacets.hasOwnProperty(props.constraint)) {
            facetName = props.constraint;
          } else if (searchOptions.selectedFacets.hasOwnProperty(props.propertyPath) && props.constraint !== props.propertyPath) {
            facetName = props.propertyPath;
          }
          if (facetName) {
            for (let facet in searchOptions.selectedFacets) {
              if (facet === facetName) {
                let valueType = '';
                if (numbers.includes(searchOptions.selectedFacets[facet].dataType)) {
                  valueType = 'rangeValues';
                }
                if (searchOptions.selectedFacets[facet][valueType]) {
                  const rangeArray = Object.values(searchOptions.selectedFacets[facet][valueType]).map(Number)
                  if (rangeArray && rangeArray.length > 0) {
                    setRange(rangeArray)
                  }
                }
              }
            }
          } else {
            // setRange([]);
          }
        }
      }
    } catch (error) {
      handleError(error)
    } finally {
      resetSessionTime()
    }

  }

  const onChange = (e) => {
    let isNested = props.name === props.propertyPath ? false : true;
    setRange(e);
    props.onChange(props.datatype, props.name, e, isNested)
  }

  const onChangeMinInput = (e) => {
    if (e && typeof e === 'number') {
      let isNested = props.name === props.propertyPath ? false : true;
      let modifiedRange = [...range];
      modifiedRange[0] = e;
      setRange(modifiedRange);
      props.onChange(props.datatype, props.name, modifiedRange, isNested)
    }
  }

  const onChangeMaxInput = (e) => {
    if (e && typeof e === 'number') {
      let isNested = props.name === props.propertyPath ? false : true;
      let modifiedRange = [...range];
      modifiedRange[1] = e;
      setRange(modifiedRange);
      props.onChange(props.datatype, props.name, modifiedRange, isNested)
    }
  }

  useEffect(() => {
    getFacetRange();
  }, [searchOptions.selectedFacets]);

  useEffect(() => {
    !Object.keys(searchOptions.selectedFacets).includes(props.name) && setRange(rangeLimit)

    if (Object.entries(searchOptions.selectedFacets).length !== 0) {

      let facetName: string = '';
      if (searchOptions.selectedFacets.hasOwnProperty(props.constraint)) {
        facetName = props.constraint;
      } else if (searchOptions.selectedFacets.hasOwnProperty(props.propertyPath)) {
        facetName = props.propertyPath;
      }

      if (facetName) {
        for (let facet in searchOptions.selectedFacets) {
          if (facet === facetName) {
            let valueType = '';
            if (numbers.includes(searchOptions.selectedFacets[facet].dataType)) {
              valueType = 'rangeValues';
            }
            if (searchOptions.selectedFacets[facet][valueType]) {
              const rangeArray = Object.values(searchOptions.selectedFacets[facet][valueType]).map(Number)
              if (JSON.stringify(range) === JSON.stringify(rangeArray)) {
                if (rangeLimit[0] === rangeArray[0] && rangeLimit[1] === rangeArray[1]) {
                  delete searchOptions.selectedFacets[facet]
                }
              }
            }
          }
        }
      }
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
    </div>
  )
}

export default NumericFacet;
