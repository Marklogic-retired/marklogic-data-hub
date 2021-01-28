import React, {useContext, useEffect, useState} from "react";
import styles from "./system-info.module.scss";
import {Card, Col, Row, Modal, Alert} from "antd";
import axios from "axios";
import {UserContext} from "../../util/user-context";
import {AuthoritiesContext} from "../../util/authorities";
import Axios from "axios";
import {MLButton, MLSpin, MLTooltip} from "@marklogic/design-system";
import {SecurityTooltips} from "../../config/tooltips.config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle, faCopy} from "@fortawesome/free-solid-svg-icons";



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

  const clear =async () => {
    try {
      setMessage({show: false});
      setIsLoading(true);
      let response =await Axios.post("/api/environment/clearUserData");
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

  const clearDataConfirmation = <Modal
    visible={clearDataVisible}
    okText={<div aria-label="Yes">Yes</div>}
    okType="primary"
    cancelText={<div aria-label="No">No</div>}
    onOk={() => onClearOk()}
    onCancel={() => onClearCancel()}
    bodyStyle={{textAlign: "left"}}
    width={550}
    maskClosable={false}
    closable={false}
    destroyOnClose={true}
  >
    <div style = {{display: "flex"}}><div style={{padding: "24px 0px 0px 15px"}}><FontAwesomeIcon icon={faExclamationTriangle} size = "lg" style={{color: "rgb(188, 129, 29)"}}></FontAwesomeIcon></div><div style={{fontSize: "16px", padding: "20px 20px 20px 20px"}}>Are you sure you want to clear all user data? This action will reset your instance to a state similar to a newly created DHS instance with your project artifacts.</div></div>
  </Modal>;

  return (
    <Modal
      visible={props.systemInfoVisible}
      onCancel={() => onCancel()}
      width={"85vw"}
      maskClosable={false}
      footer={null}
      className={styles.systemModal}
      destroyOnClose={true}
    >
      <div className={styles.systemContainer}>
        <div data-testid="alertTrue" className={styles.alertPosition} style={message.show ? {display: "block"} : {display: "none"}}>
          <Alert message={<span><b>Clear All User Data </b>completed successfully</span>} type="success" showIcon />
        </div>
        <div className={styles.serviceName}>{serviceName}<MLTooltip title="Copy to clipboard" placement={"bottom"}><FontAwesomeIcon icon={faCopy} data-testid="copyServiceName" className={styles.copyIcon} onClick={() => copyToClipBoard(serviceName)}/></MLTooltip></div>
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
            <Row gutter={16} type="flex" >

              { !authorityService.canDownloadProjectFiles() ? <Col>
                <Card size="small" className={styles.download} >
                  <div className={styles.title}>Download Hub Central Files</div>
                  <p>Download a zip file containing only artifacts (models, steps, step definitions, flows, and modules) that were created or modified through Hub Central. You can apply these files to an existing local project.</p>
                  <MLTooltip title={SecurityTooltips.missingPermission} placement="bottom">
                    <div className={styles.disabledButtonContainer}>
                      <MLButton
                        aria-label="Download"
                        data-testid="downloadHubCentralFiles"
                        disabled
                      >Download</MLButton>
                    </div>
                  </MLTooltip>
                </Card>
              </Col>:
                <Col>
                  <Card size="small" className={styles.download} >
                    <div className={styles.title}>Download Hub Central Files</div>
                    <p>Download a zip file containing only artifacts (models, steps, step definitions, flows, and modules) that were created or modified through Hub Central. You can apply these files to an existing local project.</p>
                    <div className={styles.buttonContainer}>
                      <MLButton
                        type="primary"
                        aria-label="Download"
                        data-testid="downloadHubCentralFiles"
                        onClick={downloadHubCentralFiles}
                      >Download</MLButton>
                    </div>
                  </Card>
                </Col>
              }

              { !authorityService.canDownloadProjectFiles() ? <Col>
                <Card size="small" className={styles.download} >
                  <div className={styles.title}>Download Project Files</div>
                  <p>Download a zip file containing all Data Hub project files (project configurations) and artifacts (models, steps, step definitions, flows, and modules) that were created or modified through Hub Central. You can use these files to set up the project locally and check them into a version control system.</p>
                  <MLTooltip title={SecurityTooltips.missingPermission} placement="bottom">
                    <div className={styles.disabledButtonContainer}>
                      <MLButton
                        aria-label="Download"
                        data-testid="downloadProjectFiles"
                        disabled
                      >Download</MLButton>
                    </div>
                  </MLTooltip>
                </Card>
              </Col>:
                <Col>
                  <Card size="small" className={styles.download} >
                    <div className={styles.title}>Download Project Files</div>
                    <p>Download a zip file containing all Data Hub project files (project configurations) and artifacts (models, steps, step definitions, flows, and modules) that were created or modified through Hub Central. You can use these files to set up the project locally and check them into a version control system.</p>
                    <div className={styles.buttonContainer}>
                      <MLButton
                        type="primary"
                        aria-label="Download"
                        data-testid="downloadProjectFiles"
                        onClick={downloadProjectFiles}
                      >Download</MLButton>
                    </div>
                  </Card>
                </Col>
              }

              { !authorityService.canClearUserData() ? <Col>
                <Card size="small" className={styles.clearAll}>
                  {isLoading === true ? <div className={styles.spinRunning}>
                    <MLSpin size={"large"} />
                  </div>: ""}
                  <div className={styles.title} data-testid="clearData">Clear All User Data</div>
                  <p>Delete all user data in the STAGING, FINAL, and JOBS databases. Project files and artifacts remain.</p>
                  <MLTooltip title={SecurityTooltips.missingPermission} placement="bottom">
                    <div className={styles.disabledButtonContainer}>
                      <MLButton
                        aria-label="Clear"
                        data-testid="clearUserData"
                        disabled
                      >Clear</MLButton>
                    </div>
                  </MLTooltip>
                </Card>
              </Col>:
                <Col>
                  <Card size="small" className={styles.clearAll}>
                    {isLoading === true ? <div className={styles.spinRunning}>
                      <MLSpin size={"large"} />
                    </div>: ""}
                    <div className={styles.title} data-testid="clearData">Clear All User Data</div>
                    <p>Delete all user data in the STAGING, FINAL, and JOBS databases. Project files and artifacts remain.</p>
                    <div className={styles.buttonContainer}>
                      <MLButton
                        type="primary"
                        aria-label="Clear"
                        data-testid="clearUserData"
                        onClick={handleClearData}
                      >Clear</MLButton>
                    </div>
                  </Card>
                </Col>
              }

            </Row>
          </div>
        </div>
      </div>
      {clearDataConfirmation}
    </Modal>
  );
};

export default SystemInfo;
