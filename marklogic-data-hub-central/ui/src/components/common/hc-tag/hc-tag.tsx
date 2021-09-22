import React from "react";
import styles from "./hc-tag.module.scss";
import {XLg} from "react-bootstrap-icons";
interface Props {
  label: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
  className?: string;
  dashed?: boolean;
  color?: "black" | "blue" | "green" | "grey" | "magenta" | "red" | "yellow";
  closable?: boolean;
  visible?: boolean;
  onClose?: () => void;
}

const colors = {
  "black": styles.spanTagBlack, "blue": styles.spanTagBlue, "green": styles.spanTagGreen, "grey": styles.spanTagGrey,
  "magenta": styles.spanTagMagenta, "red": styles.spanTagRed, "yellow": styles.spanTagYellow
};

const HCTag: React.FC<Props> = (props) => {
  return (
    <span aria-label={props.ariaLabel}
      data-testid="tag-component"
      className={[styles.spanTag, props.className ? props.className : "", props?.color && colors[props.color],
        props.dashed && styles.spanTagDashed, props.visible === false && styles.spanTagInvisible].join(" ")}
      style={props.style}>
      {props.label}
      {(props?.closable || props?.closable === undefined) &&
        <XLg data-testid="iconClose-tagComponent" onClick={props?.onClose} className={styles.spanIcon} />
      }
    </span>
  );
};

export default HCTag;