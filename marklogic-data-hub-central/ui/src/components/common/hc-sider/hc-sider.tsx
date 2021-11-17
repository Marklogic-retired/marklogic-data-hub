import React, {useState} from "react";
import styles from "./hc-sider.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDoubleRight, faAngleDoubleLeft} from "@fortawesome/free-solid-svg-icons";


export interface HCSiderProps {
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
  width?: string
}

function HCSider({show, footer, children, closeIcon, openIcon, labelButton, showButtonLabel, placement, width, contentClassName, indicatorCLassName, containerClassName}: HCSiderProps): JSX.Element {
  const [open, setOpen] = useState(show);
  let button = labelButton ? labelButton : open ? "close" : "open";
  let size = !open ? `0` : width ? width : `20vw`;
  let iconOpen = openIcon ? openIcon : placement === "left" ? <FontAwesomeIcon data-testid="icon-expanded" aria-label="expanded" icon={faAngleDoubleRight} size="lg" className={styles.icon} /> : <FontAwesomeIcon data-testid="icon-collapsed" aria-label="collapsed" icon={faAngleDoubleLeft} size="lg" className={styles.icon} />;
  let iconClose = closeIcon ? closeIcon : placement === "left" ? <FontAwesomeIcon data-testid="icon-collapsed" aria-label="collapsed" icon={faAngleDoubleLeft} size="lg" className={styles.icon} /> : <FontAwesomeIcon data-testid="icon-expanded" aria-label="expanded" icon={faAngleDoubleRight} size="lg" className={styles.icon} />;
  let icon = open ? iconClose : iconOpen;
  const buttonPlacement = {[placement]: "100%", borderRadius: placement === "left" ? "0px 5px 5px 0px" : "5px 0px 0px 5px"};

  const handleOpen = (event) => {
    event.preventDefault();
    setOpen(!open);
  };

  return (
    <div data-testid="hc-sider-component" className={`${styles.siderContainer} ${containerClassName && containerClassName}`} style={{width: size}}>
      <a data-testid="sider-action" aria-label="sider-action" onClick={handleOpen} className={`${styles.siderIndicatorContainer} ${indicatorCLassName && indicatorCLassName}`} style={buttonPlacement}>{icon}{showButtonLabel && button}</a>
      {open && <div data-testid="hc-sider-content" id="hc-sider-content" className={`${styles.siderContentContainer} ${footer && styles.containerWithFooter} ${contentClassName && contentClassName}`}>{children}</div>}
      {open && (footer && <div className={styles.siderFooterContainer}>{footer}</div>)}
    </div>
  );
}


export default HCSider;