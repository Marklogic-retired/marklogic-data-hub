import React, { useState, useEffect, useContext } from 'react';
import { Slider, InputNumber, Button } from 'antd';
import { SearchContext } from '../../util/search-context';
import styles from './numeric-facet.module.scss';
import axios from "axios";

interface Props {
  facet: any
  step: number
  constraint: string;
  datatype: any
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
        "schemaName": searchOptions.entityNames[0],
        "entityName": searchOptions.entityNames[0],
        "facetName": props.facet.facetName
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
    props.onChange(props.datatype, props.facet.facetName, e)
  }

  const onChangeMinInput = (e) => {
    if (e && typeof e === 'number') {
      let modifiedRange = [...range];
      modifiedRange[0] = e;
      setRange(modifiedRange);
      toggleApply(true);
      props.onChange(props.datatype, props.facet.facetName, modifiedRange)
    }
  }

  const onChangeMaxInput = (e) => {
    if (e && typeof e === 'number') {
      let modifiedRange = [...range];
      modifiedRange[1] = e;
      setRange(modifiedRange);
      toggleApply(true);
      props.onChange(props.datatype, props.facet.facetName, modifiedRange)
    }
  }

  const updateRange = () => {
    let facets = searchOptions.searchFacets;
    let constraints = Object.keys(facets)
    let modifiedRange = [...range];
    if (constraints && constraints.length > 1) {
    constraints.forEach(facet => {
      if (facets[facet].hasOwnProperty('rangeValues') && props.facet.facetName === facet) {
        modifiedRange[0] = Number(facets[facet].rangeValues.lowerBound);
        modifiedRange[1] = Number(facets[facet].rangeValues.upperBound);
        setRange(modifiedRange)
      }
    });
     }
  }

  useEffect(() => {
    getFacetRange();
  }, []);

  useEffect(() => {
    let s = Object.keys(searchOptions.searchFacets);
    if (!s.includes(props.facet.facetName)) {
      setRange(rangeLimit)
    }

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

  return (
    <div className={styles.facetName} >
      <p className={styles.name}>{props.facet.facetName}</p>
      <div className={styles.numericFacet}>
        <Slider className={styles.slider} range={true} value={[range[0], range[1]]} min={rangeLimit[0]} max={rangeLimit[1]} step={props.step} onChange={(e) => onChange(e)} />
        <InputNumber className={styles.inputNumber} value={range[0]} min={rangeLimit[0]} max={rangeLimit[1]} step={props.step} onChange={onChangeMinInput} />
        <InputNumber className={styles.inputNumber} value={range[1]} min={rangeLimit[0]} max={rangeLimit[1]} step={props.step} onChange={onChangeMaxInput} />
      </div>
      {showApply && (
        <div className={styles.applyButtonContainer}>
          <Button
            type="primary"
            size="small"
            onClick={() => props.applyAllFacets()}
          >Apply</Button>
        </div>
      )}
    </div>
  )
}

export default NumericFacet;
