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
  disabled?: boolean;
  cursorDisabled?: boolean;
  placementTooltip?: any;
  removeMargin?: boolean;
}

const HCCheckbox: React.FC<Props> = (props) => {
  const {id, tooltip, handleClick, value, label, checked, dataTestId, ariaLabel, children, disabled, cursorDisabled, placementTooltip, removeMargin} = props;
  const checkLabel = <FormCheck.Label style={{"marginLeft": removeMargin ? 0 : 5, "color": "#333333"}}>{label}</FormCheck.Label>;

  const getLabel = () => {
    if (tooltip) {
      return <HCTooltip text={tooltip} placement={placementTooltip ? placementTooltip: "top"} id={`${id}-tooltip`}>{checkLabel}</HCTooltip>;
    }
    return label;
  };

  return <FormCheck id={id} style={{display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-start"}}>
    {disabled ?
      <FormCheck.Input
        type="checkbox"
        disabled
        value={value}
        checked={checked}
        onChange={(e) => handleClick(e)}
        onClick={(e) => e.stopPropagation()}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        style={cursorDisabled ? {marginTop: "0", verticalAlign: "middle", cursor: "not-allowed"} : {marginTop: "0", verticalAlign: "middle"}}
      />
      :
      <FormCheck.Input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(e) => handleClick(e)}
        onClick={(e) => e.stopPropagation()}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        style={cursorDisabled ? {marginTop: "0", verticalAlign: "middle", cursor: "not-allowed"} : {marginTop: "0", verticalAlign: "middle"}}
      />
    }
    {label ? getLabel() : children}
  </FormCheck>;
};

export default HCCheckbox;