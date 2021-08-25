import React, {CSSProperties, useContext, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import styles from "./toolbar.module.scss";
import "./toolbar.scss";
import ConfirmationModal from "../confirmation-modal/confirmation-modal";
import {ConfirmationType} from "../../types/common-types";
import {ModelingContext} from "../../util/modeling-context";
import HCTooltip from "../common/hc-tooltip/hc-tooltip";


interface Props {
    tiles: any;
    enabled: any;
}

const Toolbar: React.FC<Props> = (props) => {

  const allTiles = props.tiles; // config/tiles.config.ts
  const tiles: any = {};
  // Filter out tiles that should not be displayed in the toolbar.
  for (let key of Object.keys(allTiles)) {
    if (allTiles[key].toolbar) {
      tiles[key] = allTiles[key];
    }
  }

  // array of references used to set focus
  let tileRefs : any[] = [];
  for (let i = 0; i < Object.keys(tiles).length; ++i) tileRefs.push(React.createRef<HTMLDivElement>());

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const {modelingOptions} = useContext(ModelingContext);
  const [tileInfo, setTileInfo] = useState({});
  const location:any = useLocation();


  const getTooltip = (id) => {
    if (props.enabled && props.enabled.includes(id)) {
      return tiles[id]["title"];
    } else {
      return `${tiles[id]["title"]}: Contact your security administrator to get the roles and permissions required to access this functionality.`;
    }
  };

  const getIconStyle = (id) => {
    let disabled: CSSProperties = {
      color: "grey",
      opacity: "0.5",
      cursor: "not-allowed"
    };
    let enabled: CSSProperties = {
      color: tiles[id]["color"],
      cursor: "pointer"
    };
    return (props.enabled && props.enabled.includes(id)) ? enabled : disabled;
  };

  const linkKeyDownHandler = (event, id, index) => {
    if (event.key === "ArrowUp" && index > 0) tileRefs[index-1].current.focus();
    if (event.key === "ArrowDown" && index < (Object.keys(tiles).length - 1)) tileRefs[index+1].current.focus();
  };

  const tileOnClickHandler = (id, index) => {
    if (modelingOptions.isModified) {
      let previousRouteId = location.pathname.split("/").pop();
      if (id !== "model" && previousRouteId === "model") {
        setTileInfo({id: id, index: index});
        toggleConfirmModal(true);
      } else {
        if (props.enabled && props.enabled.includes(id)) tileRefs[index].current.click();
      }
    } else {
      if (props.enabled && props.enabled.includes(id)) tileRefs[index].current.click();
    }
  };

  const linkOnClickHandler = (event, id) => {
    if (!props.enabled || !props.enabled.includes(id)) event.preventDefault();
  };

  /**
        structure of the toolbar:
            <wrapper>
                <tool>
                    <link/>
                </tool>
            </wrapper>

        the wrapper is used for spacing on the toolbar.  every wrapper (except curate) is 80px tall,
            leaving 40px of space between each tool icon.  this is defined in "./toolbar.module.scss".
            this object cannot be tabbed to.

        the tool div object is used for highlights.  when the link inside is in focus, a shadow is
            is drawn around the icon to signify that it is currently selected.  this is defined in
            "./toolbar.scss".  this object cannot be tabbed to.

        the link object is the actual link to the tile.  clicking on the link will redirect the
            current webpage to the tile.  pressing up and down arrow keys will go to the next or
            previous link.  pressing enter will follow the link.  this object is not rendered, but
            can be tabbed to.

            note that the shadow is drawn on the parent div object when this object is tabbed to or
            navigated to using arrow keys.
    */

  const confirmTileClick = () => {
    toggleConfirmModal(false);
    if (tileInfo) {
      if (props.enabled && props.enabled.includes(tileInfo["id"])) tileRefs[tileInfo["index"]].current.click();
    }
  };

  return (
    <div id={styles.toolbar} aria-label={"toolbar"}>
      {Object.keys(tiles).map((id, i) => {
        if (tiles[id]["iconType"] === "custom") {
          return (
            <div className={(tiles[id]["title"] === "Explore" || tiles[id]["title"] ===  "Curate") ? styles.toolTallWrapper : styles.toolWrapper} aria-label={`tool-${id}-wrapper`} key={`tool-${id}-wrapper`} tabIndex={-1}>
              <HCTooltip text={getTooltip(id)} id={getTooltip(id)+"-tooltip"} placement="left-start" key={i}>
                <div
                  className={tiles[id]["icon"]}
                  aria-label={"tool-" + id}
                  style={getIconStyle(id)}
                  tabIndex={-1}
                  onClick={(e) => tileOnClickHandler(id, i)}
                >
                  <Link to={
                    {pathname: `/tiles/${id}`,
                      state: {
                        tileIconClicked: true
                      }}}
                  aria-label={"tool-" + id + "-link"}
                  tabIndex={0}
                  ref={tileRefs[i]}
                  onClick={(e) => linkOnClickHandler(e, id)}
                  onKeyDown={(e) => linkKeyDownHandler(e, id, i)}
                  />
                </div>
              </HCTooltip>
            </div>
          );
        } else {
          return (
            <div className={styles.toolWrapper} aria-label={"tool-" + id + "-wrapper"} tabIndex={-1}>
              <HCTooltip text={getTooltip(id)} id={getTooltip(id)+"-tooltip"} placement="left-start" key={i}>
                <i
                  className={styles.tool}
                  aria-label={"tool-" + id}
                  style={getIconStyle(id)}
                  tabIndex={-1}
                  onClick={(e) => tileOnClickHandler(id, i)}
                >
                  <Link to={"/tiles/" + id}
                    aria-label={"tool-" + id + "-link"}
                    tabIndex={0}
                    ref={tileRefs[i]}
                    onClick={(e) => linkOnClickHandler(e, id)}
                    onKeyDown={(e) => linkKeyDownHandler(e, id, i)}
                  />
                  <FontAwesomeIcon icon={tiles[id]["icon"]} size="lg" />
                </i>
              </HCTooltip>
            </div>
          );
        }
      }
      )}
      <ConfirmationModal
        isVisible={showConfirmModal}
        type={ConfirmationType.NavigationWarn}
        boldTextArray={[]}
        toggleModal={toggleConfirmModal}
        confirmAction={confirmTileClick}
      />
    </div>
  );
};

export default Toolbar;
