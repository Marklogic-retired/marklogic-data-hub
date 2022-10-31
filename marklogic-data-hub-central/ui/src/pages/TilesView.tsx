import React, {useState, useContext, useEffect} from "react";
import tiles from "@config/tiles.config";
import Toolbar from "@components/tiles/toolbar";
import Tiles from "@components/tiles/tiles";
import styles from "./TilesView.module.scss";
import "./TilesView.scss";
import {getEnvironment} from "@util/environment";
import {hubCentralConfig} from "../types/modeling-types";
import * as _ from "lodash";
import {UserContext} from "@util/user-context";
import Overview from "./Overview";
import Load from "./Load";
import Modeling from "./Modeling";
import Curate from "./Curate";
import Run from "./Run";
import Monitor from "./Monitor";
import Browse from "./Browse";
import Detail from "./Detail";
import {Modal} from "react-bootstrap";
import MatchingDetailStep from "@components/entities/matching/matching-step-detail/matching-step-detail";
import {AuthoritiesContext} from "@util/authorities";
import {SearchContext} from "@util/search-context";
import {useHistory, useLocation} from "react-router-dom";
import MergingStepDetail from "@components/entities/merging/merging-step-detail/merging-step-detail";
import MappingStepDetail from "@components/entities/mapping/mapping-step-detail/mapping-step-detail";
import {ErrorMessageContext} from "@util/error-message-context";
import {HCButton, HCModal} from "@components/common";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {HubCentralConfigContext} from "@util/hubCentralConfig-context";

export type TileId = "load" | "model" | "curate" | "run" | "explore" | "monitor" | "detail";
export type IconType = "fa" | "custom";
interface TileItem {
    title: string;
    iconType: IconType;
    icon: any;
    color: string;
    bgColor: string;
    border: string;
}

const INITIAL_SELECTION = ""; // '' for no tile initially

const TilesView = (props) => {
  const {handleError} = useContext(UserContext);
  const {hubCentralConfig, getHubCentralConfigFromServer, updateHubCentralConfigOnServer} = useContext(HubCentralConfigContext);
  const [selection, setSelection] = useState<TileId | string>(INITIAL_SELECTION);
  const [currentNode, setCurrentNode] = useState<any>(INITIAL_SELECTION);
  const [options, setOptions] = useState<TileItem|null>(null);

  const history: any = useHistory();
  const location: any = useLocation();

  const setCurateView = () => {
    if (location.pathname.startsWith("/tiles/curate/match")) {
      return <MatchingDetailStep/>;
    } else if (location.pathname.startsWith("/tiles/curate/merge")) {
      return <MergingStepDetail/>;
    } else if (location.pathname.startsWith("/tiles/curate/map")) {
      return <MappingStepDetail/>;
    } else {
      return <Curate/>;
    }
  };

  const views: Record<TileId, JSX.Element> = {
    load: <Load />,
    model: <Modeling />,
    curate: setCurateView(),
    run: <Run />,
    explore: <Browse/>,
    detail: <Detail />,
    monitor: <Monitor />
  };

  const {
    setView,
    searchOptions
  } = useContext(SearchContext);
  const {errorMessageOptions, setErrorMessageOptions} = useContext(ErrorMessageContext);

  const onMenuClick = () => {
    //Logic can be added here if menu is changed/added for any tile
  };

  const onTileClose = () => {
    setSelection(INITIAL_SELECTION);
    setCurrentNode(INITIAL_SELECTION); // TODO Handle multiple with nested objects
    setOptions(null);
    setView("", null);
    history.push("/tiles");
  };

  // For role-based privileges
  const auth = useContext(AuthoritiesContext);
  const enabledViews: Record<TileId, boolean> = {
    load: auth.canReadLoad() || auth.canWriteLoad(),
    model: auth.canReadEntityModel() || auth.canWriteEntityModel(),
    curate: auth.canReadMapping() || auth.canWriteMapping() || auth.canReadMatchMerge() || auth.canWriteMatchMerge() || auth.canReadCustom(),
    run: auth.canReadFlow() || auth.canWriteFlow(),
    explore: true,
    detail: true,
    monitor: auth.canAccessMonitor()
    // TODO - Needs to be updated if there are any changes in authorities for Explorer
    // explore: auth.canReadFlow() || auth.canWriteFlow(),
  };
  const enabled = Object.keys(enabledViews).filter(key => enabledViews[key]);

  useEffect(() => {
    if (props.id) {
      setSelection(props.id);
      setCurrentNode(props.id); // TODO Handle multiple with nested objects
      setOptions(tiles[props.id]);
      setView(props.id, views[props.id]);
    }
    return (() => {
      setSelection(INITIAL_SELECTION);
      setCurrentNode(INITIAL_SELECTION); // TODO Handle multiple with nested objects
      setOptions(null);
      setView("", null);
    });
  }, []);

  useEffect(() => {
    getHubCentralConfigFromServer();
  }, []);

  useEffect(() => {
    if (hubCentralConfig.hasOwnProperty("modeling") && !hubCentralConfig["modeling"].hasOwnProperty("concepts")) {
      let updatedPayload = _.cloneDeep(hubCentralConfig);
      updatedPayload.modeling["concepts"] = {};
      publishHubCentralConfig(updatedPayload);
    }
  }, [hubCentralConfig]);

  const publishHubCentralConfig = async (hubCentralConfig: hubCentralConfig) => {
    try {
      updateHubCentralConfigOnServer(hubCentralConfig);
    } catch (error) {
      handleError(error);
    }
  };

  const getNewStepToFlowOptions = () => {
    return {
      routeToFlow: props.routeToFlow,
      addingStepToFlow: props.addingStepToFlow,
      startRunStep: props.startRunStep,
      flowName: location.state?.flowName,
      newStepName: location.state?.stepToAdd,
      stepDefinitionType: location.state?.stepDefinitionType,
      viewMode: location.state?.viewMode,
      pageSize: location.state?.pageSize,
      page: location.state?.page,
      sortOrderInfo: location.state?.sortOrderInfo,
      targetEntityType: location.state?.targetEntityType,
      existingFlow: location.state?.existingFlow || false,
      flowsDefaultKey: location.state?.flowsDefaultKey || ["-1"]
    };
  };

  return (
    <>
      { (searchOptions.view !== null) ?  (
        <div className={styles.tilesViewContainer}>
          { (selection !== "") ?  (
            <Tiles
              id={selection}
              view={searchOptions.view}
              currentNode={currentNode}
              options={options}
              onMenuClick={onMenuClick}
              onTileClose={onTileClose}
              newStepToFlowOptions={getNewStepToFlowOptions()}
            />
          ) : null }
        </div>) :
        <Overview enabled={enabled} environment={getEnvironment()}/>
      }
      <Toolbar tiles={tiles} enabled={enabled} />
      <HCModal
        show={errorMessageOptions.isVisible}
        onHide={() => setErrorMessageOptions({isVisible: false, message: ""})}
      >
        <Modal.Body className={"pt-5 pb-4"}>
          <div className={"d-flex align-items-start justify-content-center"}>
            <FontAwesomeIcon icon={faTimesCircle} className={"text-danger me-4 fs-3"} />{errorMessageOptions.message}
          </div>
          <div className={"d-flex justify-content-end pt-4 pb-2"}>
            <HCButton aria-label={"Ok"} variant="primary" type="submit" onClick={() => setErrorMessageOptions({isVisible: false, message: ""})}>
              Ok
            </HCButton>
          </div>
        </Modal.Body>
      </HCModal>
    </>
  );
};

export default TilesView;
