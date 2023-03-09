import React, {useState} from "react";
import FormCheck from "react-bootstrap/FormCheck";
import HCTooltip from "../hc-tooltip/hc-tooltip";
import "./hc-checkbox.scss";

interface Props {
  id: string;
  tooltip?: any;
  handleClick: Function;
  handleKeyDown?: Function;
  value: any;
  label?: JSX.Element | string;
  checked?: boolean;
  dataTestId?: string;
  ariaLabel?: string;
  disabled?: boolean;
  cursorDisabled?: boolean;
  placementTooltip?: any;
  removeMargin?: boolean;
}

const HCCheckbox: React.FC<Props> = props => {
  const {
    id,
    tooltip,
    handleClick,
    handleKeyDown,
    value,
    label,
    checked,
    dataTestId,
    ariaLabel,
    children,
    disabled,
    cursorDisabled,
    placementTooltip,
    removeMargin,
  } = props;
  const checkLabel = (
    <FormCheck.Label style={{"marginLeft": removeMargin ? 0 : 5, "color": "#333333"}}>{label}</FormCheck.Label>
  );
  const [focused, setFocused] = useState(false);

  const getLabel = () => {
    if (tooltip) {
      return (
        <HCTooltip text={tooltip} placement={placementTooltip ? placementTooltip : "top"} id={`${id}-tooltip`}>
          {checkLabel}
        </HCTooltip>
      );
    }
    return label;
  };

  return (
    <FormCheck id={id} style={{display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-start"}}>
      {disabled ? (
        <FormCheck.Input
          type="checkbox"
          disabled
          value={value}
          checked={checked}
          onChange={e => handleClick(e)}
          onClick={e => e.stopPropagation()}
          data-testid={dataTestId}
          aria-label={ariaLabel}
          tabIndex={0}
          style={
            cursorDisabled
              ? {marginTop: "0", verticalAlign: "middle", cursor: "not-allowed"}
              : {marginTop: "0", verticalAlign: "middle"}
          }
        />
      ) : tooltip ? (
        <HCTooltip text={tooltip} placement={placementTooltip ? placementTooltip : "top"} id={`${id}-tooltip`}>
          <FormCheck.Input
            type="checkbox"
            value={value}
            checked={checked}
            onChange={e => handleClick(e)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (handleKeyDown) {
                handleKeyDown(e);
              }
            }}
            data-testid={dataTestId}
            aria-label={ariaLabel}
            style={
              cursorDisabled
                ? {marginTop: "0", verticalAlign: "middle", cursor: "not-allowed"}
                : {marginTop: "0", verticalAlign: "middle"}
            }
          />
        </HCTooltip>
      ) : (
        <FormCheck.Input
          type="checkbox"
          value={value}
          checked={checked}
          onChange={e => handleClick(e)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={e => e.stopPropagation()}
          onKeyDown={e => {
            if (handleKeyDown) {
              handleKeyDown(e);
            }
          }}
          data-testid={dataTestId}
          aria-label={ariaLabel}
          style={
            cursorDisabled
              ? {marginTop: "0", verticalAlign: "middle", cursor: "not-allowed"}
              : focused
                ? {marginTop: "0", verticalAlign: "middle", boxShadow: "0 0 2px 2px #7f86b5 inset"}
                : {marginTop: "0", verticalAlign: "middle"}
          }
        />
      )}
      {label ? getLabel() : children}
    </FormCheck>
  );
};

export default HCCheckbox;
