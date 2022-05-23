import {Col, Row} from "react-bootstrap";
import React, {useContext, useEffect, useState} from "react";

import {ArrowLeftShort} from "react-bootstrap-icons";
import {HCButton} from "@components/common";
import {UserContext} from "@util/user-context";
import oopsIcon from "../assets/oopsIcon.png";
import styles from "./noMatchRedirect.module.scss";
import {withRouter} from "react-router-dom";

const NoMatchRedirect = ({history}) => {

  const {user, clearErrorMessage} = useContext(UserContext);
  const [copyClicked, setCopyClicked] = useState("Copy");
  const [errorBodyText, setErrorBodyText] = useState("");

  useEffect(() => {
    setErrorBodyText(user.error.message);
    return () => {
      clearErrorMessage();
    };
  }, []);

  const goBack = () => {
    return user.authenticated ? history.goBack() : history.push("/");
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
                      <strong>The operation failed because of {user.error.type ? "the following errors:" : "an unknown error."}</strong>
                    </div>
                    {user.error.message && <>
                      <div className={styles.errorContainer}>
                        {user.error.title && <h3>user.error.title</h3>}
                        {user.error.encounteredErrors && user.error.encounteredErrors}
                        {user.error.message}
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget libero vitae turpis scelerisque tristique eget quis nibh. Maecenas luctus condimentum ligula, quis tincidunt lorem viverra dictum. Aliquam erat volutpat. Mauris malesuada consequat erat eget malesuada. Etiam quis scelerisque risus. Fusce rhoncus condimentum sapien, sed iaculis sapien scelerisque porttitor. Morbi imperdiet nisl non neque pharetra tempor. Phasellus eu purus lorem. Morbi ultrices nunc et enim laoreet commodo. Nam quis orci scelerisque, fringilla magna id, eleifend libero.
                      </div>
                      <div className={styles.buttonCopyCol}>
                        <HCButton data-testid={`copy-button-error`} className={styles.copyButton} onClick={copyToClipboard}>{copyClicked}</HCButton>
                      </div>

                    </>}
                    <div className={styles.contactSupport}>
                      <strong> Contact <a className={styles.contactLink} target="_blank" href="https://docs.marklogic.com/cloudservices/contact-support.html">MarkLogic Support</a>.</strong>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row >
    </div >
  );
};

export default withRouter(NoMatchRedirect);