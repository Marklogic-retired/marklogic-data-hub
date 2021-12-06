import React, {useContext, useEffect, useState} from "react";
import {withRouter} from "react-router-dom";
import {UserContext} from "../util/user-context";
import {HCButton} from "@components/common";
import styles from "./noMatchRedirect.module.scss";
import oopsIcon from "../assets/oopsIcon.png";
import {Row, Col} from "react-bootstrap";
import {ArrowLeftShort} from "react-bootstrap-icons";

const NoMatchRedirect = ({history}) => {

  const {user, clearErrorMessage} = useContext(UserContext);
  const [copyClicked, setCopyClicked] = useState("Copy");
  const [errorBodyText, setErrorBodyText] = useState("");

  useEffect(() => {
    clearErrorMessage();
    setErrorBodyText(user.error.message);
  }, []);

  const goBack = () => {
    return user.authenticated ? history.push("/tiles") : history.push("/");
  };

  const copyToClipboard = () => {
    setCopyClicked("Copied!");
    navigator.clipboard.writeText(errorBodyText);
    setTimeout(function () { setCopyClicked("Copy"); }, 3000);
  };

  return (
    <div className="container-fluid">
      <Row>
        <Col className="col-md-3">
          <div className={`d-flex align-items-center cursor-pointer`} style={{width: 80}} onClick={goBack}>
            <ArrowLeftShort aria-label="Back" className={"d-inline-block me-2 fs-2 header-back-button"} /><div className={styles.backOperationFailed}>
              Back</div></div>
        </Col>

        <Col className="col-md-6">
          <Row className={styles.superiorMiddleContainer}>
            <Col>
              <Row>
                <Col className="col-md-4">
                  <img data-testid="" src={oopsIcon} alt={""} />
                </Col>
                <Col className="col-md-8 d-flex align-items-center">
                  <div className="px-2">
                    <div className={styles.title}><h1><strong>Operation failed.</strong></h1></div>
                    <div className={styles.spacer}>
                      <strong>The operation failed due to unknown reasons.</strong>
                    </div>

                    <div className={styles.spacer}>
                      <strong>{user.error.message ? "Copy the log below and send it to" : "Contact"} <a className={styles.contactLink} target="_blank" href="https://docs.marklogic.com/cloudservices/contact-support.html">MarkLogic Support</a>.</strong>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {user.error.message ? <>
            <Row>
              <Col className={styles.buttonCopyCol} style={{paddingBottom: 20}}>
                <HCButton data-testid={`copy-button-error`} className={styles.copyButton} onClick={copyToClipboard}>{copyClicked}</HCButton>
              </Col>
            </Row>

            <Row>
              <Col>
                <div className={styles.errorContainer}>
                  {errorBodyText}
                </div>
              </Col>
            </Row>
          </> : ""
          }
        </Col>

        <Col className="col-md-3">
        </Col>
      </Row>
    </div>
  );
};

export default withRouter(NoMatchRedirect);