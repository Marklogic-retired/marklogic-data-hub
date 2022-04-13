import React, {useEffect, useState} from "react";
import styles from "./hc-sider.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDoubleRight, faAngleDoubleLeft} from "@fortawesome/free-solid-svg-icons";


export interface HCSiderProps {
  identity?: string,
  show: boolean,
  showButtonLabel?: boolean,
  openIcon?: React.ReactNode,
  closeIcon?: React.ReactNode,
  labelButton?: string,
  footer?: React.ReactNode,
  children: React.ReactNode,
  placement: "left" | "right",
  containerClassName?: string,
  contentClassName?: string,
  indicatorCLassName?: string,
  width?: string,
  updateVisibility?: (status: boolean) => void,
  color?: string,
}

function HCSider({identity, show, footer, children, closeIcon, openIcon, labelButton, showButtonLabel, placement, width, contentClassName, indicatorCLassName, containerClassName, updateVisibility, color}: HCSiderProps): JSX.Element {
  const [open, setOpen] = useState(show);
  let button = labelButton ? labelButton : open ? "close" : "open";
  let size = !open ? `0` : width ? width : `20vw`;
  let iconOpen = openIcon ? openIcon : placement === "left" ? <FontAwesomeIcon data-testid="icon-expanded" aria-label="expanded" icon={faAngleDoubleRight} size="lg" className={styles.icon} /> : <FontAwesomeIcon data-testid="icon-collapsed" aria-label="collapsed" icon={faAngleDoubleLeft} size="lg" className={styles.icon} />;
  let iconClose = closeIcon ? closeIcon : placement === "left" ? <FontAwesomeIcon data-testid="icon-collapsed" aria-label="collapsed" icon={faAngleDoubleLeft} size="lg" className={styles.icon} /> : <FontAwesomeIcon data-testid="icon-expanded" aria-label="expanded" icon={faAngleDoubleRight} size="lg" className={styles.icon} />;
  let icon = open ? iconClose : iconOpen;
  const buttonPlacement = {[placement]: "100%", borderRadius: placement === "left" ? "0px 5px 5px 0px" : "5px 0px 0px 5px"};

  useEffect(() => {
    setOpen(show);
  }, [show]);

  const handleOpen = (event) => {
    event.preventDefault();
    const newStatus = !open;
    setOpen(newStatus);
    if (updateVisibility) {
      updateVisibility(newStatus);
    }
  };

  const HCSiderStyle = color ? {width: size, backgroundColor: color} : {width: size};

  return (
    <div data-testid={`${identity ? identity + "-" : ""}hc-sider-component`} className={`${styles.siderContainer} ${containerClassName && containerClassName}`} style={HCSiderStyle}>
      <a data-testid={`${identity ? identity + "-" : ""}sider-action`} aria-label={`${identity ? identity + "-" : ""}sider-action`} onClick={handleOpen} className={`${styles.siderIndicatorContainer} ${indicatorCLassName && indicatorCLassName}`} style={buttonPlacement}>{icon}{showButtonLabel && button}</a>
      {open && <div data-testid={`${identity ? identity + "-" : ""}hc-sider-content`} id={`${identity ? identity + "-" : ""}hc-sider-content`} className={`${styles.siderContentContainer} ${footer && styles.containerWithFooter} ${contentClassName && contentClassName}`}>{children}</div>}
      {open && (footer && <div className={styles.siderFooterContainer}>{footer}</div>)}
    </div>
  );
}


export default HCSider;