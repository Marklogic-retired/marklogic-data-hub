import React from "react";
import FormCheck from "react-bootstrap/FormCheck";
import HCTooltip from "../hc-tooltip/hc-tooltip";

interface Props {
  id: string;
  tooltip?: string;
  handleClick: Function;
  value: any;
  label: string;
  checked?: boolean;
  dataTestId: string;
}

const HCCheckbox: React.FC<Props> = (props) => {
  const {id, tooltip, handleClick, value, label, checked, dataTestId} = props;
  const checkLabel = <FormCheck.Label style={{"marginLeft": 5, "color": "#333333"}}>{label}</FormCheck.Label>;

  const getLabel = () => {
    if (tooltip) {
      return <HCTooltip text={tooltip} placement="top" id={`${id}-tooltip`}>{checkLabel}</HCTooltip>;
    }
    return label;
  };

  return <FormCheck id={id} style={{display: "flex", alignItems: "center", gap: "6px"}}>
    <FormCheck.Input
      type="checkbox"
      value={value}
      checked={checked}
      onChange={(e) => handleClick(e)}
      data-testid={dataTestId}
      style={{marginTop: "0", verticalAlign: "middle"}}
    />
    {getLabel()}
  </FormCheck>;
};

export default HCCheckbox;