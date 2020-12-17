export const parsePriorityOrder = (priorityOptions) => {
  let priorityOrder:any = {};
  priorityOrder.sources = [];
  for (let key of priorityOptions) {
    if (key.hasOwnProperty("props")) {
      if (key.props[0].prop === "Length") {
        priorityOrder.lengthWeight = key.value;
      } else {
        if (key.props[0].type) {
          priorityOrder.sources.push(
            {
              "sourceName": key.props[0].type,
              "weight": key.value
            }
          );
        }
      }
    }
  }
  return priorityOrder;
};

export const addSliderOptions =  (priorityOrderOptions, dropdownOption) => {
  let priorityOrderDropdownOptions = [...priorityOrderOptions];
  for (let key of priorityOrderDropdownOptions) {
    if (key.hasOwnProperty("props") && (key.props[0].type === dropdownOption || key.props[0].prop === dropdownOption)) {
      return priorityOrderDropdownOptions;
    }
  }
  priorityOrderDropdownOptions.push(
    {
      props: [{
        prop: (dropdownOption === "Length")? "Length": "Source",
        type: (dropdownOption === "Length")? "": dropdownOption,
      }],
      value: 0

    }
  );
  return priorityOrderDropdownOptions;
};

export const handleSliderOptions = (values, options, priorityOrderOptions:any[]) => {
  for (let key of priorityOrderOptions) {
    if (key.hasOwnProperty("props")) {
      if (key.props[0].prop === options.prop && options.type === key.props[0].type) {
        for (let val of values) {
          if (val.hasOwnProperty("props")) {
            if (val.props.prop === key.props[0].prop && val.props.type === key.props[0].type) {
              key.value = val.value;
            }
          }
        }
      }
    }
  }
  return priorityOrderOptions;
};

export const handleDeleteSliderOptions = (options, priorityOrderOptions) => {
  let priorityOrderDropdownOptions = [...priorityOrderOptions];
  for (let index in priorityOrderDropdownOptions) {
    let key = priorityOrderDropdownOptions[index];
    if (key.hasOwnProperty("props")) {
      if (key.props[0].prop === options.prop && options.type === key.props[0].type) {
        priorityOrderDropdownOptions.splice(parseInt(index), 1);
        break;
      }
    }
  }
  return priorityOrderDropdownOptions;
};

