import React, {CSSProperties, useContext} from "react";
import styles from "./record-view.module.scss";
import {Popover} from "antd";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {FileOutlined} from "@ant-design/icons";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import ReactHtmlParser from "react-html-parser";
import {Link} from "react-router-dom";
import sourceFormatOptions from "../../config/formats.config";
import {AuthoritiesContext} from "../../util/authorities";
import {formatCardUri} from "../../util/conversionFunctions";
import {CardViewDateConverter} from "../../util/date-conversion";
import {SearchContext} from "../../util/search-context";
import {getRecord} from "../../api/record";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {Download} from "react-bootstrap-icons";
import HCCard from "../common/hc-card/hc-card";

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
            <HCTooltip
              text={displayRecordSources(item)}
              id="source-tooltip"
              placement="bottom"
              //width={"200px"} // DHFPROD-7711 MLTooltip -> Tooltip
            ><span>{displayRecordSources(item).substring(0, 28)}</span></HCTooltip>
          </span> : emptyField}
          {item.hubMetadata?.lastProcessedByFlow ? <span className={styles.valText} data-testid={item.uri + "-lastProcessedByFlow"}>
            <HCTooltip
              text={item.hubMetadata?.lastProcessedByFlow}
              id="last-processed-by-flow-tooltip"
              placement="bottom"
              //width={"200px"} // DHFPROD-7711 MLTooltip -> Tooltip
            ><span>{item.hubMetadata?.lastProcessedByFlow}</span></HCTooltip>
          </span> : emptyField}
          {item.hubMetadata?.lastProcessedByStep ? <span className={styles.valText} data-testid={item.uri + "-lastProcessedByStep"}>
            <HCTooltip
              text={item.hubMetadata.lastProcessedByStep}
              id="last-processed-by-step-tooltip"
              placement="bottom"
              //width={"200px"} // DHFPROD-7711 MLTooltip -> Tooltip
            ><span>{item.hubMetadata.lastProcessedByStep}</span></HCTooltip>
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
              <HCCard
                className={styles.cardStyle}
              >
                <div className={styles.cardMetadataContainer}>
                  <span className={styles.uriContainer} data-testid={elem.uri + "-URI"}>URI: <span className={styles.uri}>
                    <HCTooltip text={elem.uri} id="element-uri-tooltip" placement="bottom">
                      <span>{displayUri(elem.uri)}</span>
                    </HCTooltip>
                  </span></span>
                  <span className={styles.cardIcons}>
                    <Popover getPopupContainer={trigger => trigger.parentElement || document.body} content={displayRecordMetadata(elem)} placement="bottomRight" trigger="click">
                      <span>
                        <HCTooltip text={"View info"} id="view-info-tooltip" placement="bottom">
                          <span className={styles.infoIcon}>
                            <i><FontAwesomeIcon icon={faInfoCircle} size="1x" data-testid={elem.uri + "-InfoIcon"}/></i>
                          </span>
                        </HCTooltip>
                      </span>
                    </Popover>
                    <span className={styles.sourceFormat}
                      style={sourceFormatStyle(elem.format)}
                      data-testid={elem.uri + "-sourceFormat"}
                    >{sourceFormatOptions[elem.format].label}</span>
                    {elem.format === "binary" ?
                      <span id={"instance"}
                        data-cy="instance">
                        <HCTooltip text="Detail view" id="binary-detail-view-tooltip" placement="bottom">
                          <i role="detail-link icon" data-testid={elem.uri + "-detailViewIcon"}>
                            <FontAwesomeIcon icon={faExternalLinkAlt} className={styles.detailLinkIconDisabled} size="lg" />
                          </i>
                        </HCTooltip>
                      </span>
                      :
                      <Link to={getLinkProperties(elem)} id={"instance"}
                        data-cy="instance">
                        <HCTooltip text="Detail view" id="detail-view-tooltip" placement="bottom">
                          <i role="detail-link icon" data-testid={elem.uri + "-detailViewIcon"}>
                            <FontAwesomeIcon icon={faExternalLinkAlt} className={styles.detailLinkIcon} size="lg" />
                          </i>
                        </HCTooltip>
                      </Link>
                    }
                  </span>
                </div>
                <div className={styles.snippetContainer} data-testid={elem.uri + "-snippet"} >
                  {displaySnippet(elem)}
                </div>
                <span className={styles.downloadIcon}>
                  <HCTooltip text={displayFileSize(elem)} id="download-icon-tooltip" placement="bottom" >
                    <Download onClick={() => download(elem.uri)} data-testid={elem.uri + "-download-icon"}  size={13} />
                  </HCTooltip>
                </span>
              </HCCard>
            </div>
          </Col>)) : <span></span>}
      </Row>
    </div>
  );
};

export default RecordCardView;
