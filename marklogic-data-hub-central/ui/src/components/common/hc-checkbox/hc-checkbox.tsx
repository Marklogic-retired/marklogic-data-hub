import React from "react";
import FormCheck from "react-bootstrap/FormCheck";
import HCTooltip from "../hc-tooltip/hc-tooltip";

interface Props {
  id: string;
  tooltip?: string;
  handleClick: Function;
  value: any;
  label?: string;
  checked?: boolean;
  dataTestId?: string;
  ariaLabel?: string;
}

const HCCheckbox: React.FC<Props> = (props) => {
  const {id, tooltip, handleClick, value, label, checked, dataTestId, ariaLabel, children} = props;
  const checkLabel = <FormCheck.Label style={{"marginLeft": 5, "color": "#333333"}}>{label}</FormCheck.Label>;

  const getLabel = () => {
    if (tooltip) {
      return <HCTooltip text={tooltip} placement="top" id={`${id}-tooltip`}>{checkLabel}</HCTooltip>;
    }
    return label;
  };

  return <FormCheck id={id} style={{display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-start"}}>
    <FormCheck.Input
      type="checkbox"
      value={value}
      checked={checked}
      onChange={(e) => handleClick(e)}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      style={{marginTop: "0", verticalAlign: "middle"}}
    />
    {label ? getLabel() : children}
  </FormCheck>;
};

export default HCCheckbox;