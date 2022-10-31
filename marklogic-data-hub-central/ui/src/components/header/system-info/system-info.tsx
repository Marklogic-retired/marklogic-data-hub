import {ClearDataMessages, SystemInfoMessages} from "@config/messages.config";
import {Col, Form, FormLabel, Modal, Row} from "react-bootstrap";
import {HCAlert, HCButton, HCCard, HCTooltip, HCModal} from "@components/common";
import React, {useContext, useEffect, useState} from "react";
import Select, {components as SelectComponents} from "react-select";
import {faCopy, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {facetValues, primaryEntityTypes} from "@api/queries";

import {AuthoritiesContext} from "@util/authorities";
import Axios from "axios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {QuestionCircleFill} from "react-bootstrap-icons";
import {Search} from "react-bootstrap-icons";
import {SecurityTooltips} from "@config/tooltips.config";
import Spinner from "react-bootstrap/Spinner";
import StepsConfig from "@config/steps.config";
import {Typeahead} from "react-bootstrap-typeahead";
import {UserContext} from "@util/user-context";
import axios from "axios";
import {getEnvironment} from "@util/environment";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import styles from "./system-info.module.scss";

const SystemInfo = (props) => {
  const {handleError} = useContext(UserContext);
  const authorityService = useContext(AuthoritiesContext);
  const serviceName = props.serviceName || "";
  const dataHubVersion = props.dataHubVersion || "";
  const marklogicVersion = props.marklogicVersion || "";

  const {user} = useContext(UserContext);

  const [message, setMessage] = useState({show: false});
  const [isLoading, setIsLoading] = useState(false);
  const [clearDataVisible, setClearDataVisible] = useState(false);

  const [copySuccess, setCopySuccess] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars

  const stagingDbName = getEnvironment().stagingDb ? getEnvironment().stagingDb : StepsConfig.stagingDb;
  const finalDbName = getEnvironment().finalDb ? getEnvironment().finalDb : StepsConfig.finalDb;
  const jobsDbName = getEnvironment().jobsDb ? getEnvironment().jobsDb : StepsConfig.jobsDb;
  const [emptyError, setEmptyError] = useState<boolean>(false);
  const [clearClicked, setClearClicked] = useState<boolean>(false);
  const databaseOptions = [stagingDbName, finalDbName];
  const [targetDatabase, setTargetDatabase] = useState<string>(stagingDbName);
  const basedOnOptions = ["None", "Collection", "Entity"];
  const [targetBasedOn, setTargetBasedOn] = useState<string>("None");
  const [selectedDeleteOpt, setSelectedDeleteOpt] = useState<string>("deleteAll");

  const [collectionSelected, setCollectionSelected] = useState<string>("");
  const [collectionOptions, setCollectionOptions] = useState<string[]>([]);
  const [entitySelected, setEntitySelected] = useState<string>("");
  const [entitiesOptions, setEntitiesOptions] = useState<string[]>([]);
  const [allEntityNames, setAllEntityNames] = useState<string[]>([]);

  useEffect(() => {
    if (!user.authenticated && props.systemInfoVisible) {
      props.setSystemInfoVisible(false);
    }
  }, [user.authenticated]);

  useEffect(() => {
    if (props.systemInfoVisible) {
      getEntityOptions();
    }
  }, [props.systemInfoVisible]);

  const getEntityOptions = async () => {
    let response = await primaryEntityTypes();
    if (response.status === 200) {
      let models: string[] = [];
      response.data.forEach(model => {
        models.push(model.entityName);
      });
      setAllEntityNames(models);
    }
  };

  const MenuList  = (selector, props) => (
    <div id={`${selector}-select-MenuList`}>
      <SelectComponents.MenuList {...props} />
    </div>
  );

  const targetDbOptions = databaseOptions.map(d => ({value: d, label: d}));
  const targetBasedOnOptions = basedOnOptions.map(d => ({value: d, label: d}));

  const handleSelectedDeleteOpt = (event) => {
    setSelectedDeleteOpt(event.target.value);
    setTargetBasedOn("None");
    setEmptyError(false);
    setCollectionSelected("");
    setEntitySelected("");
  };

  const handleSourceDatabase = (selectedItem) => {
    setTargetDatabase(selectedItem.value);
  };

  const handleTargetBasedOn = (selectedItem) => {
    setTargetBasedOn(selectedItem.value);
    setCollectionSelected("");
    setClearClicked(false);
    setEntitySelected("");
    if (selectedItem.value === "None") {
      setEmptyError(false);
    } else {
      setEmptyError(true);
    }
  };

  const handleCollectionChange = (selectedItem) => {
    const selected = selectedItem[0];
    if (selected) {
      setCollectionSelected(selectedItem[0]);
      if (collectionOptions.includes(selectedItem[0])) {
        setEmptyError(false);
      }
    } else {
      setEmptyError(true);
    }
  };

  const handleEntitiesChange = (selectedItem) => {
    const selected = selectedItem[0];
    if (selected) {
      setEntitySelected(selectedItem[0]);
      if (entitiesOptions.includes(selectedItem[0])) {
        setEmptyError(false);
      }
    } else {
      setEmptyError(true);
    }
  };

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

      let payload = {};
      if (selectedDeleteOpt === "deleteSubset") {
        const sourceType: string = targetBasedOn !== "None" ? targetBasedOn : "";
        let sourceName: string = "";
        if (sourceType !== "") {
          sourceName = sourceType === "Collection" ? collectionSelected : entitySelected;
        }
        payload = {
          "targetDatabase": targetDatabase,
          "targetCollection": sourceName
        };
      }
      let response = await Axios.post("/api/environment/clearUserData", payload);
      if (response.status === 200) {
        setIsLoading(false);
        setMessage({show: true});
      }
    } catch (error) {
      let message = error.response;
      setIsLoading(false);
      console.error("Error while clearing user data, message || error", message);
      handleError(error);
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
    if (!emptyError) {
      setClearDataVisible(true);
    }
    setClearClicked(true);
  };

  const handleCollectionSearch = async (value: any) => {
    let database: string = targetDatabase === finalDbName ? "final" : "staging";

    if (value && value.length > 2) {
      try {
        let data = {
          "referenceType": "collection",
          "entityTypeId": " ",
          "propertyPath": " ",
          "limit": 10,
          "dataType": "string",
          "pattern": value,
        };
        const response = await facetValues(database, data);
        if (response.status === 200) {
          setCollectionOptions(response.data);
          if (collectionOptions.includes(value)) {
            setEmptyError(false);
            setCollectionSelected(value);
          } else {
            setCollectionSelected("");
            setEmptyError(true);
          }
        }
      } catch (error) {
        console.error(error);
        handleError(error);
      }

    } else {
      setCollectionOptions([]);
    }
  };

  const handleEntitiesSearch = async (value: any) => {
    let entitiesSelected = allEntityNames.filter(e => e.toLowerCase().includes(value.toLowerCase()));
    setEntitiesOptions(entitiesSelected);
    if (entitiesSelected.includes(value)) {
      setEntitySelected(value);
      setEmptyError(false);
    } else {
      setEntitySelected("");
      setEmptyError(true);
    }
  };

  const clearDataConfirmation = (
    <HCModal show={clearDataVisible} dialogClassName={styles.confirmationModal} onHide={onClearCancel}>
      <Modal.Body>
        <div style={{display: "flex"}}>
          <div style={{padding: "24px 0px 0px 15px"}}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="lg" style={{color: "rgb(188, 129, 29)"}}></FontAwesomeIcon>
          </div>
          <div style={{fontSize: "16px", padding: "20px 20px 20px 20px"}}>
            {selectedDeleteOpt !== "deleteAll" ?
              ClearDataMessages.clearSubsetConfirmation(targetDatabase, targetBasedOn, collectionSelected, entitySelected)
              :
              ClearDataMessages.clearAllConfirmation([...databaseOptions, jobsDbName])
            }
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
    </HCModal>
  );

  const downloadHCFilesButton = (
    <div className={styles.disabledButtonContainer}>
      <HCButton
        variant="primary"
        aria-label="Download"
        data-testid="downloadHubCentralFiles"
        disabled={!authorityService.canDownloadProjectFiles()}
        onClick={downloadHubCentralFiles}
      >Download</HCButton>
    </div>
  );

  return (
    <HCModal
      show={props.systemInfoVisible}
      onHide={onCancel}
      dialogClassName={styles.systemModal}
      keyboard={true}
      backdrop="static"
      className={clearDataVisible ? styles.disabledMain : ""}
    >
      <Modal.Body className={styles.systemModalBody} >
        <Modal.Header closeButton className={"bb-none"}></Modal.Header>
        <div className={styles.systemContainer}>
          <div data-testid="alertTrue" className={styles.alertPosition} style={message.show ? {display: "block"} : {display: "none"}}>
            <HCAlert variant="success" showIcon>{selectedDeleteOpt !== "deleteAll" ? <span>A subset of user data was cleared successfully</span> : <span>All user data was cleared successfully</span>}</HCAlert>
          </div>

          <div className={styles.serviceName}>
            {serviceName}
            <HCTooltip text="Copy to clipboard" id="copy-to-clipboard-tooltip" placement={"bottom"}>
              <span>
                {<FontAwesomeIcon icon={faCopy} data-testid="copyServiceName" className={styles.copyIcon} onClick={() => copyToClipBoard(serviceName)}/>}
              </span>
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
                { <Col>
                  <HCCard className={styles.download} >
                    <div className={styles.title}>Download Hub Central Files</div>
                    <div className={styles.cardContent}><p>{SystemInfoMessages.downloadHubCentralFiles}</p></div>
                    {!authorityService.canDownloadProjectFiles() ?
                      <HCTooltip id="missing-permission-tooltip" text={SecurityTooltips.missingPermission}
                        placement="top">
                        {downloadHCFilesButton}
                      </HCTooltip> :
                      downloadHCFilesButton}
                  </HCCard>
                </Col>
                }
                {<Col>
                  <HCCard className={styles.download} >
                    <div className={styles.title}>Download Project Files</div>
                    <div className={styles.cardContent}><p>{SystemInfoMessages.downloadProjectFiles}</p></div>
                    <div className={styles.buttonContainer}>
                      <HCButton
                        variant="primary"
                        aria-label="Download"
                        data-testid="downloadProjectFiles"
                        onClick={downloadProjectFiles}
                        disabled={!authorityService.canDownloadProjectFiles()}
                      >Download</HCButton>
                    </div>
                  </HCCard>
                </Col>
                }

                {<Col>
                  <HCCard className={styles.clearAll}>
                    {isLoading === true ? <div className={styles.spinRunning}>
                      <Spinner animation="border" variant="primary" />
                    </div> : ""}
                    <div className={styles.title} data-testid="clearData">Clear All User Data</div>
                    <div className={styles.cardContent}>
                      <Row className={"mb-4"}>
                        <Col xs lg="1">
                          <Form.Check
                            data-testid="deleteAll"
                            inline
                            id={"deleteAll"}
                            name={"source-query"}
                            type={"radio"}
                            checked={selectedDeleteOpt === "deleteAll" ? true : false}
                            onChange={handleSelectedDeleteOpt}
                            value={"deleteAll"}
                            aria-label={"deleteAll"}
                            className={"mb-0"}
                          />
                        </Col>
                        <Col>
                          <span className={selectedDeleteOpt !== "deleteAll" ? styles.optionDisabled : ""}>{SystemInfoMessages.clearAllUserData}</span>
                        </Col>
                      </Row>
                      <div className={styles.title}>Clear Subset of User Data</div>
                      <Row className={"mb-2"}>
                        <Col xs lg="1">
                          <Form.Check
                            inline
                            id={"deleteSubset"}
                            data-testid="deleteSubset"
                            name={"source-query"}
                            type={"radio"}
                            checked={selectedDeleteOpt === "deleteSubset" ? true : false}
                            onChange={handleSelectedDeleteOpt}
                            value={"deleteSubset"}
                            aria-label={"deleteSubset"}
                            className={"mt-2"}
                          />
                        </Col>
                        <FormLabel column
                          className={`${styles.subSetSelection} ${selectedDeleteOpt !== "deleteSubset" ? styles.optionDisabled : ""}`}>
                          {"Select a Database:"}
                        </FormLabel>
                        <Col className={"d-flex ps-1"}>
                          <Select
                            id="targetDatabase-select"
                            inputId="targetDatabase"
                            tabIndex={0}
                            className={styles.subsetSelect}
                            components={{MenuList: props => MenuList("targetDatabase", props)}}
                            placeholder="Please select a database"
                            value={targetDbOptions.find(oItem => oItem.value === targetDatabase)}
                            onChange={handleSourceDatabase}
                            isSearchable={false}
                            aria-label="targetDatabase-select"
                            isDisabled={selectedDeleteOpt !== "deleteSubset"}
                            options={targetDbOptions}
                            styles={reactSelectThemeConfig}
                            formatOptionLabel={({value, label}) => {
                              return (
                                <span data-testid={`targetDbOptions-${value}`}>
                                  {label}
                                </span>
                              );
                            }}
                          />
                          <HCTooltip text={ClearDataMessages.databaseSelectionTooltip} placement="bottom" id="">
                            <QuestionCircleFill aria-label={"database-select-info"} className={styles.infoIcon} size={13} />
                          </HCTooltip>
                        </Col>
                      </Row>
                      <Row className={"mb-2"}>
                        <Col xs lg="1"/>
                        <FormLabel column
                          className={`${styles.subSetSelection} ${selectedDeleteOpt !== "deleteSubset" ? styles.optionDisabled : ""}`}>
                          {<span>Based on <span className="fst-italic">(optional)</span>:</span>}
                        </FormLabel>
                        <Col className={"d-flex ps-1"}>
                          <Select
                            id="targetBasedOn-select"
                            inputId="targetBasedOn"
                            tabIndex={0}
                            className={styles.subsetSelect}
                            components={{MenuList: props => MenuList("targetBasedOn", props)}}
                            placeholder="None"
                            value={targetBasedOnOptions.find(oItem => oItem.value === targetBasedOn)}
                            onChange={handleTargetBasedOn}
                            isSearchable={false}
                            aria-label="targetBasedOn-select"
                            isDisabled={selectedDeleteOpt !== "deleteSubset"}
                            options={targetBasedOnOptions}
                            styles={reactSelectThemeConfig}
                            formatOptionLabel={({value, label}) => {
                              return (
                                <span data-testid={`targetBasedOnOptions-${value}`}>
                                  {label}
                                </span>
                              );
                            }}
                          />
                          <HCTooltip text={ClearDataMessages.basedOnTooltip} placement="bottom" id="">
                            <QuestionCircleFill aria-label={"based-on-info"} className={styles.infoIcon} size={13} />
                          </HCTooltip>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs lg="1"/>
                        <Col className={styles.subSetSelection}/>
                        <Col className={"d-flex ps-1"}>
                          {targetBasedOn === "Collection" ? <div className={"position-relative w-100"}>
                            <Typeahead
                              id="collection-input"
                              options={collectionOptions}
                              className={styles.subsetInputSelect}
                              aria-label="collection-input"
                              placeholder={"Search collections"}
                              value={collectionSelected}
                              onInputChange={handleCollectionSearch}
                              onChange={handleCollectionChange}
                              minLength={3}
                            ></Typeahead>
                            <span aria-label={"collection-empty-error"} className={styles.errorMessageEmpty}>{emptyError && clearClicked ? ClearDataMessages.emptyCollectionError : null}</span>
                            <Search className={styles.searchIcon} /></div>
                            : ""}
                          {targetBasedOn === "Entity" ? <div className={"position-relative w-100"}>
                            <Typeahead
                              id="entities-input"
                              options={entitiesOptions}
                              className={styles.subsetInputSelect}
                              aria-label="entities-input"
                              placeholder={"Search entities"}
                              value={entitySelected}
                              onInputChange={handleEntitiesSearch}
                              onChange={handleEntitiesChange}
                              minLength={3}
                            ></Typeahead>
                            <span aria-label={"entities-empty-error"} className={styles.errorMessageEmpty}>{emptyError && clearClicked ? ClearDataMessages.emptyEntityError : null}</span>
                            <Search className={styles.searchIcon} /></div> : ""}
                        </Col>
                      </Row>
                    </div>
                    <div className={styles.buttonContainer}>
                      <HCButton
                        variant="primary"
                        aria-label="Clear"
                        data-testid="clearUserData"
                        onClick={handleClearData}
                        disabled={!authorityService.canClearUserData()}
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
    </HCModal>
  );
};

export default SystemInfo;
