import React, {useContext, useEffect, useState} from "react";
import styles from "./system-info.module.scss";
import {Tooltip} from "antd";
import axios from "axios";
import {UserContext} from "../../util/user-context";
import {AuthoritiesContext} from "../../util/authorities";
import Axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import {SecurityTooltips} from "../../config/tooltips.config";
import {SystemInfoMessages} from "../../config/messages.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle, faCopy} from "@fortawesome/free-solid-svg-icons";
import {Modal, Row, Col} from "react-bootstrap";
import {HCAlert, HCButton, HCCard, HCTooltip} from "@components/common";


const SystemInfo = (props) => {
  const authorityService = useContext(AuthoritiesContext);
  const serviceName = props.serviceName || "";
  const dataHubVersion = props.dataHubVersion || "";
  const marklogicVersion = props.marklogicVersion || "";

  const {user} = useContext(UserContext);

  const [message, setMessage] = useState({show: false});
  const [isLoading, setIsLoading] = useState(false);
  const [clearDataVisible, setClearDataVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    if (!user.authenticated && props.systemInfoVisible) {
      props.setSystemInfoVisible(false);
    }
  }, [user.authenticated]);

  const downloadHubCentralFiles = () => {
    setMessage({show: false});
    axios({
      url: "/api/environment/downloadHubCentralFiles",
      method: "GET",
      responseType: "blob"
    })
      .then(response => {
        let result = String(response.headers["content-disposition"]).split(";")[1].trim().split("=")[1];
        let filename = result.replace(/"/g, "");
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
  };

  const downloadProjectFiles = () => {
    setMessage({show: false});
    axios({
      url: "/api/environment/downloadProjectFiles",
      method: "GET",
      responseType: "blob"
    })
      .then(response => {
        let result = String(response.headers["content-disposition"]).split(";")[1].trim().split("=")[1];
        let filename = result.replace(/"/g, "");
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
  };

  const copyToClipBoard = async copyMe => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess("Copied!");
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  const clear = async () => {
    try {
      setMessage({show: false});
      setIsLoading(true);
      let response = await Axios.post("/api/environment/clearUserData");
      if (response.status === 200) {
        setIsLoading(false);
        setMessage({show: true});
      }
    } catch (error) {
      let message = error.response;
      setIsLoading(false);
      console.error("Error while clearing user data, message || error", message);
    }
  };
  const onCancel = () => {
    setMessage({show: false});
    props.setSystemInfoVisible(false);
  };

  const onClearOk = () => {
    clear();
    setClearDataVisible(false);
  };

  const onClearCancel = () => {
    setClearDataVisible(false);
  };

  const handleClearData = () => {
    setClearDataVisible(true);
  };

  const clearDataConfirmation = (
    <Modal show={clearDataVisible} dialogClassName={styles.confirmationModal}>
      <Modal.Body>
        <div style={{display: "flex"}}>
          <div style={{padding: "24px 0px 0px 15px"}}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="lg" style={{color: "rgb(188, 129, 29)"}}></FontAwesomeIcon>
          </div>
          <div style={{fontSize: "16px", padding: "20px 20px 20px 20px"}}>
            Are you sure you want to clear all user data? This action will reset your instance to a state similar to a newly created DHS instance with your project artifacts.
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" onClick={() => onClearCancel()}>
          <div aria-label="No">No</div>
        </HCButton>
        <HCButton variant="primary" onClick={() => onClearOk()}>
          <div aria-label="Yes">Yes</div>
        </HCButton>
      </Modal.Footer>
    </Modal>
  );

  return (
    <Modal
      show={props.systemInfoVisible}
      onHide={() => onCancel()}
      dialogClassName={styles.systemModal}
      keyboard={true}
      backdrop="static"
      className={clearDataVisible ? styles.disabledMain : ""}
    >
      <Modal.Body >
        <Modal.Header closeButton className={"bb-none"}></Modal.Header>
        <div className={styles.systemContainer}>
          <div data-testid="alertTrue" className={styles.alertPosition} style={message.show ? {display: "block"} : {display: "none"}}>
            <HCAlert variant="success" showIcon>{<span><b>Clear All User Data </b>completed successfully</span>}</HCAlert>
          </div>

          <div className={styles.serviceName}>
            {serviceName}
            <HCTooltip text="Copy to clipboard" id="copy-to-clipboard-tooltip" placement={"bottom"}>
              <i>
                {<FontAwesomeIcon icon={faCopy} data-testid="copyServiceName" className={styles.copyIcon} onClick={() => copyToClipBoard(serviceName)}/>}
              </i>
            </HCTooltip>
          </div>
          <div className={styles.version}>
            <div className={styles.label}>Data Hub Version:</div>
            <div className={styles.value}>{dataHubVersion}</div>
          </div>
          <div className={styles.version}>
            <div className={styles.label}>MarkLogic Version:</div>
            <div className={styles.value}>{marklogicVersion}</div>
          </div>
          <div className={styles.cardsContainer}>
            <div className={styles.cards}>
              <Row>
                { !authorityService.canDownloadProjectFiles() ? <Col>
                  <HCCard className={styles.download} >
                    <div className={styles.title}>Download Hub Central Files</div>
                    <p>{SystemInfoMessages.downloadHubCentralFiles}</p>
                    <Tooltip title={SecurityTooltips.missingPermission} placement="bottom">
                      <div className={styles.disabledButtonContainer}>
                        <HCButton
                          aria-label="Download"
                          data-testid="downloadHubCentralFiles"
                          disabled
                        >Download</HCButton>
                      </div>
                    </Tooltip>
                  </HCCard>
                </Col>:
                  <Col>
                    <HCCard className={styles.download} >
                      <div className={styles.title}>Download Hub Central Files</div>
                      <p>{SystemInfoMessages.downloadHubCentralFiles}</p>
                      <div className={styles.buttonContainer}>
                        <HCButton
                          variant="primary"
                          aria-label="Download"
                          data-testid="downloadHubCentralFiles"
                          size="sm"
                          onClick={downloadHubCentralFiles}
                        >Download</HCButton>
                      </div>
                    </HCCard>
                  </Col>
                }

                { !authorityService.canDownloadProjectFiles() ? <Col>
                  <HCCard className={styles.download}>
                    <div className={styles.title}>Download Project Files</div>
                    <p>{SystemInfoMessages.downloadProjectFiles}</p>
                    <div className={styles.buttonContainer}>
                      <HCButton
                        variant="primary"
                        aria-label="Download"
                        data-testid="downloadProjectFiles"
                        size="sm"
                        onClick={downloadProjectFiles}
                        disabled
                      >Download</HCButton>
                    </div>
                  </HCCard>
                </Col>:
                  <Col>
                    <HCCard className={styles.download} >
                      <div className={styles.title}>Download Project Files</div>
                      <p>{SystemInfoMessages.downloadProjectFiles}</p>
                      <div className={styles.buttonContainer}>
                        <HCButton
                          variant="primary"
                          aria-label="Download"
                          data-testid="downloadProjectFiles"
                          size="sm"
                          onClick={downloadProjectFiles}
                        >Download</HCButton>
                      </div>
                    </HCCard>
                  </Col>
                }

                { !authorityService.canClearUserData() ? <Col>
                  <HCCard className={styles.clearAll}>
                    {isLoading === true ? <div className={styles.spinRunning}>
                      <Spinner animation="border" variant="primary" />
                    </div> : ""}
                    <div className={styles.title} data-testid="clearData">Clear All User Data</div>
                    <p>{SystemInfoMessages.clearAllUserData}</p>
                    <div className={styles.buttonContainer}>
                      <HCButton
                        variant="primary"
                        aria-label="Clear"
                        data-testid="clearUserData"
                        size="sm"
                        onClick={handleClearData}
                        disabled
                      >Clear</HCButton>
                    </div>
                  </HCCard>
                </Col>:
                  <Col>
                    <HCCard className={styles.clearAll}>
                      {isLoading === true ? <div className={styles.spinRunning}>
                        <Spinner animation="border" variant="primary" />
                      </div> : ""}
                      <div className={styles.title} data-testid="clearData">Clear All User Data</div>
                      <p>{SystemInfoMessages.clearAllUserData}</p>
                      <div className={styles.buttonContainer}>
                        <HCButton
                          variant="primary"
                          aria-label="Clear"
                          data-testid="clearUserData"
                          size="sm"
                          onClick={handleClearData}
                        >Clear</HCButton>
                      </div>
                    </HCCard>
                  </Col>
                }

              </Row>
            </div>
          </div>
        </div>
      </Modal.Body>
      {clearDataConfirmation}
    </Modal>
  );
};

export default SystemInfo;