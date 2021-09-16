import React from "react";
import styles from "./source-navigation.module.scss";
import HCButton from "../../../common/hc-button/hc-button";
import {ChevronLeft, ChevronRight} from "react-bootstrap-icons";

interface Props {
  currentIndex: number;
  startIndex: number;
  endIndex: number;
  handleSelection: (index: number) => void;
}

const SourceNavigation: React.FC<Props> = (props) => {

  return (
    <span className={styles.navigate_source_uris}>
      <HCButton
        variant="outline-light"
        className={styles.navigate_uris_left}
        data-testid="navigate-uris-left"
        onClick={() => props.handleSelection(props.currentIndex - 1)}
        disabled={props.currentIndex === props.startIndex}
      >
        <ChevronLeft className={styles.navigateIcon} />
      </HCButton>
        &nbsp;
      <div aria-label="uriIndex" className={styles.URI_Index}><p>{props.currentIndex + 1}</p></div>
        &nbsp;
      <HCButton
        className={styles.navigate_uris_right}
        variant="outline-light"
        data-testid="navigate-uris-right"
        onClick={() => props.handleSelection(props.currentIndex + 1)}
        disabled={props.currentIndex === props.endIndex}
      >
        <ChevronRight className={styles.navigateIcon} />
      </HCButton>
    </span>
  );
};

export default SourceNavigation;
