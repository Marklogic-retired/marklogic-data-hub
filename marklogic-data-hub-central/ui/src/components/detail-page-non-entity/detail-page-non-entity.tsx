import React, {useState, useContext, useEffect} from "react";
import {Row, Col, Tab, Tabs} from "react-bootstrap";
import {Layout, Table} from "antd";
import styles from "./detail-page-non-entity.module.scss";
import {useHistory, useLocation} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDoubleRight, faAngleDoubleLeft, faCode} from "@fortawesome/free-solid-svg-icons";
import {UserContext} from "../../util/user-context";
import AsyncLoader from "../async-loader/async-loader";
import {updateUserPreferences} from "../../services/user-preferences";
import {xmlFormatter, jsonFormatter} from "../../util/record-parser";
import {getRecord} from "../../api/record";
import {HCTooltip} from "../common";
import {ArrowLeftShort, Download} from "react-bootstrap-icons";

const DetailPageNonEntity = (props) => {
  const history: any = useHistory();
  const location: any = useLocation();
  const {user} = useContext(UserContext);
  const {Content, Sider} = Layout;
  const [selected, setSelected] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [metadataCollapse, setMetadataCollapse] = useState(false);

  useEffect(() => {
    if (!props.isEntityInstance) {
      if (location.state && JSON.stringify(location.state) !== JSON.stringify({})) {
        location.state.hasOwnProperty("selectedValue") && location.state["selectedValue"] === "instance" ?
          setSelected("instance") : setSelected("record");
      } else {
        if (location.state === undefined) {
          location.state = {};
        }
        setSelected(props.detailPagePreferences["selected"] ? props.detailPagePreferences["selected"] : "instance");
      }
    }
  }, []);

  const sourcesColumns = [
    {
      title: "Source Name",
      dataIndex: "sourceName",
      width: "50%",
      sorter: (a: any, b: any) => a.sourceName?.localeCompare(b.sourceName),
      render: text => text === "none" ? <span className={styles.noneValue}>{text}</span> : <span className={styles.validValue}>{text}</span>
    },
    {
      title: "Source Type",
      dataIndex: "sourceType",
      width: "50%",
      sorter: (a: any, b: any) => a.sourceType?.localeCompare(b.sourceType),
      render: text => text === "none" ? <span className={styles.noneValue}>{text}</span> : <span className={styles.validValue}>{text}</span>
    }
  ];

  const historyColumns = [
    {
      title: "Time Stamp",
      dataIndex: "updatedTime",
      width: "25%",
      sorter: (a: any, b: any) => a.updatedTime?.localeCompare(b.updatedTime),
      render: text => text === "none" ? <span className={styles.noneValue}>{text}</span> : <span>{text}</span>
    },
    {
      title: "Flow",
      dataIndex: "flow",
      width: "25%",
      onCell: () => {
        return {
          style: {
            whiteSpace: "nowrap",
            maxWidth: 140,
          }
        };
      },
      sorter: (a: any, b: any) => a.flow?.localeCompare(b.flow),
      render: text => text === "none" ? <span className={styles.noneValue}>{text}</span> : <HCTooltip
        key={text}
        text={text}
        id="history-flow-tooltip"
        placement="top">
        <div style={{color: "#333333", textOverflow: "ellipsis", overflow: "hidden"}}>{text}</div>
      </HCTooltip>
    },
    {
      title: "Step",
      dataIndex: "step",
      width: "25%",
      onCell: () => {
        return {
          style: {
            whiteSpace: "nowrap",
            maxWidth: 140,
          }
        };
      },
      sorter: (a: any, b: any) => a.step?.localeCompare(b.step),
      render: text => text === "none" ? <span className={styles.noneValue}>{text}</span> : <HCTooltip
        key={text}
        text={text}
        id="history-step-tooltip"
        placement="top">
        <div style={{color: "#333333", textOverflow: "ellipsis", overflow: "hidden"}}>{text}</div>
      </HCTooltip>
    },
    {
      title: "User",
      dataIndex: "user",
      width: "25%",
      onCell: () => {
        return {
          style: {
            whiteSpace: "nowrap",
            maxWidth: 140,
          }
        };
      },
      sorter: (a: any, b: any) => a.user?.localeCompare(b.user),
      render: text => text === "none" ? <span className={styles.noneValue}>{text}</span> : <HCTooltip
        key={text}
        text={text}
        id="history-user-tooltip"
        placement="top">
        <div style={{textOverflow: "ellipsis", overflow: "hidden"}}>{text}</div>
      </HCTooltip>
    }
  ];

  const collectionColumns = [
    {
      title: "Collection",
      dataIndex: "collection",
      key: "collection",
    }
  ];

  const recordMetadataColumns = [
    {
      title: "Property",
      dataIndex: "property",
      key: "property",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    }
  ];

  const recordPermissionsColumns = [
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Capability",
      dataIndex: "capability",
      key: "capability",
    }
  ];


  const handleMenuSelect = (key) => {
    setSelected(key);

    //Set the selected view property in user preferences.
    let preferencesObject = {
      ...props.detailPagePreferences,
      selected: key
    };
    updateUserPreferences(user.name, preferencesObject);
  };

  const onCollapse = () => {
    setMetadataCollapse(!metadataCollapse);
  };

  const displayRecord = (contentType: string) => {
    if (contentType === "json") {
      return (props.data && <pre data-testid="json-container">{jsonFormatter(props.data)}</pre>);
    } else if (contentType === "xml") {
      return (props.xml && <pre data-testid="xml-container">{xmlFormatter(props.xml)}</pre>);
    } else if (contentType === "text") {
      return (props.data && <pre data-testid="text-container" className={styles.textContainer}>{props.data}</pre>);
    }
  };

  const contentElements = props.isLoading || user.error.type === "ALERT" ? <div style={{marginTop: "40px"}}><AsyncLoader /></div> : displayRecord(props.contentType);

  const viewSelector = <div id="menu" className={styles.menu}>
    <Tabs onSelect={(event) => handleMenuSelect(event)}  className="border-0 ms-0">
      <Tab eventKey="record" key="record" id="record" data-testid="record-view" tabClassName={`${styles.tabActive} ${selected === "record" && styles.active}`}
        title={
          <HCTooltip text="Show the complete record" id="complete-record-tooltip" placement="top">
            <span>
              <i><FontAwesomeIcon icon={faCode} size="lg" /></i>
              <span className={styles.subMenu}>Record</span>
            </span>
          </HCTooltip>
        }>
      </Tab>
    </Tabs>
  </div>;

  const textViewSelector = <div id="menu" className={styles.menuText}>
    <Tabs>
      <Tab eventKey="record" id="record" data-cy="source-view" tabClassName={`${styles.tabActive} ${selected === "record" && styles.active}`}
        title={
          <HCTooltip text="Show the complete record" id="show-complete-record-tooltip" placement="top">
            <span>
              <i><FontAwesomeIcon icon={faCode} size="lg" /></i>
              <span className={styles.subMenu}>Record</span>
            </span>
          </HCTooltip>
        }>
      </Tab>
    </Tabs>
  </div>;

  const nonEntityMenu = () => {
    if (props.contentType === "json" || props.contentType === "xml") {
      return viewSelector;
    } else if (props.contentType === "text") {
      return textViewSelector;
    }
  };

  const download = async () => {
    try {
      const response = await getRecord(props.uri, props.database);
      if (response) {
        let result = String(response.headers["content-disposition"]).split(";")[1].trim().split("=")[1];
        let filename = result.replace(/"/g, "");
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayFileSize = () => {
    let size = props.documentSize?.hasOwnProperty("value") ? props.documentSize?.value : "";
    let unit = props.documentSize?.hasOwnProperty("units") ? props.documentSize?.units : "";
    return `Download (${size} ${unit})`;
  };

  return (
    <div id="detailPageNonEntityContainer" className={styles.container}>
      <Layout>
        <Content className={styles.detailContentNonEntityInstance}>
          <div className={styles.detailContentNonEntityHeader}>
            <Row id="back-button" className={"p-4 header-heading-title"} onClick={() => history.push(props.selectedSearchOptions)}>
              <Col>
                <span className={`d-flex align-items-center cursor-pointer ${styles.title}`}><ArrowLeftShort aria-label="Back" className={"d-inline-block me-2 fs-2 header-back-button"} />Back to results</span>
              </Col>
            </Row>
            <span className={styles.metadataCollapseIconContainer}>
              {metadataCollapse ? <span className={styles.metadataCollapseIcon}><span className={styles.collapseIconsAlignment} onClick={onCollapse} ><span><FontAwesomeIcon aria-label="collapsed" icon={faAngleDoubleLeft} size="lg" className={styles.collapseExpandIcons} data-testid="metadataIcon-collapsed" /></span>{" Metadata"}</span></span> :
                <span className={styles.metadataCollapseIcon}><span className={styles.collapseIconsAlignment} onClick={onCollapse} ><span><FontAwesomeIcon aria-label="expanded" icon={faAngleDoubleRight} size="lg" className={styles.collapseExpandIcons} data-testid="metadataIcon-expanded" /></span>{" Metadata"}</span></span>}
            </span>
          </div>
          <div>{nonEntityMenu()}</div>
          <div className={styles.download}>
            <a data-testid="download-link" onClick={download}><Download className={styles.downloadIcon}/> <span>{displayFileSize()}</span></a>
          </div>
          <div className={styles.documentContainer}>
            <div className={styles.contentElements}>{contentElements}</div>
          </div>
        </Content>
        <Sider
          trigger={null}
          collapsedWidth={0}
          collapsible
          collapsed={metadataCollapse}
          width={"45vw"}
          data-testid="sider-nonEntityDetailPage"
          className={styles.siderParent}
        >

          <div className={styles.siderContainerNonEntity}>
            <div>URI: <span className={styles.uri} data-testid="non-entity-document-uri">{props.uri}</span></div>
            <div>Document Quality: <span className={styles.quality} data-testid="non-entity-document-quality">{props.docQuality}</span></div>
            <div className={styles.sourcesMetadataTableContainer}>
              <div className={styles.metadataTableLabel} data-testid="non-entity-sources-label">Sources</div>
              <Table
                bordered
                className={styles.sourcesMetadataTable}
                rowKey="key"
                dataSource={props.sourcesTableData}
                columns={sourcesColumns}
                pagination={false}
                data-testid="sources-table"
              />
            </div>
            <div className={styles.historyMetadataTableContainer}>
              <div className={styles.metadataTableLabel} data-testid="non-entity-history-label">History</div>
              <Table
                bordered
                className={styles.historyMetadataTable}
                rowKey="key"
                dataSource={props.historyData}
                columns={historyColumns}
                pagination={false}
                data-testid="history-table"
              />
            </div>
            {
              (props.collections) &&
                <div className={styles.collectionsTableContainer}>
                  <div className={styles.collectionsTableLabel} data-testid="entity-collections-label">Collections</div>
                  <Table bordered dataSource={props.collections} columns={collectionColumns} className={styles.collectionsTable} data-testid="collections-table"/>
                </div>
            }
            {
              (props.recordPermissions) &&
                <div className={styles.recordPermissionsTableContainer}>
                  <div className={styles.recordPermissionsTableLabel} data-testid="entity-record-permissions-label">Permissions</div>
                  <Table bordered dataSource={props.recordPermissions} columns={recordPermissionsColumns} className={styles.recordPermissionsTable} data-testid="record-permissions-table"/>
                </div>
            }
            {
              (props.recordMetadata) &&
                <div className={styles.recordMetadataTableContainer}>
                  <div className={styles.recordMetadataTableLabel} data-testid="entity-record-metadata-label">Metadata Values</div>
                  <Table bordered dataSource={props.recordMetadata} columns={recordMetadataColumns} className={styles.recordMetadataTable} data-testid="record-metadata-table"/>
                </div>
            }
            <div className={styles.documentPropertiesContainer}>
              <div className={styles.documentPropertiesLabel} data-testid="entity-record-properties-label">Document Properties</div>
              {
                (props.documentProperties) ?
                  <pre data-testid="doc-properties-container">{xmlFormatter(props.documentProperties)}</pre>
                  : <p data-testid="doc-no-properties-message">This document has no properties.</p>
              }
            </div>
          </div>
        </Sider>
      </Layout>
    </div>
  );
};

export default DetailPageNonEntity;
