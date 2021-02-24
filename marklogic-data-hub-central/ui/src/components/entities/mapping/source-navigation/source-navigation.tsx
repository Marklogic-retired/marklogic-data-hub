import React from "react";
import {Icon} from "antd";
import {MLButton} from "@marklogic/design-system";
import styles from "./source-navigation.module.scss";

interface Props {
  currentIndex: number;
  startIndex: number;
  endIndex: number;
  handleSelection: (index: number) => void;
}

const SourceNavigation: React.FC<Props> = (props) => {

  return (
    <span className={styles.navigate_source_uris}>
      <MLButton
        className={styles.navigate_uris_left}
        data-testid="navigate-uris-left"
        onClick={() => props.handleSelection(props.currentIndex - 1)}
        disabled={props.currentIndex === props.startIndex}
      >
        <Icon type="left" className={styles.navigateIcon} />
      </MLButton>
        &nbsp;
      <div aria-label="uriIndex" className={styles.URI_Index}><p>{props.currentIndex + 1}</p></div>
        &nbsp;
      <MLButton
        className={styles.navigate_uris_right}
        data-testid="navigate-uris-right"
        onClick={() => props.handleSelection(props.currentIndex + 1)}
        disabled={props.currentIndex === props.endIndex}
      >
        <Icon type="right" className={styles.navigateIcon} />
      </MLButton>
    </span>
  );
};

export default SourceNavigation;
