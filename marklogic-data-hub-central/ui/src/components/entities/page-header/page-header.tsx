import React from "react";
import {Row, Col} from "react-bootstrap";
import styles from "./page-header.module.scss";
import {ArrowLeftShort} from "react-bootstrap-icons";

interface Props {
  title: any;
  handleOnBack: () => void;
}

const PageHeader: React.FC<Props> = (props) => {

  return (
    <div className={styles.customHeader}>
      <Row id="back-button" className={"py-3 px-3 header-heading-title"}>
        <Col>
          <span className={`d-flex align-items-center`} data-testid="arrow-left"><ArrowLeftShort aria-label="Back" className={"d-inline-block me-2 fs-1 header-back-button cursor-pointer"} onClick={props.handleOnBack}/>{props.title}</span>
        </Col>
      </Row>
    </div>
  );
};

export default PageHeader;
