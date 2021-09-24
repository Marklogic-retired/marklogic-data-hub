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
      <Row id="back-button" className={"py-3 px-3 header-heading-title"} onClick={props.handleOnBack}>
        <Col>
          <span className={`d-flex align-items-center cursor-pointer`} data-testid="arrow-left"><ArrowLeftShort aria-label="Back" className={"d-inline-block me-2 fs-1 header-back-button"} />{props.title}</span>
        </Col>
      </Row>
    </div>
  );
};

export default PageHeader;
