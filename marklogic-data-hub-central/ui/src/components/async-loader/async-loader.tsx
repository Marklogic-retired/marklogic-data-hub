import React, {useContext} from "react";
import {UserContext} from "../../util/user-context";
import {SearchContext} from "../../util/search-context";
import Spinner from "react-bootstrap/Spinner";
import styles from "./async-loader.module.scss";
import HCAlert from "../common/hc-alert/hc-alert";

const AsyncLoader: React.FC = () => {
  const {user, clearErrorMessage} = useContext(UserContext);
  const {resetSearchOptions} = useContext(SearchContext);

  const onClose = () => {
    clearErrorMessage();
    resetSearchOptions();
  };

  return (
    <>
      {user.error.type === "ALERT" ?
        <HCAlert variant="danger" dismissible data-cy="alert-error-message" heading={user.error.title} onClose={onClose}>
          {user.error.message}
        </HCAlert>
        :
        <div className={styles.spinnerContainer}>
          <Spinner animation="border" variant="primary" data-testid="spinner" />
        </div>
      }
    </>
  );
};

export default AsyncLoader;
