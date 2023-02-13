import React, {useContext, useEffect, useState} from "react";
import {Modal} from "react-bootstrap";
import "./compare-values-modal.scss";
import styles from "./compare-values-modal.module.scss";
import {Definition} from "../../../../types/modeling-types";
import {CurationContext} from "@util/curation-context";
import backgroundImage from "../../../../assets/white-for-dark-bg.png";
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";
import {themeColors} from "@config/themes.config";
import {deleteNotification} from "@api/merging";
import {ConfirmationType} from "../../../../types/common-types";
import ConfirmationModal from "../../../confirmation-modal/confirmation-modal";
import {HCTable, HCButton, HCTooltip, HCModal, HCCheckbox} from "@components/common";
import {faExclamationTriangle, faInfoCircle, faChevronRight, faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {Overlay} from "react-bootstrap";
import Popover from "react-bootstrap/Popover";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {SearchContext} from "@util/search-context";
import {delayTooltip} from "@util/common-utils";

interface Props {
  isVisible: any;
  toggleModal: (isVisible: boolean) => void;
  fetchNotifications: (page: number | undefined, pageLength: number | undefined, updated: boolean) => void;
  previewMatchActivity: any;
  uriInfo: any;
  activeStepDetails: any;
  entityProperties: any;
  uriCompared: any;
  entityDefinitionsArray: any;
  uris: any
  isPreview: boolean;
  isMerge: boolean;
  mergeUris: any;
  unmergeUri: any;
  originalUri: string;
  flowName: string;
}

const CompareValuesModal: React.FC<Props> = (props) => {
  const {curationOptions} = useContext(CurationContext);
  const [compareValuesTableData, setCompareValuesTableData] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [showUrisPopover, setShowUrisPopover] = useState(false);
  const [targetUrisPopover, setTargetUrisPopover] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const [includeUnmerged, setIncludeUnmerged] = useState(false);

  const [columns, setColumns] = useState<any[]>([]);

  const pageSize = 4;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);


  const {
    searchOptions,
    toggleMergeUnmerge,
  } = useContext(SearchContext);

  const filterColumns = (currentPage, pageSize, _totalPages) => {
    let start = (currentPage - 1) * pageSize;
    let end = currentPage * pageSize;
    const filteredColumns = props.uris.slice(start, end);
    let columns: any[] = columnsGenerator(filteredColumns);
    setColumns(columns);
  };
  const mounted = React.useRef(false);
  useEffect(() => {
    mounted.current = true;
    if (mounted.current && props.isVisible && props.uriInfo && props.uris) {
      let newParsedData = parseDataToTable(props.entityDefinitionsArray, getMatchedProperties(), props.uriInfo);
      const totalPages = Math.ceil(props.uris.length / pageSize);
      setTotalPages(totalPages);
      filterColumns(1, pageSize, totalPages);
      setCompareValuesTableData(newParsedData);
    }
    return () => {
      mounted.current = false;
      setCurrentPage(1);
    };
  }, [props.isVisible, props.uriInfo, props.uris]);

  useEffect(() => {
    if (mounted.current) {
      filterColumns(currentPage, pageSize, totalPages);
    }
  }, [currentPage]);

  const DEFAULT_ENTITY_DEFINITION: Definition = {
    name: "",
    properties: []
  };

  const getMatchedProperties = () => {
    let matchedPropArray: any = [];
    for (let i in props.previewMatchActivity.actionPreview) {
      let allUris = props.previewMatchActivity.actionPreview[i].uris;
      if (allUris.includes(props.uris[0]) && allUris.includes(props.uris[1])) {
        for (let j in props.previewMatchActivity.actionPreview[i].matchRulesets) {
          let matchRuleset = props.previewMatchActivity.actionPreview[i].matchRulesets[j];
          let name = matchRuleset.split(" - ");
          if (name.length > 1) {
            let structuredParentName = name[0].split(".");
            if (structuredParentName.length > 1) {
              matchedPropArray.push(structuredParentName[0]);
            } else {
              matchedPropArray.push(name[0]);
            }
          } else {
            for (let i = 0; i < curationOptions?.activeStep?.stepArtifact?.matchRulesets?.length; i++) {
              let ruleset = curationOptions.activeStep.stepArtifact.matchRulesets[i];
              if (ruleset.name === matchRuleset) {
                for (let j = 0; j < ruleset.matchRules.length; j++) {
                  matchedPropArray.push(ruleset.matchRules[j].entityPropertyPath);
                }
              }
            }
          }
        }
      }
    }
    return matchedPropArray;
  };

  const closeModal = () => {
    setIncludeUnmerged(false);
    props.toggleModal(false);
  };

  const parseDataToTable = (entityDefinitionsArray: Definition[], matchedPropertiesArray, uriInfo) => {
    let activeEntityName = props?.isPreview ? props.activeStepDetails?.entityName : props?.activeStepDetails[0]?.name;
    let entityTypeDefinition: Definition = entityDefinitionsArray.find(definition => definition?.name === activeEntityName) || DEFAULT_ENTITY_DEFINITION;
    const parsedData = entityTypeDefinition?.properties.map((property, index) => {
      let propertyRow: any = {};
      const previewValues = uriInfo[uriInfo.length - 1]["previewInstance"][activeEntityName];
      const matchedRow = matchedPropertiesArray.includes(property.name);
      propertyRow = {
        key: property.name + "," + index,
        propertyPath: property.name,
        type: property.datatype,
        identifier: entityTypeDefinition?.primaryKey === property.name ? property.name : "",
        multiple: property.multiple ? property.name : "",
        hasChildren: false,
        parentKeys: [],
        propertyName: {name: property.name, matchedRow: matchedRow},
        propertyValueInReview: {value: previewValues[property.name] || "", matchedRow: matchedRow},
      };
      uriInfo.forEach((uri, index) => {
        let propertyInstanceKey = `result${index + 1}Instance`;
        if (!uri[propertyInstanceKey]) return;
        let propertyValueInURI = uri[propertyInstanceKey][activeEntityName];
        const propertyValueKey = `propertyValueInURI${index + 1}`;
        const value = propertyValueInURI[property.name] || "";
        propertyRow[propertyValueKey] = {value, matchedRow};
      });
      return propertyRow;
    });
    return parsedData;
  };


  const columnsGenerator = (data: any[]) => {
    let columns: any[] = [
      {
        dataField: "propertyName",
        key: "propertyPath",
        text: "Property Name",
        title: (cell) => `${cell.name}`,
        ellipsis: true,
        style: (property) => {
          if (property?.matchedRow) {
            return {
              backgroundColor: "#85BF97",
              backgroundImage: "url(" + backgroundImage + ")",
              verticalAlign: "top",
              width: "250px",
            };
          }
          return {
            backgroundColor: "",
            verticalAlign: "top",
            width: "250px",
          };
        },
        formatter: (text, row) => {
          return <span className={row.hasOwnProperty("children") ? styles.nameColumnStyle : ""} aria-label={text.name}>{text.name}</span>;
        },
      },
    ];

    const previewColumn = {
      dataField: "propertyValueInReview",
      key: "propertyValueInReview",
      title: (cell) => `${cell.value}`,
      ellipsis: true,
      text: !props.isMerge ? <><div>{"Current Document: "}</div><div style={{fontWeight: 400}}>{props.originalUri}</div></> : "Preview",
      style: (property) => {
        if (property?.matchedRow) {
          return {
            backgroundColor: "#FFF",
            backgroundImage: `url(${backgroundImage})`,
            verticalAlign: "top",
            width: "300px",
          };
        }
        return {
          backgroundColor: "",
          verticalAlign: "top",
          width: "300px",
        };
      },
      formatter: (property, key) => {
        let mergedOutput;
        if (Array.isArray(property.value) && property.value.length > 1) {
          if (property.value.some(ele => { return (typeof ele === "object" && ele !== null); })) {
            //pretty print JSON if array of objects
            mergedOutput = <pre className={styles.objectNotation}>{JSON.stringify(property.value, null, 2)}</pre>;
          } else {
            //format normal arrays
            mergedOutput = JSON.stringify(property.value, null, 2);
          }
        } else {
          if (typeof property.value === "object" && property.value !== null) {
            //pretty print JSON if singular object
            mergedOutput = <pre className={styles.objectNotation}>{JSON.stringify(property.value, null, 2)}</pre>;
          } else {
            //remove "" if empty value, show string values in quotes
            mergedOutput = property.value === "" ? null : JSON.stringify(property.value, null, 2);
          }
        }
        return <span key={key} aria-label={(property.value && property.value.length > 0) ? `${property.value}-preview` : "empty-preview-cell"}>{mergedOutput}</span>;
      }
    };

    if (!props.isMerge) {
      columns.push(previewColumn);
    }

    data.map((uri, index) => {
      const dataField = `propertyValueInURI${index + 1}`;
      columns.push(
        {
          dataField: dataField,
          key: dataField,
          title: (cell) => `${cell.value}`,
          ellipsis: true,
          text: uri,
          style: (property) => {
            if (property?.matchedRow) {
              return {
                backgroundColor: "#85BF97",
                backgroundImage: "url(" + backgroundImage + ")",
                verticalAlign: "top",
                width: "auto",
                maxWidth: "200px",
              };
            }
            return {
              backgroundColor: "",
              verticalAlign: "top",
              width: "auto",
              maxWidth: "200px",
            };
          },
          formatter: (property, key) => {
            let mergedOutput;
            if (Array.isArray(property.value) && property.value.length > 1) {
              if (property.value.some(ele => { return (typeof ele === "object" && ele !== null); })) {
                //pretty print JSON if array of objects
                mergedOutput = <pre className={styles.objectNotation}>{JSON.stringify(property.value, null, 2)}</pre>;
              } else {
                //format normal arrays
                mergedOutput = JSON.stringify(property.value, null, 2);
              }
            } else {
              if (typeof property.value === "object" && property.value !== null) {
                //pretty print JSON if singular object
                mergedOutput = <pre className={styles.objectNotation}>{JSON.stringify(property.value, null, 2)}</pre>;
              } else {
                //remove "" if empty value, show string values in quotes
                mergedOutput = property.value === "" ? null : JSON.stringify(property.value, null, 2);
              }
            }
            return <span key={key} aria-label={(property.value && property.value.length > 0) ? `${property.value}-cell${index + 2}` : `empty-cell${index + 2}`}>{mergedOutput}</span>;
          }
        }
      );
    });

    if (props.isMerge) {
      columns.push(previewColumn);
    }

    return columns;
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrevious = () => {
    if (currentPage > 1) {
      const pageNumber = currentPage - 1;
      setCurrentPage(pageNumber);
    }
  };



  const renderPagination = () => {
    let start = ((currentPage - 1) * pageSize) + 1;
    let end = (currentPage * pageSize) > props.uris.length ? props.uris.length : (currentPage * pageSize);
    return (<div className={styles.paginationContainer}>
      <div onClick={handlePrevious}>
        <span className={(currentPage > 1) ? styles.paginationArrow : styles.paginationArrowDisabled}>
          <FontAwesomeIcon icon={faChevronLeft} size="lg" style={{color: "#fff"}}></FontAwesomeIcon>
        </span>
      </div>
      <div className={styles.paginationLegend}>
        <span>
          <strong>{!props.isMerge ? "Preview " : ""} {start}</strong> to <strong>{end}</strong> of <strong>{props.uris.length}</strong> Documents
        </span>
      </div>
      <div onClick={handleNextPage}>
        <span className={(currentPage < totalPages) ? styles.paginationArrow : styles.paginationArrowDisabled}>
          <FontAwesomeIcon icon={faChevronRight} size="lg" style={{color: "#fff"}}></FontAwesomeIcon>
        </span>
      </div>
    </div>);
  };

  const onExpand = (record, expanded, rowIndex) => {
    let newExpandedRows = [...expandedRows];

    if (expanded) {
      if (newExpandedRows.indexOf(record.key) === -1) {
        newExpandedRows.push(record.key);
      }
    } else {
      newExpandedRows = newExpandedRows.filter(row => row !== record.key);
    }

    setExpandedRows(newExpandedRows);
  };

  const onDelete = async () => {
    await deleteNotification(props.originalUri).then((resp) => {
      if (resp) {
        props.fetchNotifications(undefined, undefined, false);
      }
      toggleConfirmModal(false);
    });
    closeModal();
  };

  const rowStyle2 = (row) => {
    const {propertyName} = row;
    if (propertyName?.matchedRow) {
      return {
        backgroundColor: "#85BF97",
        backgroundImage: "url(" + backgroundImage + ")",
      };
    }

    return {};
  };


  const onMergeUnmerge = async () => {
    setIsLoading(true);
    setConfirmModalVisible(false);

    if (!props.isMerge) {
      let payload = {
        mergeDocumentURI: props.originalUri,
        blockFutureMerges: !includeUnmerged
      };
      await props.unmergeUri(payload);
      setIsLoading(false);
    } else {
      let payload = {
        mergeURIs: props.uris,
        flowName: props.flowName
      };
      await props.mergeUris(payload);
      setIsLoading(false);
    }
    closeModal();
    toggleMergeUnmerge(searchOptions.mergeUnmerge);
  };
  let time: any;
  const handleShowUrisPopover = (event) => {
    event.persist();
    time = delayTooltip(() => {
      setShowUrisPopover(!showUrisPopover);
      setTargetUrisPopover(event.target);
    });
  };

  const handleMouseLeaveUrisPopover = () => {
    setShowUrisPopover(false);
    clearTimeout(time);
  };

  const moreUrisInfo = (
    <Overlay
      show={showUrisPopover}
      target={targetUrisPopover}
      placement="right"
    >
      <Popover id={`more-uris-tooltip`} className={styles.moreUrisPopover}
        onMouseEnter={() => setShowUrisPopover(true)}
        onMouseLeave={() => setShowUrisPopover(false)}>
        <Popover.Body className={styles.moreUrisPopover}>
          {props.uriCompared.length < 30 ?
            <div className={styles.moreUrisInfo} aria-label="more-uri-info">All URIs included in this {props.isMerge ? "merge" : "unmerge"} are displayed below (<strong>{props.uriCompared.length} total</strong>): <br /><br />{props.uriCompared.map((uri, index) => { return <div key={index}><span className={styles.uriText} aria-label={`${uri}-uri`}>{uri}</span><br /></div>; })}</div>
            :
            <div>
              <div className={styles.moreUrisInfo} aria-label="more-uri-info-limit">The first <strong>30</strong> URIs included in this {props.isMerge ? "merge" : "unmerge"} are displayed below (<strong>{props.uriCompared.length} total</strong>): <br /><br />{props.uriCompared.map((uri, index) => { return index < 30 ? <div><span className={styles.uriText} aria-label={`${uri}-uri`}>{uri}</span><br /></div> : null; })}</div>
              <span>...</span>
            </div>
          }
        </Popover.Body>
      </Popover>
    </Overlay>
  );

  const mergeUnmergeConfirmation = (
    <HCModal show={confirmModalVisible} onHide={() => setConfirmModalVisible(false)} dialogClassName={styles.confirmationModal}>
      <Modal.Body>
        <div style={{display: "flex"}}>
          <div style={{padding: "24px 0px 0px 15px"}}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="lg" style={{color: "rgb(188, 129, 29)"}}></FontAwesomeIcon>
          </div>
          <div style={{fontSize: "16px", padding: "20px 20px 20px 20px"}}>
            {props.isMerge ?
              "Are you sure you want to merge these documents? Doing so will combine them to form one single document. The original documents will be moved to the archive collection."
              :
              "Are you sure you want to unmerge this document? Doing so will move the original documents out of the archive collection."
            }
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <HCButton variant="outline-light" onClick={() => setConfirmModalVisible(false)}>
          <div aria-label="No">No</div>
        </HCButton>
        <HCButton variant="primary" onClick={() => onMergeUnmerge()}>
          <div aria-label="Yes">Yes</div>
        </HCButton>
      </Modal.Footer>
    </HCModal>
  );


  return <><HCModal
    show={props.isVisible}
    dialogClassName={styles.modal1400w}
    aria-label={"compare-values-modal"}
    onHide={closeModal}
    scrollable={true}
  >
    <Modal.Header className={"bb-none"} >
      <span className={styles.compareValuesModalHeading} data-testid="compareTitle">Compare</span>
      {
        !props.isPreview ?
          <HCTooltip text={"Delete"} id="delete-icon" placement="top-end">
            <i>
              <FontAwesomeIcon
                icon={faTrashAlt}
                color={themeColors.info}
                className={styles.deleteMatch}
                onClick={() => toggleConfirmModal(true)}
                size="lg"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    toggleConfirmModal(true);
                  }
                }}
              />
            </i>
          </HCTooltip>
          : null
      }
      {
        props.uriCompared.length > 2 ?
          <div className={styles.moreUrisTrigger}>
            {moreUrisInfo}
            <FontAwesomeIcon
              icon={faInfoCircle}
              aria-label="icon: info-circle"
              className={styles.infoIcon}
              onMouseEnter={handleShowUrisPopover}
              onMouseLeave={() => handleMouseLeaveUrisPopover()}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  handleShowUrisPopover(event);
                }
              }}
            />
          </div>
          :
          null
      }

      <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
    </Modal.Header>
    <Modal.Body>
      <div className={styles.compareValuesModelBodyContainer}>
        <div className="w-100 d-flex">
          <span className={styles.compareValuesEntityName}>Entity: <strong>{props.isPreview ? props.activeStepDetails.entityName : props?.activeStepDetails[0]?.name || ""}</strong></span>
        </div>
        <div className={styles.paginationRow}>
          <div className={props?.isMerge ? styles.paginationRowCleanSpaceMerge: styles.paginationRowCleanSpaceUnmerge}></div>
          <div className={styles.paginationRowActions}>
            {props.uris.length > pageSize && renderPagination()}
          </div>
          <div className={props.isMerge ? styles.paginationRowLegendMerge: styles.paginationRowLegendUnmerge}>
            <span className={styles.matchIconContainer}><img src={backgroundImage} className={styles.matchIcon}></img></span>
            <span className={styles.matchIconText}>Match</span>
          </div>
        </div>
        <div>
          {columns.length > 0 && <HCTable columns={columns}
            className={props.isMerge ? `compare-values-model ${styles.compareValuesModelTable}`: `compare-values-model-unmerge ${styles.compareValuesModelTable}`}
            data={compareValuesTableData}
            onExpand={onExpand}
            expandedRowKeys={expandedRows}
            showExpandIndicator={{bordered: false}}
            nestedParams={{headerColumns: columns, iconCellList: [], state: [expandedRows, setExpandedRows]}}
            childrenIndent={true}
            pagination={false}
            rowStyle={rowStyle2}
            keyUtil="key"
            baseIndent={0}
            rowKey="key"
            showHeader={true}
          />}
        </div>
      </div>
    </Modal.Body>
    {!props.isPreview ?
      <Modal.Footer>
        {!props.isMerge ?
          <HCCheckbox
            id={`unmerge-inclusion-checkbox`}
            value={includeUnmerged}
            handleClick={(e) => setIncludeUnmerged(!includeUnmerged)}
            checked={includeUnmerged}
            data-testid={`unmerge-inclusion-checkbox`}
            ariaLabel={`unmerge-inclusion-checkbox`}
          >Include unmerged documents in future matches
          </HCCheckbox>
          : null
        }
        <HCButton variant="outline-light" onClick={() => closeModal()}>
          <div aria-label="Cancel">Cancel</div>
        </HCButton>
        <HCButton variant="primary" loading={isLoading} aria-label="confirm-merge-unmerge" onClick={() => setConfirmModalVisible(true)}>
          {props.isMerge ? "Merge" : "Unmerge"}
        </HCButton>
      </Modal.Footer> : null}
  </HCModal>
  {mergeUnmergeConfirmation}
  <ConfirmationModal
    isVisible={showConfirmModal}
    type={ConfirmationType.DeleteNotificationRow}
    boldTextArray={[]}
    toggleModal={toggleConfirmModal}
    confirmAction={onDelete}
  />
  </>;
};

export default CompareValuesModal;