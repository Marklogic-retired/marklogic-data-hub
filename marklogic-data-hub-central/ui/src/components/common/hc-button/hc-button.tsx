
import React from "react";
import {Button, ButtonProps, Spinner} from "react-bootstrap";
import "./hc-button.scss";

export interface HCButtonProps extends ButtonProps {
  loading?: boolean
}

const HCButton = React.forwardRef<HTMLButtonElement, HCButtonProps>(({loading, children, ...others}, ref) => {
  return (
    <Button data-testid="hc-button-component" disabled={loading ?? loading} {...others} ref={ref}>
      {children}
      {loading ? <Spinner
        data-testid="hc-button-component-spinner"
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
        className="ms-2"
      /> : null}
    </Button>
  );
});

export default HCButton;