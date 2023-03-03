import {Col, Row} from "react-bootstrap";
import React, {useContext, useEffect, useState} from "react";

import {ArrowLeftShort} from "react-bootstrap-icons";
import {HCButton} from "@components/common";
import {UserContext} from "@util/user-context";
import oopsIcon from "../assets/oopsIcon.png";
import styles from "./noMatchRedirect.module.scss";
import {withRouter, RouteComponentProps} from "react-router-dom";


interface Props extends RouteComponentProps<any> { message?:string}


const NoMatchRedirect: React.FC<Props> = ({history, ...props}) => {
  const {user, clearErrorMessage} = useContext(UserContext);
  const [copyClicked, setCopyClicked] = useState("Copy");
  const [errorBodyText, setErrorBodyText] = useState("");

  useEffect(() => {
    const errorText = props.message ? props.message : `${user.error.title && user.error.title} ${user.error.encounteredErrors && user.error.encounteredErrors} ${user.error.message}`;
    setErrorBodyText(errorText);
  }, []);

  const goBack = () => {
    clearErrorMessage();
    return user.authenticated ? history.push("/tiles") : history.push("/");
  };

  const copyToClipboard = () => {
    setCopyClicked("Copied!");
    navigator.clipboard.writeText(errorBodyText);
    setTimeout(function () { setCopyClicked("Copy"); }, 3000);
  };

  return (
    <div className="container-fluid" data-testid="errorScreen">
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
                    {(user.error.message || props.message) && <>
                      <div className={styles.errorContainer}>
                        {user.error.title && <h3>{user.error.title}</h3>}
                        {user.error.encounteredErrors && user.error.encounteredErrors}
                        {props.message ? props.message : user.error.message }
                      </div>
                      <div className={styles.buttonCopyCol}>
                        <HCButton data-testid={`copy-button-error`} className={styles.copyButton} onClick={copyToClipboard}>{copyClicked}</HCButton>
                      </div>

                    </>}
                    <div className={styles.contactSupport}>
                      <strong> Contact <a className={styles.contactLink} target="_blank" href="https://help.marklogic.com/
">MarkLogic Support</a>.</strong>
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