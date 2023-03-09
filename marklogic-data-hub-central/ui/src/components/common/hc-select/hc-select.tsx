import React, {useEffect, useState} from "react";
import Select from "react-select";

interface Props {
  id?: string;
  inputId?: string;
  components?: any;
  row?: any;
  options?: any;
  formatOptionLabel?: any;
  onChange?: Function;
  matchTypesProp?: any;
  changeTagKey?: any;
  value?: any;
  styles?: any;
}

const HCSelect: React.FC<Props> = props => {
  const {id, row, components, inputId, options, formatOptionLabel, onChange, matchTypesProp, changeTagKey, styles} =
    props;
  const [valueAux, setValueAux] = useState({value: "", label: "Select match type"});

  //Uncheck row
  useEffect(() => {
    setValueAux(
      matchTypesProp[row.propertyPath]
        ? Object.keys(matchTypesProp).length > 0
          ? options.find(item => item.value === matchTypesProp[row.propertyPath])
          : {value: "", label: "Select match type"}
        : {value: "", label: "Select match type"},
    );
  }, [changeTagKey]);

  //Edit ruleset case
  useEffect(() => {
    setValueAux(
      matchTypesProp[row.propertyPath]
        ? Object.keys(matchTypesProp).length > 0
          ? options.find(item => item.value === matchTypesProp[row.propertyPath])
          : {value: "", label: "Select match type"}
        : {value: "", label: "Select match type"},
    );
  }, [matchTypesProp]);

  const handleValue = (event, onChange) => {
    let value = event?.currentTarget?.value;
    setValueAux(value);
    if (onChange) {
      onChange(event);
    }
  };

  useEffect(() => {}, [valueAux]);

  return (
    <Select
      id={id}
      inputId={inputId}
      components={components}
      placeholder="Select match type"
      tabSelectsValue={false}
      openMenuOnFocus={true}
      value={valueAux}
      onChange={event => handleValue(event, onChange)}
      aria-label={`${row.propertyPath}-match-type-dropdown`}
      isSearchable={false}
      options={options}
      formatOptionLabel={formatOptionLabel}
      styles={styles}
    />
  );
};

export default HCSelect;
