import React from "react";
import {PageHeader as PageHeaderAntd} from "antd";
import styles from "./page-header.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

interface Props {
  title: any;
  handleOnBack: () => void;
}

const PageHeader: React.FC<Props> = (props) => {

  return (
    <div className={styles.customHeader}>
      <PageHeaderAntd
        className={styles.pageHeader}
        onBack={props.handleOnBack}
        backIcon={<FontAwesomeIcon data-testid="arrow-left" className={styles.arrowLeftIcon} icon={faArrowLeft} />}
        title={props.title}
      />
    </div>
  );
};

export default PageHeader;
