import React, {useContext} from "react";
import {Alert} from "antd";
import {UserContext} from "../../util/user-context";
import {SearchContext} from "../../util/search-context";
import Spinner from "react-bootstrap/Spinner";
import styles from "./async-loader.module.scss";

const AsyncLoader: React.FC = () => {
  const {user, clearErrorMessage} = useContext(UserContext);
  const {resetSearchOptions} = useContext(SearchContext);

  const onClose = () => {
    clearErrorMessage();
    resetSearchOptions();
  };

  return (
    <>
      { user.error.type === "ALERT" ?
        <Alert
          style={{textAlign: "center"}}
          message={user.error.title}
          description={user.error.message}
          type="error"
          data-cy="alert-error-message"
          closable
          onClose={onClose}
        />
        :
        <div className={styles.spinnerContainer}>
          <Spinner animation="border" variant="primary" data-testid="spinner" />
        </div>
      }
    </>
  );
};

export default AsyncLoader;
