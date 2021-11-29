export const parsePriorityOrder = (priorityOptions) => {
  let priorityOrder:any = {};
  priorityOrder.sources = [];
  for (let key of priorityOptions) {
    if (key.hasOwnProperty("value")) {
      if (key.value.split(":")[0] === "Length") {
        priorityOrder.lengthWeight = key.start;
      } else {
        if (key.value.split(":")[0].split(" - ")[0] === "Source") {
          priorityOrder.sources.push(
            {
              "sourceName": key.value.split(":")[0].split(" - ")[1],
              "weight": key.start
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
    let priorityName;
    if (key.value.split(":")[0] === "Length") priorityName=key.value.split(":")[0];
    else {
      let name=key.value.split(":")[0];
      priorityName=name.split(" - ")[1];
    }
    if (key.hasOwnProperty("value") && priorityName === dropdownOption) {
      return priorityOrderDropdownOptions;
    }
  }
  let priorityName;
  if (dropdownOption.indexOf("Length") !== -1) priorityName = "Length";
  else priorityName = "Source - " +   dropdownOption;
  priorityOrderDropdownOptions.push(
    {
      start: 1,
      value: priorityName + ":1",
      id: priorityName + ":1"
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
    if (key.hasOwnProperty("value")) {
      if (key.id === options.item) {
        priorityOrderDropdownOptions.splice(parseInt(index), 1);
        break;
      }
    }
  }
  return priorityOrderDropdownOptions;
};

