import React from "react";
import {Row, Col} from "react-bootstrap";
import styles from "./page-header.module.scss";
import {ArrowLeftShort} from "react-bootstrap-icons";
import {AddTooltipWhenTextOverflow} from "@util/AddTooltipWhenTextOverflow";

interface Props {
  title: any;
  handleOnBack: () => void;
}

const PageHeader: React.FC<Props> = props => {
  return (
    <div className={styles.customHeader}>
      <Row id="back-button" className={"py-2 px-3 header-heading-title"}>
        <Col>
          <div className={`d-flex align-items-center`} data-testid="arrow-left">
            <div className={styles.backIcon}>
              <ArrowLeftShort
                tabIndex={0}
                onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    props.handleOnBack();
                  }
                }}
                aria-label="Back"
                className={"d-inline-block me-2 fs-1 header-back-button cursor-pointer"}
                onClick={props.handleOnBack}
              />
            </div>
            <AddTooltipWhenTextOverflow text={props.title} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PageHeader;
