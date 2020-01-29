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
  // updateSelectedSliderFacets: (constraint: string, vals: number[]) => void;
  applyAllFacets: () => void;
};

const NumericFacet: React.FC<Props> = (props) => {
  const {
    searchOptions,
  } = useContext(SearchContext);

  const [range, setRange] = useState<number[]>([]);
  const [rangeLimit, setRangeLimit] = useState<number[]>([]);
  const [selectedRange, setSelectedRange] = useState<number[]>([]);
  const [showApply, toggleApply] = useState(false);

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
      setRange(range)
    }
  }

  const onChange = (e) => {
      setRange(e);
      toggleApply(true);
      setSelectedRange(e);
      // props.updateSelectedSliderFacets(props.constraint, selectedRange);
      props.onChange(props.datatype, props.facet.facetName, e)
  }


  const onChangeMinInput = (e) => {
    if (e && typeof e === 'number') {
      let modifiedRange = [...range];
      modifiedRange[0] = e;
      setRange(modifiedRange);
      toggleApply(true);
      setSelectedRange(modifiedRange);
      // props.updateSelectedSliderFacets(props.constraint, selectedRange);
      props.onChange(props.datatype, props.facet.facetName, modifiedRange)
    }
  }

  const onChangeMaxInput = (e) => {
    if (e && typeof e === 'number') {
      let modifiedRange = [...range];
      modifiedRange[1] = e;
      setRange(modifiedRange);
      toggleApply(true);
      setSelectedRange(modifiedRange);
      // props.updateSelectedSliderFacets(props.constraint, selectedRange);
      props.onChange(props.datatype, props.facet.facetName, modifiedRange)
    }
  }

  useEffect(() => {
    getFacetRange();
  }, []);

  useEffect(() => {
    if (Object.entries(searchOptions.searchFacets).length !== 0 && searchOptions.searchFacets.hasOwnProperty(props.constraint)) {
      for (let facet in searchOptions.searchFacets) {
        if (facet === props.constraint) {
          // checking if arrays are equivalent
          console.log('searchOptions.searchFacets',searchOptions.searchFacets)
          // if (JSON.stringify(changed) === JSON.stringify([...searchOptions.searchFacets[facet]])) {
          //   toggleApply(false);
          // } else {
          //   setChanged([...searchOptions.searchFacets[facet]]);
          // }
        }
      }
    } else {
      setSelectedRange([]);
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
            // data-cy={stringConverter(props.name) +"-facet-apply-button"}
            onClick={() => props.applyAllFacets()}
          >Apply</Button>
        </div>
      )}
    </div>
  )
}

export default NumericFacet;
