import React,{ useState } from 'react';
import { Slider, Handles } from '@marklogic/react-compound-slider';
import './multi-slider.scss';

const MultiSlider = (props) => {

    const options = props.options;
    const handleDelete = props.handleDelete
    const handleEdit = props.handleEdit
    const [activeHandleIdOptions, setActiveHandleIdOptions] = useState<object>({});


    function Handle({handle: { id, value, percent },
                               options: options,
                               getHandleProps
                           }) { return (
        <>
            <div className={'tooltipContainer'} style={{ left: `${percent}%` }}>
                {activeHandleIdOptions.hasOwnProperty('prop') && options[0].prop == activeHandleIdOptions['prop'] && activeHandleIdOptions.hasOwnProperty('type') && options[0].type == activeHandleIdOptions['type']? <div className="tooltip">
                    {options.map((opt, i) => (
                        <div className="activeTooltipText" data-testid={`${options[0].prop}-active-tooltip`} key={i}>
                            <span data-testid={`edit-${options[0].prop}`} onClick={()=> handleEdit({...options[0], sliderType: props.type})}><span>{opt.prop}</span> {opt.type.length ? `-  ${opt.type}` : ''}</span>
                            <div data-testid={`delete-${options[0].prop}`} className="clearIcon" onClick={() => handleDelete({...options[0], sliderType: props.type})}>X</div>
                        </div>)
                    )}
                </div>
                    :
                    <div className="tooltip">
                    {options.map((opt, i) => (
                        <div className="tooltipText"  data-testid={`${options[0].prop}-tooltip`} key={i}>
                            <span data-testid={`edit-${options[0].prop}`} onClick={()=> handleEdit({...options[0], sliderType: props.type})}><span>{opt.prop}</span>  {opt.type.length ? `-  ${opt.type}` : ''}</span>
                            <div data-testid={`delete-${options[0].prop}`} className="clearIcon" onClick={() => handleDelete({...options[0], sliderType: props.type})}>X</div>
                        </div>
                    ))}
                    </div>
                }
            </div>
            <div
                className={'handle'}
                data-testid={`${options[0].prop}-active`}
                style={{
                    left: `${percent}%`,
                }}
                {...getHandleProps(id)}
            >
            </div>
        </>
    );
    }

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

    const onSlideStart = (e, handleId ) => {
      let parsedHandleId = handleId.activeHandleID.split('-')[1];
      setActiveHandleIdOptions(options[parsedHandleId].props[0]);
    };

    const onSlideEnd = values => {
        let result = options.map((opt, i) => {
          // TODO handle multiple tooltips
          return {
            props: opt['props'][0],
            value: values[i]
          };
        });

        let sliderOptions = {
          ...activeHandleIdOptions,
          sliderType: props.type
        }
        setActiveHandleIdOptions({});
        props.handleSlider(result, sliderOptions);
    };

    return (
      <div className={'multiSlider'}>
        <Slider
            mode={1}
            className={'slider'}
            domain={[0, 12]}
            values={options.map(opt => opt.value)} // Array of starting values
            step={0.1}
            onUpdate={onUpdate}
            onChange={onChange}
            onSlideStart={onSlideStart}
            onSlideEnd={onSlideEnd}
        >
          <div className={'sliderRail'} data-testid={`${props.type}-slider-rail`}/>
          <Handles>
            {({ handles, getHandleProps }) => {
              return (
                  <div className={'sliderHandles'} data-testid='slider-handles'>
                  { handles.map((handle, index) => {
                    return (
                      <Handle
                        key={handle.id}
                        handle={handle}
                        options={options[index].props}
                        getHandleProps={getHandleProps}
                      />
                    ); }
                  ) }
                  </div>
              );
            }}
          </Handles>
        </Slider>
          <div className={'sliderOptions'} data-testid={`${props.type}-slider-options`}><span>LOW</span><span>MEDIUM</span><span>HIGH</span></div>
      </div>
    );
};

export default MultiSlider;
