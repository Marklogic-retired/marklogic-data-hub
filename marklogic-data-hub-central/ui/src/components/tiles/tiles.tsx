import React, {useContext, useEffect, useRef, useState} from "react";
import {Mosaic, MosaicWindow} from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt, faCog} from "@fortawesome/free-solid-svg-icons";
import styles from "./tiles.module.scss";
import "./tiles.scss";
import Run from "../../pages/Run";
import {SearchContext} from "@util/search-context";
import {AuthoritiesContext} from "@util/authorities";
import QueryModal from "../queries/managing/manage-query-modal/manage-query";
import infoIcon from "../../assets/icon_helpInfo.png";
import {primaryEntityTypes} from "@api/modeling";
import {ToolbarBulbIconInfo} from "@config/tooltips.config";
import {ArrowsAngleContract, ArrowsAngleExpand, XLg} from "react-bootstrap-icons";
import {HCTooltip} from "@components/common";
import Popover from "react-bootstrap/Popover";
import {Dropdown, NavDropdown, OverlayTrigger} from "react-bootstrap";
import DataModelDisplaySettingsModal from "@components/explore/data-model-display-settings-modal/data-model-display-settings-modal";
import tooltipsConfig from "@config/explorer-tooltips.config";
import {convertArrayOfEntitiesToObject} from "@util/modeling-utils";
import {HubCentralConfigContext} from "@util/hubCentralConfig-context";

interface Props {
  id: string;
  view: any;
  currentNode: any;
  options: any;
  onMenuClick: any;
  onTileClose: any;
  newStepToFlowOptions: any;
}

const exploreSettingsTooltips = tooltipsConfig.exploreSettings;

const Tiles: React.FC<Props> = props => {
  const componentIsMounted = useRef(true);
  const options = props.options;
  const controls = props.options.controls;
  const viewId = props.id;
  const {savedQueries, entityDefinitionsArray} = useContext(SearchContext);
  const [manageQueryModal, setManageQueryModal] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const [exploreSettingsModal, setExploreSettingsModal] = useState(false);

  const [entityModels, setEntityModels] = useState<any>({});
  const {getHubCentralConfigFromServer} = useContext(HubCentralConfigContext);

  /*** For Manage Queries - Explore tab ****/
  const auth = useContext(AuthoritiesContext);
  const canExportQuery = auth.canExportEntityInstances();
  const isSavedQueryUser = auth.isSavedQueryUser();

  const queryModal = (
    <QueryModal
      canExportQuery={canExportQuery}
      isSavedQueryUser={isSavedQueryUser}
      modalVisibility={manageQueryModal}
      setManageQueryModal={setManageQueryModal}
      entityDefArray={entityDefinitionsArray}
    />
  );
  /******************************************/

  const showControl = control => {
    return controls.indexOf(control) !== -1;
  };

  const onChange = event => {
    console.warn("onChange", event);
  };

  const onRelease = event => {
    console.warn("onRelease", event);
  };

  // TODO Implement newTab feature
  const onClickNewTab = event => {
    console.warn("onClickNewTab", event);
  };

  // TODO Implement maximize feature
  const onClickMaximize = event => {
    console.warn("onClickMaximize", event);
  };

  // TODO Implement minimize feature
  const onClickMinimize = event => {
    console.warn("onClickMinimize", event);
  };

  const onClickClose = () => {
    props.onTileClose();
  };

  const onMenuClick = () => {
    setManageQueryModal(true);
    props.onMenuClick();
  };

  const onKeyDownClose = event => {
    if (event.key === "Enter") {
      onClickClose();
    }
  };

  useEffect(() => {
    getHubCentralConfigFromServer();
  }, []);

  useEffect(() => {
    if (showControl("menu") && viewId !== "monitor") {
      (async () => {
        try {
          const res = await primaryEntityTypes();
          if (res && componentIsMounted.current) {
            if (res.data.length !== 0) {
              setEntityModels({...convertArrayOfEntitiesToObject(res.data)});
            }
          }
        } catch (error) {
          let message = error;
          console.error("Error while getting entities", message);
        }
      })();
    }
    return () => {
      componentIsMounted.current = false;
    };
  }, []);

  const infoViewChange = visible => {
    if (visible) setInfoVisible(true);
    else setInfoVisible(false);
  };

  const handleExploreSettingsMenu = key => {
    if (key === "manageQueries") {
      onMenuClick();
    }
    if (key === "entityTypeDisplaySettings") {
      setExploreSettingsModal(true);
    }
  };

  const exploreSettingsMenu = (
    <NavDropdown
      aria-label="explore-settings-menu"
      id="explore-settings-menu"
      align="end"
      title={
        <HCTooltip
          text={exploreSettingsTooltips.exploreSettingsMenuIcon}
          id="explore-settings-tooltip"
          placement="bottom"
        >
          <span aria-label="explore-settingsIcon-menu">
            <FontAwesomeIcon icon={faCog} className={styles.settingsIcon} size="lg" />
          </span>
        </HCTooltip>
      }
      onSelect={handleExploreSettingsMenu}
    >
      <HCTooltip
        aria-label=""
        text={savedQueries && !savedQueries.length ? exploreSettingsTooltips.disabledManageQueryOption : ""}
        id="manage-queries-option-tooltip"
        placement="top"
      >
        <div>
          <Dropdown.Item eventKey="manageQueries" disabled={savedQueries && !savedQueries.length}>
            <span aria-label={"manageQueries"}>Manage saved queries</span>
          </Dropdown.Item>
        </div>
      </HCTooltip>
      <HCTooltip
        aria-label=""
        text={
          entityDefinitionsArray && !entityDefinitionsArray.length
            ? exploreSettingsTooltips.disabledEntityTypeDisplaySettingsOption
            : ""
        }
        id="entityTypeDisplaySettings-option-tooltip"
        placement="top"
      >
        <div>
          <Dropdown.Item
            eventKey="entityTypeDisplaySettings"
            disabled={entityDefinitionsArray && !entityDefinitionsArray.length}
          >
            <span aria-label={"entityTypeDisplaySettings"}>Data model display settings</span>
          </Dropdown.Item>
        </div>
      </HCTooltip>
    </NavDropdown>
  );

  const dataModelDisplaySettingsModal = (
    <DataModelDisplaySettingsModal
      isVisible={exploreSettingsModal}
      entityModels={entityModels}
      toggleModal={setExploreSettingsModal}
      entityDefinitionsArray={entityDefinitionsArray}
    />
  );

  const renderHeader = function (props) {
    return (
      <div
        className={styles.paneHeader}
        aria-label={"tile-header"}
        style={{backgroundColor: options["bgColor"], borderBottomColor: options["border"]}}
      >
        <div className={styles.title}>
          {options["iconType"] === "custom" ? (
            <>
              <span
                className={options["icon"] + "Header"}
                aria-label={"icon-" + viewId}
                style={{color: options["color"]}}
              />
              <div className={styles.exploreText} aria-label={"title-" + viewId}>
                {options["title"]}
              </div>
              {["model", "explore"].includes(viewId) && (
                <span id={`${viewId}Info`}>
                  <OverlayTrigger
                    show={infoVisible}
                    overlay={
                      <Popover id={`popover-tiles`} className={styles.popoverInfo}>
                        <Popover.Body className={styles.popoverInfoBody}>
                          {
                            {
                              "model": (
                                <div className={styles.infoPopover} aria-label="modelingInfo">
                                  {ToolbarBulbIconInfo.modelingInfo}
                                </div>
                              ),
                              "explore": (
                                <div className={styles.infoPopover} aria-label={`${viewId}Info`}>
                                  {ToolbarBulbIconInfo.exploreInfo}
                                </div>
                              ),
                            }[viewId]
                          }
                        </Popover.Body>
                      </Popover>
                    }
                    trigger="click"
                    placement="bottom-end"
                    rootClose
                    onToggle={infoViewChange}
                  >
                    <span className={styles.infoIcon} aria-label={`${viewId}InfoIcon`}>
                      <img src={infoIcon} />
                    </span>
                  </OverlayTrigger>
                </span>
              )}
            </>
          ) : (
            <>
              <i aria-label={"icon-" + viewId}>
                <FontAwesomeIcon style={{color: options["color"]}} icon={options["icon"]} />
              </i>
              <div className={styles.text} aria-label={"title-" + viewId}>
                {options["title"]}
              </div>
            </>
          )}
        </div>
        <div className={styles.controls}>
          {showControl("menu") && viewId !== "monitor" ? (
            <>
              <div>{exploreSettingsMenu}</div>
              {savedQueries && savedQueries.length > 0 ? manageQueryModal && queryModal : null}
            </>
          ) : null}
          {showControl("newTab") ? (
            <i
              className={styles.fa}
              aria-label={"newTab"}
              style={{color: options["controlColor"]}}
              onClick={onClickNewTab}
            >
              <HCTooltip text="Open in New Tab" id="new-tab-tooltip" placement="bottom">
                <i>
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </i>
              </HCTooltip>
            </i>
          ) : null}
          {showControl("maximize") ? (
            <i
              className={styles.ant}
              aria-label={"maximize"}
              style={{color: options["controlColor"]}}
              onClick={onClickMaximize}
            >
              <HCTooltip text="Maximize" id="maximize-tooltip" placement="bottom">
                <ArrowsAngleExpand />
              </HCTooltip>
            </i>
          ) : null}
          {showControl("minimize") ? (
            <i
              className={styles.ant}
              aria-label={"minimize"}
              style={{color: options["controlColor"]}}
              onClick={onClickMinimize}
            >
              <HCTooltip text="Minimize" id="minimize-tooltip" placement="bottom">
                <ArrowsAngleContract />
              </HCTooltip>
            </i>
          ) : null}
          {showControl("close") ? (
            <i
              className={styles.close}
              aria-label={"close"}
              style={{color: options["controlColor"]}}
              tabIndex={0}
              onClick={onClickClose}
              onMouseDown={onClickClose}
              onKeyDown={onKeyDownClose}
            >
              <HCTooltip text="Close" id="close-tooltip" placement="bottom">
                <XLg aria-label="close" />
              </HCTooltip>
            </i>
          ) : null}
        </div>
        {dataModelDisplaySettingsModal}
      </div>
    );
  };

  return (
    <>
      <Mosaic<string>
        renderTile={(id, path) => {
          return (
            <MosaicWindow<string> path={path} title={options["title"]} renderToolbar={renderHeader}>
              {!props.newStepToFlowOptions?.routeToFlow ? (
                props.view
              ) : (
                <Run newStepToFlowOptions={props.newStepToFlowOptions} />
              )}
            </MosaicWindow>
          );
        }}
        className={"mosaic-container mosaic-container-" + viewId}
        value={props.currentNode}
        onChange={onChange}
        onRelease={onRelease}
      />
    </>
  );
};

export default Tiles;
