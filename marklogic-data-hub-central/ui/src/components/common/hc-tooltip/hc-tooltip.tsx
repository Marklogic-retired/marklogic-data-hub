import React from "react";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import {Placement} from "react-bootstrap/types";

interface Props {
  text: string | JSX.Element;
  id: string;
  placement: Placement;
  children: React.ReactElement;
  show?: boolean;
  className?: string | undefined
}

const HCTooltip: React.FC<Props> = (props) => {
  const {placement, id, text, children, show} = props;
  if (text === "") {
    return children;
  }
  return <OverlayTrigger data-testid="ml-tooltip-component" popperConfig={{strategy: "fixed"}}
    placement={placement}
    overlay={<Tooltip {...props} id={id}>{text}</Tooltip>}
    show={show || undefined}
  >
    {children}
  </OverlayTrigger>;
};

export default HCTooltip;
