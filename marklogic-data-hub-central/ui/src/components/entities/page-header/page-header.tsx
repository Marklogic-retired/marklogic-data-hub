import React from "react";
import {MLPageHeader} from "@marklogic/design-system";
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
      <MLPageHeader
        className={styles.pageHeader}
        onBack={props.handleOnBack}
        backIcon={<FontAwesomeIcon data-testid="arrow-left" className={styles.arrowLeftIcon} icon={faArrowLeft} />}
        title={props.title}
      />
    </div>
  );
};

export default PageHeader;
