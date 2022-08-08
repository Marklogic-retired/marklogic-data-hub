
import React from "react";
import {Button, ButtonProps, Spinner} from "react-bootstrap";

export interface HCButtonProps extends ButtonProps {
  loading?: boolean
}

const HCButton: React.FC<HCButtonProps> = ({loading, children, ...others}) => {
  return (
    <Button data-testid="hc-button-component" disabled={loading ?? loading} {...others}>
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
};

export default HCButton;