import React, {useState} from "react";
import {Icon} from "antd";
import {Slider, Handles, Ticks, Rail, GetRailProps} from "@marklogic/react-compound-slider";
import "./multi-slider.scss";
import {multiSliderTooltips} from "../../../../config/tooltips.config";
import HCTooltip from "../../../common/hc-tooltip/hc-tooltip";

const MultiSlider = (props) => {

  const options = props.options;
  const handleDelete = props.handleDelete;
  const handleEdit = props.handleEdit;
  const [activeHandleIdOptions, setActiveHandleIdOptions] = useState<object>({});
  const [tickValue, setTickValue] = useState<any>(0);

  // props for slider rail
  interface SliderRailProps {
    getRailProps: GetRailProps;
  }
  const SliderRail: React.FC<SliderRailProps> = ({getRailProps}) => {
    return (
      <>
        <div className={"sliderRail"} data-testid={`${props.type}-slider-rail`} {...getRailProps()} />
        <div className={"sliderRail"} />
      </>
    );
  };

  function Handle({handle: {id, value, percent},
    options: options,
    getHandleProps,
    disabled
  }) {

    const onHover = () => {
      setTickValue(value);
    };
    const onMouseLeave = () => {
      setTickValue(0);
    };

    return (
      <>
        <div className={"tooltipContainer"} style={{left: `${percent}%`}}>
          {activeHandleIdOptions.hasOwnProperty("prop") && options[0].prop === activeHandleIdOptions["prop"] && activeHandleIdOptions.hasOwnProperty("type") && options[0].type === activeHandleIdOptions["type"]? <div className={disabled ? "tooltipDisabled" : "tooltipDisplay"}>
            {options.map((opt, i) => (
              <div className={activeHandleIdOptions["index"] === id.split("-")[1] ? "activeTooltipTextDisplay": "tooltipTextDisplay"} data-testid={`${options[0].prop}-active-tooltip`} key={i}>
                <span className="editText" data-testid={`edit-${options[0].prop}`} onClick={() => handleEdit({...options[0], sliderType: props.type, index: id.split("-")[1]})}><span>{opt.prop.split(".").join(" > ")}</span> {((opt.rulesetCategory && opt.rulesetCategory === "single") || !opt.rulesetCategory) && opt.type.length ? `-  ${opt.type}` : ""}</span>
                {disabled ? null : <div data-testid={`delete-${options[0].prop}`} className="clearIcon" onClick={() => handleDelete({...options[0], sliderType: props.type, index: id.split("-")[1]})}>X</div>}
              </div>)
            )}
          </div>
            :
            <div className={disabled ? "tooltipDisabled" : "tooltipDisplay"}>
              {options.map((opt, i) => (
                <div className="tooltipText"  data-testid={`${options[0].prop}-tooltip`} key={i}>
                  <span className="editText" data-testid={`edit-${options[0].prop}`} onClick={() => handleEdit({...options[0], sliderType: props.type, index: id.split("-")[1]})}><span aria-label={((opt.rulesetCategory && opt.rulesetCategory === "single") || !opt.rulesetCategory) && opt.type.length ? `${opt.prop}-${opt.type}`: `${opt.prop}` }>{opt.prop.split(".").join(" > ")}</span>  {((opt.rulesetCategory && opt.rulesetCategory === "single") || !opt.rulesetCategory) && opt.type.length ? `-  ${opt.type}` : ""}</span>
                  {disabled ? null : <div data-testid={`delete-${options[0].prop}`} className="clearIcon" onClick={() => handleDelete({...options[0], sliderType: props.type, index: id.split("-")[1]})}><Icon type="close" /></div>}
                </div>
              ))}
            </div>
          }
        </div>
        {<HCTooltip text={ (props.mergeStepViewOnly !== true && disabled) ?  multiSliderTooltips.timeStamp : ""} id="multi-slider-tooltip" placement="bottom">
          {disabled ?
            <div className={"handleDisabledParent"}  style={{
              left: `${percent}%`
            }}>
              <div
                className={"handleDisabled"}
                data-testid={`${options[0].prop}-active`}
                style={{
                  left: `${percent}%`,
                }}
                {...getHandleProps(id)}
              >
              </div>
            </div> : <div
              className={"handle"}
              onMouseMove={() => onHover()}
              onMouseLeave = {() => onMouseLeave()}
              data-testid={`${options[0].prop}-active`}
              style={{
                left: `${percent}%`,
              }}
              {...getHandleProps(id)}
            >
            </div> }
        </HCTooltip>}
      </>
    );
  }

  function Tick({tick, count}) {
    return (
      <div>
        <div onMouseOver={() => onHover(tick.value)}
          style={{
            position: "absolute",
            marginTop: 6,
            width: 1,
            height: 5,
            backgroundColor: "rgb(200,200,200)",
            left: `${tick.percent}%`
          }}
        />
        {(tickValue===tick.value) ?<div
          className={"tooltipValue"}
          style={{
            marginLeft: `${-(100 / count) / 2}%`,
            left: `${tick.percent}%`,
          }}
        >
          {tick.value}
        </div>:null}
      </div>

    );
  }

  const onHover = (value) => {
    setTickValue(value);
  };
  const onMouseLeave = () => {
    setTickValue(0);
  };

  const onUpdate = values => {
    // console.log('onUpdate values', values);
  };

  const onChange = values => {
    // let result = options.map((opt, i) => {
    //   // TODO handle multiple tooltips
    //   return {
    //     props: opt['props'][0],
    //     value: values[i]
    //   };
    // });
    //props.handleSlider(result);
  };

  const onSlideStart = (e, handleId) => {
    setTickValue(0);
    let parsedHandleId = handleId.activeHandleID.split("-")[1];
    setActiveHandleIdOptions({...options[parsedHandleId].props[0], index: parsedHandleId});
  };

  const onSlideEnd = values => {
    setTickValue(0);
    let result = options.map((opt, i) => {
      // TODO handle multiple tooltips
      return {
        props: opt["props"][0],
        value: values[i],
      };
    });

    let sliderOptions = {
      ...activeHandleIdOptions,
      sliderType: props.type,
      index: activeHandleIdOptions["index"]
    };
    setActiveHandleIdOptions({});
    props.handleSlider(result, sliderOptions);
  };



  return (
    <div className={"multiSlider"} onMouseLeave={onMouseLeave}>
      <Slider
        mode={1}
        className={"slider"}
        domain={[1, 100]}
        values={options.map(opt => opt.value)} // Array of starting values
        step={1}
        onUpdate={onUpdate}
        onChange={onChange}
        onSlideStart={onSlideStart}
        onSlideEnd={onSlideEnd}
      >
        <Handles>
          {({handles, getHandleProps}) => {
            return (
              <div className={"sliderHandles"} data-testid="slider-handles">
                { handles.map((handle, index) => {
                  return (
                    <Handle
                      key={handle.id}
                      handle={handle}
                      options={options[index].props}
                      getHandleProps={getHandleProps}
                      disabled={(props.stepType === "merging" && options[index].props[0].prop === "Timestamp" && options[index].props[0].type === "") || props.mergeStepViewOnly === true ? true : false}
                    />
                  );
                }
                ) }
              </div>
            );
          }}
        </Handles>
        <Rail>
          {({getRailProps}) => <SliderRail getRailProps={getRailProps} />}
        </Rail>
        <Ticks count={100}>
          {({ticks}) => (
            <div data-testid={`${props.type}-slider-ticks`} >
              {ticks.map((tick) => (
                <Tick key={tick.id} tick={tick} count={ticks.length}/>
              ))}
            </div>
          )}
        </Ticks>
      </Slider>
      <div className={"sliderOptions"} data-testid={`${props.type}-slider-options`}><span>LOW</span><span>MEDIUM</span><span>HIGH</span></div>
    </div>
  );
};

export default MultiSlider;
