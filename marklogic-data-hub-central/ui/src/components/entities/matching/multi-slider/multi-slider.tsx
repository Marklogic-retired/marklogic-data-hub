import React from 'react'
import { Slider, Handles } from '@marklogic/react-compound-slider'
import './multi-slider.scss';

export function Handle({
  handle: { id, value, percent },
  options: options,
  getHandleProps
}) { return (
    <>
      <div className={'tooltipContainer'} style={{ left: `${percent}%` }}>
        <div className="tooltip">
          { options.map((opt, i) => (
              <div className="tooltipText" key={i}> {opt.prop} - {opt.type} </div>
          )) }
        </div>
      </div>
      <div 
        className={'handle'}
        style={{
          left: `${percent}%`,
        }}
        {...getHandleProps(id)}
      >
      </div>
    </>
  )
}

const MultiSlider = (props) => {

    const options = props.options;

    const onUpdate = values => {
      // console.log('onUpdate values', values);
    }

    const onChange = values => {
      let result = options.map((opt, i) => {
        // TODO handle multiple tooltips
        return {
          props: opt['props'][0],
          value: values[i]
        }
      })
      props.handleSlider(result);
    }

    const onSlideStart = values => {
      // console.log('onSlideStart values', values);
    }

    const onSlideEnd = values => {
      // console.log('onSlideEnd values', values);
    }

    return (
      <div className={'multiSlider'}>
        <Slider
            mode={1} 
            className={'slider'}
            domain={[0, 64]}
            values={options.map(opt => opt.value)} // Array of starting values
            step={1}
            onUpdate={onUpdate}
            onChange={onChange}
            onSlideStart={onSlideStart}
            onSlideEnd={onSlideEnd}
        >
          <div className={'sliderRail'}/>
          <Handles>
            {({ handles, getHandleProps }) => { 
              return (
                  <div className={'sliderHandles'}>
                  { handles.map((handle, index) => {
                    return (
                      <Handle
                        key={handle.id}
                        handle={handle}
                        options={options[index].props}
                        getHandleProps={getHandleProps}
                      />
                    ) }
                  ) }
                  </div>
              )
            }}
          </Handles>
        </Slider>
      </div>
    )
}

export default MultiSlider;