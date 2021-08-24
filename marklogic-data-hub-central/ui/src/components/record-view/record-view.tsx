import React, {CSSProperties, useContext} from "react";
import styles from "./record-view.module.scss";
import {Card, Icon, Popover, Tooltip} from "antd";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import {AuthoritiesContext} from "../../util/authorities";
import {formatCardUri} from "../../util/conversionFunctions";
import sourceFormatOptions from "../../config/formats.config";
import ReactHtmlParser from "react-html-parser";
import {FileOutlined} from "@ant-design/icons";
import {CardViewDateConverter} from "../../util/date-conversion";
import {Link} from "react-router-dom";
import {SearchContext} from "../../util/search-context";
import {getRecord} from "../../api/record";

const RecordCardView = (props) => {
  const authorityService = useContext(AuthoritiesContext);  // eslint-disable-line @typescript-eslint/no-unused-vars
  const {
    searchOptions
  } = useContext(SearchContext);

  const handleDetailViewNavigation = () => { }; // eslint-disable-line @typescript-eslint/no-unused-vars

  // Custom CSS for source Format
  const sourceFormatStyle = (sourceFmt) => {
    let customStyles: CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: "20px",
      width: "20px",
      lineHeight: "20px",
      backgroundColor: sourceFormatOptions[sourceFmt].color,
      fontSize: sourceFmt === "json" ? "8px" : "8.5px",
      borderRadius: "50%",
      textAlign: "center",
      color: "#ffffff",
      verticalAlign: "middle",
      marginRight: "8px"
    };
    return customStyles;
  };

  const displayUri = (uri) => {
    return formatCardUri(uri);
  };

  const displaySnippet = (item) => {
    if (["json", "xml", "text"].includes(item.format)) {
      let str = "";
      item.matches.forEach(item => {
        item["match-text"].forEach(element => {
          if (typeof element === "object") {
            str = str.concat("<b>").concat(element.highlight).concat("</b>").concat("...");
          } else {
            str = str.concat(element);
          }
        });
      });
      return <p>{ReactHtmlParser(str)}</p>;
    } else if ("binary" === item.format) {
      return (
        <div className={styles.binaryCard} >
          <FileOutlined className={styles.binaryIcon} />
          <div className={styles.binaryText} data-testid={item.uri + "-noPreview"}> No preview available</div>
        </div>
      );
    }
  };

  const displayRecordSources = (item) => {
    let sources = item.hubMetadata?.sources.map((record) => {
      return record.datahubSourceName;
    }).join(", ");
    return sources;
  };

  const emptyField = (
    <p className={styles.textDisabled}>none</p>
  );

  const displayRecordMetadata = (item) => {
    return (
      <div className={styles.popover} data-testid={item.uri + "-popover"}>
        <div className={styles.colKey}>
          <p>Source:</p>
          <p>Flow:</p>
          <p>Step:</p>
          <p>Created On:</p>
        </div>
        <div className={styles.colValue}>
          {item.hubMetadata?.sources?.length > 0 ? <span className={styles.valText} data-testid={item.uri + "-sources"}>
            <Tooltip
              title={displayRecordSources(item)}
              placement="bottom"
              //width={"200px"} // DHFPROD-7711 MLTooltip -> Tooltip
            >{displayRecordSources(item).substring(0, 28)}</Tooltip>
          </span> : emptyField}
          {item.hubMetadata?.lastProcessedByFlow ? <span className={styles.valText} data-testid={item.uri + "-lastProcessedByFlow"}>
            <Tooltip
              title={item.hubMetadata?.lastProcessedByFlow}
              placement="bottom"
              //width={"200px"} // DHFPROD-7711 MLTooltip -> Tooltip
            >{item.hubMetadata?.lastProcessedByFlow}</Tooltip>
          </span> : emptyField}
          {item.hubMetadata?.lastProcessedByStep ? <span className={styles.valText} data-testid={item.uri + "-lastProcessedByStep"}>
            <Tooltip
              title={item.hubMetadata.lastProcessedByStep}
              placement="bottom"
              //width={"200px"} // DHFPROD-7711 MLTooltip -> Tooltip
            >{item.hubMetadata.lastProcessedByStep}</Tooltip>
          </span> : emptyField}
          {item.hubMetadata?.lastProcessedDateTime ? <span className={styles.valText} data-testid={item.uri + "-lastProcessedDateTime"}>
            {CardViewDateConverter(item.hubMetadata?.lastProcessedDateTime)}
          </span> : emptyField}
        </div>
      </div>
    );
  };

  const getLinkProperties = (elem) => {
    let sources = elem.hubMetadata && elem.hubMetadata.hasOwnProperty("sources") ? elem.hubMetadata["sources"] : [];

    let linkObject = {
      pathname: "/tiles/explore/detail", state: {
        selectedValue: "instance",
        entity: searchOptions.entityTypeIds,
        pageNumber: searchOptions.pageNumber,
        start: searchOptions.start,
        searchFacets: searchOptions.selectedFacets,
        query: searchOptions.query,
        tableView: props.tableView,
        sortOrder: searchOptions.sortOrder,
        sources: sources,
        primaryKey: elem.primaryKey?.propertyPath === "uri" ? "" : elem.primaryKey?.propertyValue,
        uri: elem.uri,
        entityInstance: elem.entityInstance ? elem.entityInstance : undefined,
        database: searchOptions.database,
        isEntityInstance: false,
        targetDatabase: searchOptions.database
      }
    };

    return linkObject;
  };

  const download = async (docUri) => {
    try {
      const response = await getRecord(docUri, searchOptions.database);
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

  const displayFileSize = (elem) => {
    let size = elem.documentSize?.hasOwnProperty("value") ? elem.documentSize?.value : "";
    let unit = elem.documentSize?.hasOwnProperty("units") ? elem.documentSize?.units : "";
    return `Download (${size} ${unit})`;
  };

  return (
    <div id="record-data-card" aria-label="record-data-card" className={styles.recordDataCard}>
      <Row>
        {props.data && props.data.length > 0 ? props.data.map((elem, index) => (
          <Col xs={"auto"} key={index}>
            <div >
              <Card
                className={styles.cardStyle}
                size="small"
              >
                <div className={styles.cardMetadataContainer}>
                  <span className={styles.uriContainer} data-testid={elem.uri + "-URI"}>URI: <span className={styles.uri}>
                    <Tooltip title={elem.uri} placement="bottom">{displayUri(elem.uri)}</Tooltip></span></span>
                  <span className={styles.cardIcons}>
                    <Popover getPopupContainer={trigger => trigger.parentElement || document.body} content={displayRecordMetadata(elem)} placement="bottomRight" trigger="click">
                      <span>
                        <Tooltip title={"View info"} placement="bottom">
                          <span className={styles.infoIcon}><Icon type="info-circle" theme="filled" data-testid={elem.uri + "-InfoIcon"} /></span>
                        </Tooltip>
                      </span>
                    </Popover>
                    <span className={styles.sourceFormat}
                      style={sourceFormatStyle(elem.format)}
                      data-testid={elem.uri + "-sourceFormat"}
                    >{sourceFormatOptions[elem.format].label}</span>
                    {elem.format === "binary" ?
                      <span id={"instance"}
                        data-cy="instance">
                        <Tooltip title={"Detail view"} placement="bottom"
                        ><i role="detail-link icon" data-testid={elem.uri + "-detailViewIcon"}><FontAwesomeIcon icon={faExternalLinkAlt} className={styles.detailLinkIconDisabled} size="lg" /></i>
                        </Tooltip>
                      </span>
                      :
                      <Link to={getLinkProperties(elem)} id={"instance"}
                        data-cy="instance">
                        <Tooltip title={"Detail view"} placement="bottom"
                        ><i role="detail-link icon" data-testid={elem.uri + "-detailViewIcon"}><FontAwesomeIcon icon={faExternalLinkAlt} className={styles.detailLinkIcon} size="lg" /></i>
                        </Tooltip>
                      </Link>
                    }
                  </span>
                </div>
                <div className={styles.snippetContainer} data-testid={elem.uri + "-snippet"} >
                  {displaySnippet(elem)}
                </div>
              </Card>
              <span className={styles.downloadIcon}>
                <Tooltip title={displayFileSize(elem)} placement="bottom" >
                  <span><Icon type="download" onClick={() => download(elem.uri)} data-testid={elem.uri + "-download-icon"} /></span>
                </Tooltip>
              </span>
            </div>
          </Col>)) : <span></span>}
      </Row>
    </div>
  );
};

export default RecordCardView;
