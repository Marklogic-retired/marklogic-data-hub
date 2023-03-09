import React from "react";
import Alert, {AlertProps} from "react-bootstrap/Alert";
import {CheckCircleFill, InfoCircleFill, ExclamationCircleFill, XCircleFill} from "react-bootstrap-icons";
import styles from "./hc-alert.module.scss";

export interface HCAlertProps extends AlertProps {
  showIcon?: boolean;
  heading?: string | React.ReactNode;
  closeButton?: boolean;
  handleCloseAlert?: () => void;
}

function HCAlert({
  showIcon,
  children,
  variant,
  className,
  heading,
  closeButton = false,
  handleCloseAlert = () => {},
  ...others
}: HCAlertProps) {
  let icon;
  if (variant === "success") {
    icon = <CheckCircleFill data-testid="success-icon" />;
  } else if (variant === "info") {
    icon = <InfoCircleFill data-testid="info-icon" />;
  } else if (variant === "warning") {
    icon = <ExclamationCircleFill data-testid="warning-icon" />;
  } else if (variant === "danger") {
    icon = <XCircleFill data-testid="danger-icon" />;
  } else {
    icon = <InfoCircleFill data-testid="default-icon" />;
  }

  return (
    <Alert
      variant={variant}
      data-testid="hc-alert-component"
      {...others}
      className={`${styles.alert} ${styles.hcAlert} ${className}`}
    >
      {showIcon && (
        <div className={`${styles.iconContainer} ${heading && styles.iconHeading} text-${variant}`}>{icon}</div>
      )}
      <div className={styles.content} id="hc-alert-component-content">
        {heading && <Alert.Heading>{heading}</Alert.Heading>}
        {children}
      </div>
      {closeButton ? (
        <div className={styles.closeButton}>
          <button type="button" className="btn-close" aria-label="Close-alert" onClick={() => handleCloseAlert()} />
        </div>
      ) : null}
    </Alert>
  );
}

export default HCAlert;
