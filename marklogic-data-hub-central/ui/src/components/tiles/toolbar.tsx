import React, {RefObject, useContext, useState} from "react";
import {useLocation} from "react-router-dom";

import styles from "./toolbar.module.scss";
import ConfirmationModal from "../confirmation-modal/confirmation-modal";
import {ConfirmationType} from "../../types/common-types";
import {ModelingContext} from "@util/modeling-context";
import ToolbarIcon from "./toolbar-icon";
import {Tiles, TileId} from "@config/tiles.config";
import {HCDivider} from "@components/common";

interface Props {
  tiles: Tiles;
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
  let tileRefs: RefObject<any>[] = [];
  for (let i = 0; i < Object.keys(tiles).length; ++i) tileRefs.push(React.createRef<HTMLDivElement>());

  const [showConfirmModal, toggleConfirmModal] = useState(false);
  const {modelingOptions} = useContext(ModelingContext);
  const [tileInfo, setTileInfo] = useState({});
  const location: any = useLocation();
  const activeTile = location.pathname.split("/").pop();

  const linkKeyDownHandler = (event: React.KeyboardEvent<any>, index: number) => {
    if (event.key === "ArrowUp" && index > 0) tileRefs[index - 1].current.focus();
    if (event.key === "ArrowDown" && index < (Object.keys(tiles).length - 1)) tileRefs[index + 1].current.focus();
  };

  const tileOnClickHandler = (id: TileId, index: number) => {
    if (modelingOptions.isModified) {
      let previousRouteId = location.pathname.split("/").pop();
      if (id !== ("model" as TileId) && previousRouteId === ("model" as TileId)) {
        setTileInfo({id: id, index: index});
        toggleConfirmModal(true);
      } else {
        tileRefs[index].current.click();
      }
    } else {
      tileRefs[index].current.click();
    }
  };

  /*
        structure of the toolbar:
                <tool>
                    <link/>
                </tool>

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
  const tilesIcons = Object.keys(tiles).map((id, i) => {
    return (
      <ToolbarIcon
        tileId={id as TileId}
        tile={tiles[id]}
        tileRef={tileRefs[i]}
        enabled={(props.enabled && props.enabled.includes(id))}
        i={i}
        isActive={(activeTile === id)}
        onClick={tileOnClickHandler}
        onKeyDown={linkKeyDownHandler}
      />
    );
  }
  );

  return (
    <div id={styles.toolbarContainer} aria-label={"toolbar"}>
      {tilesIcons[0]}
      {tilesIcons[1]}
      {tilesIcons[2]}
      <HCDivider/>
      {tilesIcons[3]}
      {tilesIcons[4]}
      <HCDivider/>
      {tilesIcons[5]}
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
