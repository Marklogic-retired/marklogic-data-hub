import React, {useContext, useEffect, useState} from "react";
import {Mosaic, MosaicWindow} from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import {ArrowsAltOutlined, ShrinkOutlined, CloseOutlined} from "@ant-design/icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt, faCog} from "@fortawesome/free-solid-svg-icons";
import styles from "./tiles.module.scss";
import "./tiles.scss";
import Run from "../../pages/Run";
import {SearchContext} from "../../util/search-context";
import {AuthoritiesContext} from "../../util/authorities";
import QueryModal from "../queries/managing/manage-query-modal/manage-query";
import modelingInfoIcon from "../../assets/icon_helpInfo.png";
import {Popover, Button} from "antd";
import {primaryEntityTypes} from "../../api/modeling";
import {ToolbarBulbIconInfo} from "../../config/tooltips.config";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";

interface Props {
    id: string;
    view: any;
    currentNode: any;
    options: any;
    onMenuClick: any;
    onTileClose: any;
    newStepToFlowOptions: any;
}

const Tiles: React.FC<Props> = (props) => {

  const options = props.options;
  const controls = props.options.controls;
  const viewId = props.id;
  const {savedQueries, entityDefinitionsArray} = useContext(SearchContext);
  const [manageQueryModal, setManageQueryModal]= useState(false);
  const [modelingInfoVisible, setModelingInfoVisible] = useState(false);

  /*** For Manage Queries - Explore tab ****/
  const auth = useContext(AuthoritiesContext);
  const canExportQuery = auth.canExportEntityInstances();
  const isSavedQueryUser = auth.isSavedQueryUser();

  const queryModal = <QueryModal
    canExportQuery={canExportQuery}
    isSavedQueryUser={isSavedQueryUser}
    modalVisibility={manageQueryModal}
    setManageQueryModal={setManageQueryModal}
    entityDefArray={entityDefinitionsArray}
  />;
  /******************************************/

  const modelInfo = <div className={styles.modelingInfoPopover} aria-label="modelingInfo">{ToolbarBulbIconInfo.modelingInfo}</div>;

  const showControl = (control) => {
    return controls.indexOf(control) !== -1;
  };

  const onChange = (event) => {
    console.warn("onChange", event);
  };

  const onRelease = (event) => {
    console.warn("onRelease", event);
  };

  // TODO Implement newTab feature
  const onClickNewTab = (event) => {
    console.warn("onClickNewTab", event);
  };

  // TODO Implement maximize feature
  const onClickMaximize = (event) => {
    console.warn("onClickMaximize", event);
  };

  // TODO Implement minimize feature
  const onClickMinimize = (event) => {
    console.warn("onClickMinimize", event);
  };

  const onClickClose = () => {
    props.onTileClose();
  };

  const getEntities = async () => {
    try {
      const res= await primaryEntityTypes();
      if (res) {
        if (res.data.length === 0) setModelingInfoVisible(true);
      }
    } catch (error) {
      let message = error;
      console.error("Error while getting entities", message);
    }
  };

  const onMenuClick = () => {
    setManageQueryModal(true);
    props.onMenuClick();
  };

  const onKeyDownClose = (event) => {
    if (event.key === "Enter") {
      onClickClose();
    }
  };

  useEffect(() => {
    getEntities();
  }, []);

  const modelingInfoViewChange = (visible) => {
    if (visible) setModelingInfoVisible(true);
    else setModelingInfoVisible(false);
  };


  const renderHeader = function (props) {
    return (
      <div
        className={styles.paneHeader}
        style={{backgroundColor: options["bgColor"], borderBottomColor: options["border"]}}
      >
        <div className={styles.title}>
          {(options["iconType"] === "custom") ? (<>
            <span className={options["icon"] + "Header"} aria-label={"icon-" + viewId} style={{color: options["color"]}}></span>
            <div className={styles.exploreText} aria-label={"title-" + viewId}>{options["title"]}</div>
            {viewId === "model" && <span id="modelInfo"><Popover
              visible={modelingInfoVisible}
              content={modelInfo}
              trigger="click"
              placement="bottomRight"
              overlayStyle={{
                width: "40vw"
              }}
              onVisibleChange={modelingInfoViewChange}
            >
              <span className={styles.modelingInfoIcon} aria-label="modelInfoIcon"><img src={modelingInfoIcon}/></span></Popover></span>}
          </>) : (<>
            <i aria-label={"icon-" + viewId}>
              <FontAwesomeIcon style={{color: options["color"]}} icon={options["icon"]} />
            </i>
            <div className={styles.text} aria-label={"title-" + viewId}>{options["title"]}</div>
          </>)}
        </div>
        <div className={styles.controls}>
          {showControl("menu") ? (
            savedQueries.length ? ( // only display if there are saved queries
              <>
                <div>
                  <i className={styles.faCog} aria-label={"menu"} style={{color: options["color"]}}>
                    <Button id="manage-queries-button" onClick={onMenuClick} style={{height: "25px"}}>
                      <FontAwesomeIcon icon={faCog} style={{color: "#394494", fontSize: "14px", paddingRight: "4px", paddingTop: "1px"}} /> Manage Queries
                    </Button>
                  </i>
                </div>
                {manageQueryModal && queryModal}
              </>
            ) : null
          ) : null}
          {showControl("newTab") ? (
            <i className={styles.fa} aria-label={"newTab"} style={{color: options["controlColor"]}} onClick={onClickNewTab}>
              <HCTooltip text="Open in New Tab" id="new-tab-tooltip" placement="bottom">
                <i>
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </i>
              </HCTooltip>
            </i>) : null}
          {showControl("maximize") ? (
            <i className={styles.ant} aria-label={"maximize"} style={{color: options["controlColor"]}} onClick={onClickMaximize}>
              <HCTooltip text="Maximize" id="maximize-tooltip" placement="bottom">
                <ArrowsAltOutlined />
              </HCTooltip>
            </i>) : null}
          {showControl("minimize") ? (
            <i className={styles.ant} aria-label={"minimize"} style={{color: options["controlColor"]}} onClick={onClickMinimize}>
              <HCTooltip text="Minimize" id="minimize-tooltip" placement="bottom">
                <ShrinkOutlined />
              </HCTooltip>
            </i>) : null}
          {showControl("close") ? (
            <i className={styles.close} aria-label={"close"} style={{color: options["controlColor"]}} tabIndex={0}
              onClick={onClickClose} onMouseDown={onClickClose} onKeyDown={onKeyDownClose}>
              <HCTooltip text="Close" id="close-tooltip" placement="bottom">
                <CloseOutlined />
              </HCTooltip>
            </i>
          ) : null}
        </div>
      </div>
    );
  };

  return (<>
    <Mosaic<string>
      renderTile={(id, path) => {
        return (
          <MosaicWindow<string>
            path={path}
            title={options["title"]}
            renderToolbar={renderHeader}
          >
            {!props.newStepToFlowOptions?.routeToFlow ? props.view : <Run newStepToFlowOptions={props.newStepToFlowOptions}/>}
          </MosaicWindow>
        );
      }}
      className={"mosaic-container mosaic-container-" + viewId}
      value={props.currentNode}
      onChange={onChange}
      onRelease={onRelease}
    />
  </>);
};

export default Tiles;
