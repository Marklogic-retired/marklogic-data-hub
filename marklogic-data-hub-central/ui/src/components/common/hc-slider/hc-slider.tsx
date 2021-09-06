import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import styles from "./hc-slider.module.scss";

const {createSliderWithTooltip} = Slider;
const Range = createSliderWithTooltip(Slider.Range);

interface Props {
  minLimit: number;
  maxLimit: number;
  min: number;
  max: number;
  onChange?: (value: number[]) => void;
}

const HCSlider: React.FC<Props> = (props) => {

  const {minLimit, maxLimit, min, max, onChange} = props;

  return (
    <div style={{width: 520, padding: 6}} data-testid="hc-slider-component">
      <Range
        tipFormatter={value => `${value}`}
        tipProps={{
          placement: "top",
        }}
        min={minLimit}
        max={maxLimit}
        value={[min, max]}
        trackStyle={[{height: "4.5px", backgroundColor: "#a9b1c9"}]}
        handleStyle={[{border: "solid 2px #c9cdd6"}]}
        onChange={onChange}
        className={styles.rcSliderTrack}/>
    </div>
  );
};

export default HCSlider;